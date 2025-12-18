import 'dotenv/config'
import dbConnect from '@/lib/dbConnect'
import FileModel from '@/models/files'
import { getClient, ensureIndex } from '@/lib/meilisearch'

async function reindexFiles({ clear = false, batchSize = 500 } = {}) {
  await dbConnect()
  const client = getClient()
  const index = client.index('files')

  if (clear) {
    console.log('Deleting existing MeiliSearch index...')
    try { await index.delete() } catch (e) { /* ignore if not exists */ }
    await ensureIndex('files', { primaryKey: 'id' })
    console.log('Index recreated.')
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
    const docs = files.map(file => ({
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
    }))
    await index.addDocuments(docs)
    indexed += docs.length
    offset += docs.length
    console.log(`Indexed ${indexed}/${total}`)
  }
  console.log('Reindex complete!')
}

// Usage: node scripts/reindex-files.js [--clear]
const clear = process.argv.includes('--clear')
reindexFiles({ clear }).catch(e => {
  console.error('Reindex failed:', e)
  process.exit(1)
})