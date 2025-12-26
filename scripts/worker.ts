import 'dotenv/config'
import { Worker } from 'bullmq'
import dbConnect from '@/lib/dbConnect'
import FileModel from '@/models/files'
import { connection } from '@/lib/queue'
import { ensureIndex, addDocuments } from '@/lib/meilisearch'

const worker = new Worker(
  'indexing',
  async job => {
    const data = job.data as { id?: string }
    if (!data?.id) throw new Error('Job payload missing id')

    await dbConnect()
    const file: any = await FileModel.findById(data.id).lean()
    if (!file || Array.isArray(file)) throw new Error('File not found or invalid: ' + data.id)

    const doc = {
      id: file._id?.toString?.() || '',
      filename: file.filename,
      ownerId: file.ownerId?.toString?.() || '',
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      tags: file.tags || [],
      text: file.extractedText || '',
      cloudinaryUrl: file.cloudinaryUrl || '',
      isFolder: file.isFolder,
      parentFolderId: file.parentFolderId?.toString?.() || null,
      isRoot: file.isRoot,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt?.toISOString(),
      updatedAt: file.updatedAt?.toISOString(),
    }

    // ensure index exists and index the document
    await ensureIndex('files', { primaryKey: 'id' })
    await addDocuments('files', [doc])

    // mark as indexed (best-effort)
    try {
      await FileModel.findByIdAndUpdate(data.id, { indexed: true })
    } catch (e) {
      console.warn('Failed to mark file indexed', e)
    }

    return { indexed: data.id }
  },
  { connection }
)

worker.on('completed', job => console.log('Index job completed', job.id))
worker.on('failed', (job, err) => console.error('Index job failed', job?.id, err))

console.log('Worker started: indexing')
