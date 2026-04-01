import 'dotenv/config'
import { Worker } from 'bullmq'
import dbConnect from '@/lib/dbConnect'
import FileModel from '@/models/files'
import { connection } from '@/lib/queue'
import { algoliaClient, FILES_INDEX } from '@/lib/algolia'

const worker = new Worker(
  'indexing',
  async job => {
    const data = job.data as { id?: string }
    if (!data?.id) throw new Error('Job payload missing id')

    await dbConnect()
    const file: any = await FileModel.findById(data.id).lean()
    if (!file || Array.isArray(file)) throw new Error('File not found or invalid: ' + data.id)

    // If deleted, remove from Algolia
    if (file.isDeleted) {
      await algoliaClient.deleteObject({
        indexName: FILES_INDEX,
        objectID: data.id
      })
      return { deleted: data.id }
    }

    // Index to Algolia
    await algoliaClient.saveObject({
      indexName: FILES_INDEX,
      body: {
        objectID: data.id,           
        filename: file.filename,
        ownerId: file.ownerId?.toString() || '',
        mimeType: file.mimeType,
        sizeBytes: file.sizeBytes,
        tags: file.tags || [],
        extractedText: file.extractedText || '',
        cloudinaryUrl: file.cloudinaryUrl || '',
        resourceType: file.resourceType,
        isDeleted: file.isDeleted,
        createdAt: file.createdAt?.toISOString(),
        updatedAt: file.updatedAt?.toISOString(),
      }
    })

    // Mark as indexed in MongoDB (best-effort)
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