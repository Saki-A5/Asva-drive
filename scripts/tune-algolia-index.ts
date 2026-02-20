import dotenv from 'dotenv'
import path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const { algoliaClient, FILES_INDEX } = await import('../src/lib/algolia')

async function tuneAlgoliaIndex() {

  await algoliaClient.setSettings({
    indexName: FILES_INDEX,
    indexSettings: {

      // Fields to search through
      searchableAttributes: [
        'filename',
        'tags',
        'extractedText',  
        'mimeType',
      ],

      // Fields that can be used in filters
      attributesForFaceting: [
        'filterOnly(ownerId)',
        'filterOnly(isDeleted)',
        'filterOnly(mimeType)',
        'tags',
      ],

      // Fields that can be sorted
      customRanking: [
        'desc(createdAt)',
        'desc(sizeBytes)',
      ],

      // Fields returned in search results
      attributesToRetrieve: [
        'objectID',
        'filename',
        'ownerId',
        'mimeType',
        'sizeBytes',
        'tags',
        'cloudinaryUrl',
        'resourceType',
        'isDeleted',
        'deletedAt',
        'createdAt',
        'updatedAt',
      ],

      // Typo tolerance
      typoTolerance: true,
      minWordSizefor1Typo: 4,
      minWordSizefor2Typos: 8,
    }
  })

  // Synonyms are set separately 
  await algoliaClient.saveSynonyms({
    indexName: FILES_INDEX,
    synonymHit: [
      { objectID: 'pdf-synonyms', type: 'synonym', synonyms: ['pdf', 'document', 'report'] },
      { objectID: 'docx-synonyms', type: 'synonym', synonyms: ['docx', 'word', 'document'] },
      { objectID: 'jpg-synonyms', type: 'synonym', synonyms: ['jpg', 'jpeg', 'image', 'photo'] },
      { objectID: 'png-synonyms', type: 'synonym', synonyms: ['png', 'image', 'photo'] },
      { objectID: 'xlsx-synonyms', type: 'synonym', synonyms: ['xlsx', 'excel', 'spreadsheet'] },
      { objectID: 'pptx-synonyms', type: 'synonym', synonyms: ['pptx', 'powerpoint', 'presentation'] },
      { objectID: 'txt-synonyms', type: 'synonym', synonyms: ['txt', 'text', 'note'] },
    ],
    forwardToReplicas: true,
    replaceExistingSynonyms: true,
  })

  console.log('Algolia index settings updated!')
}

tuneAlgoliaIndex().catch(e => {
  console.error('Failed to tune Algolia index:', e)
  process.exit(1)
})