export const runtime = 'nodejs'

import { NextResponse } from 'next/server'
import dbConnect from '@/lib/dbConnect'
import FileModel from '@/models/files'
import { indexQueue } from '@/lib/queue'

// POST /api/upload
export async function POST(req: Request) {
  try {
    const body = await req.json()

    const { name, ownerEmail, mimeType, size, tags, extractedText } = body

    if (!name || !ownerEmail) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    await dbConnect()

    const file = await FileModel.create({ name, ownerEmail, mimeType, size, tags, extractedText })

    // Enqueue indexing job (worker will fetch document by id and index)
    await indexQueue.add(
      'index-file',
      { id: file._id.toString() },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        jobId: `file-${file._id.toString()}`,
      }
    )

    return NextResponse.json({ file })
  } catch (error: any) {
    console.error('Upload API error:', error)
    return NextResponse.json({ error: error.message || String(error) }, { status: 500 })
  }
}
