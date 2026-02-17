import { algoliaClient, FILES_INDEX } from './algolia'
import { FileInterface } from '@/models/files'
import { Types } from 'mongoose'

export async function indexFileToAlgolia(
  fileId: Types.ObjectId | string,
  file: FileInterface
) {
  if (file.isDeleted) {
    await algoliaClient.deleteObject({
      indexName: FILES_INDEX,
      objectID: fileId.toString()
    })
    return
  }

  await algoliaClient.saveObject({
    indexName: FILES_INDEX,
    body: {
      objectID: fileId.toString(),
      filename: file.filename,
      cloudinaryUrl: file.cloudinaryUrl,
      ownerId: file.ownerId,
      uploadedBy: file.uploadedBy.toString(),
      resourceType: file.resourceType,
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      tags: file.tags,
      extractedText: file.extractedText,
      createdAt: file.createdAt,
    }
  })
}