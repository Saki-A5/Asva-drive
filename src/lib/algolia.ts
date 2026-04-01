import { algoliasearch } from 'algoliasearch'

const appId = process.env.ALGOLIA_APP_ID
const adminKey = process.env.ALGOLIA_ADMIN_API_KEY

if (!appId || !adminKey) {
  throw new Error('Missing Algolia environment variables')
}

export const algoliaClient = algoliasearch(appId, adminKey)
export const FILES_INDEX = 'files'