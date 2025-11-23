import 'dotenv/config'
import { Worker, QueueScheduler } from 'bullmq'
import dbConnect from '@/lib/dbConnect'
import FileModel from '@/models/files'
import { connection } from '@/lib/queue'
import { ensureIndex, addDocuments } from '@/lib/meilisearch'

// Create a scheduler to handle stalled jobs
new QueueScheduler('indexing', { connection })

const worker = new Worker(
  'indexing',
  async job => {
    const data = job.data as { id?: string }
    if (!data?.id) throw new Error('Job payload missing id')

    await dbConnect()
    const file = await FileModel.findById(data.id).lean()
    if (!file) throw new Error('File not found: ' + data.id)

    const doc = {
      id: file._id.toString(),
      name: file.name,
      owner: file.ownerEmail,
      mimeType: file.mimeType,
      size: file.size,
      tags: file.tags || [],
      text: file.extractedText || '',
      createdAt: file.createdAt?.toISOString(),
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
