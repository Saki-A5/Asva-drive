import { MeiliSearch } from 'meilisearch'

const host = process.env.MEILI_HOST || 'http://127.0.0.1:7700'
const apiKey = process.env.MEILI_API_KEY || ''

const client = new MeiliSearch({ host, apiKey })

export const getClient = () => {
  return client
}

export const ensureIndex = async(indexName: string, options?: { primaryKey?: string }) => {
  try {
    const index = await client.getIndex(indexName)
    return index
  } catch (err) {
    return client.createIndex(indexName, options)
  }
}

export const addDocuments = async(indexName: string, docs: any[]) => {
  const index = client.index(indexName)
  return index.addDocuments(docs)
}

export const search = async(indexName: string, query: string, opts?: any) => {
  const index = client.index(indexName)
  return index.search(query, opts)
}

export default client
