import 'dotenv/config'
import { getClient } from '@/lib/meilisearch'

async function tuneMeiliIndex() {
  const client = getClient()
  const index = client.index('files')

  // Set which fields are searchable
  await index.updateSearchableAttributes([
    'filename',
    'tags',
    'text',
  ])

  // Set which fields can be filtered
  await index.updateFilterableAttributes([
    'ownerId',
    'isFolder',
    'tags',
    'isDeleted',
    'mimeType',
  ])

  // Set which fields can be sorted
  await index.updateSortableAttributes([
    'createdAt',
    'sizeBytes',
  ])

  // Optionally, set displayed attributes (fields returned in search results)
  await index.updateDisplayedAttributes([
    'id',
    'filename',
    'ownerId',
    'mimeType',
    'sizeBytes',
    'tags',
    'cloudinaryUrl',
    'isFolder',
    'parentFolderId',
    'isRoot',
    'isDeleted',
    'deletedAt',
    'createdAt',
    'updatedAt',
  ])

  console.log('MeiliSearch index settings updated!')
}

tuneMeiliIndex().catch(e => {
  console.error('Failed to tune MeiliSearch index:', e)
  process.exit(1)
})