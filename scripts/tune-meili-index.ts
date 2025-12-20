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

  // Advanced: synonyms
  await index.updateSynonyms({
    pdf: ['document', 'report'],
    docx: ['word', 'document'],
    jpg: ['jpeg', 'image', 'photo'],
    png: ['image', 'photo'],
    xlsx: ['excel', 'spreadsheet'],
    pptx: ['powerpoint', 'presentation'],
    txt: ['text', 'note'],
  })

  // Advanced: stop words (common words to ignore in search)
  await index.updateStopWords([
    'the', 'a', 'an', 'and', 'or', 'of', 'in', 'to', 'for', 'on', 'with', 'at', 'by', 'from', 'as', 'is', 'it', 'this', 'that', 'these', 'those'
  ])

  // Advanced: typo tolerance (set min word size for 1/2 typos)
  await index.updateTypoTolerance({
    enabled: true,
    minWordSizeForTypos: {
      oneTypo: 4,
      twoTypos: 8,
    },
    disableOnAttributes: [],
    disableOnWords: [],
  })

  // Advanced: ranking rules (customize order of results)
  await index.updateRankingRules([
    'words',
    'typo',
    'proximity',
    'attribute',
    'sort',
    'exactness',
    'createdAt:desc', // newest first if sorted
    'sizeBytes:desc', // larger files first if sorted
  ])

  console.log('MeiliSearch index settings updated with advanced tuning!')
}

tuneMeiliIndex().catch(e => {
  console.error('Failed to tune MeiliSearch index:', e)
  process.exit(1)
})