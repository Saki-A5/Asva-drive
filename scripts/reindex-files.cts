import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

async function reindexFiles({ clear = false, batchSize = 500 } = {}) {
  const { default: dbConnect } = await import('../src/lib/dbConnect.js')
  const { default: FileModel } = await import('../src/models/files.js')
  const { algoliaClient, FILES_INDEX } = await import('../src/lib/algolia.js')

  await dbConnect()

  if (clear) {
    console.log('Clearing existing Algolia index...')
    try { 
      await algoliaClient.clearObjects({ indexName: FILES_INDEX }) 
    } catch (e) { /* ignore if not exists */ }
    console.log('Index cleared.')
  }

  const total = await FileModel.countDocuments({})
  console.log(`Reindexing ${total} files in batches of ${batchSize}...`)
  
  let offset = 0
  let indexed = 0

  while (offset < total) {
    const files = await FileModel.find({})
      .skip(offset)
      .limit(batchSize)
      .lean()

    if (!files.length) break

    const objects = files.map((file: any) => ({
      objectID: file._id?.toString() || '',  
      filename: file.filename,
      ownerId: file.ownerId?.toString() || '',
      mimeType: file.mimeType,
      sizeBytes: file.sizeBytes,
      tags: file.tags || [],
      extractedText: file.extractedText || '',
      cloudinaryUrl: file.cloudinaryUrl || '',
      uploadedBy: file.uploadedBy?.toString() || '',
      resourceType: file.resourceType,
      isDeleted: file.isDeleted,
      deletedAt: file.deletedAt,
      createdAt: file.createdAt?.toISOString(),
      updatedAt: file.updatedAt?.toISOString(),
    }))

    await algoliaClient.saveObjects({ 
      indexName: FILES_INDEX, 
      objects 
    })

    indexed += objects.length
    offset += objects.length
    console.log(`Indexed ${indexed}/${total}`)
  }

  console.log('Reindex complete!')
}

const clear = process.argv.includes('--clear')
reindexFiles({ clear }).catch((e: any) => {
  console.error('Reindex failed:', e)
  process.exit(1)
})