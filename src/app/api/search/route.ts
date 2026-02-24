import { algoliaClient, FILES_INDEX } from '@/lib/algolia'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = searchParams.get('q') || ''
  const limit = Number(searchParams.get('limit')) || 8
  const ownerId = searchParams.get('ownerId')

  try {
    const results = await algoliaClient.searchSingleIndex({
      indexName: FILES_INDEX,
      searchParams: {
        query: q,
        hitsPerPage: limit,
        ...(ownerId && { filters: `ownerId:${ownerId}` })
      }
    })

    return Response.json(results.hits)
  } catch (error) {
    console.error('Search error:', error)
    return Response.json({ error: 'Search failed' }, { status: 500 })
  }
}