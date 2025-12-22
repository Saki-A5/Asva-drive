import { NextRequest, NextResponse } from "next/server"
import dbConnect from "@/lib/dbConnect"
import FileModel from "@/models/files"

// Helper to build a tree from flat file list
type FileNode = {
  [key: string]: any
  _id: string
  parentFolderId: string | null
  children: FileNode[]
}

function buildTree(files: any[], parentId: string | null = null): FileNode[] {
  return files
    .filter(
      f => (f.parentFolderId ? f.parentFolderId.toString() : null) === parentId
    )
    .map(f => ({
      ...f,
      _id: f._id.toString(),
      parentFolderId: f.parentFolderId?.toString() || null,
      children: buildTree(files, f._id.toString()),
    }))
}

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ collegeId: string }> }
) => {
  try {
    const { collegeId } = await params

    await dbConnect()

    const files = await FileModel.find({
      ownerId: collegeId,
      isDeleted: false,
    }).lean()

    const tree = buildTree(files, null)

    return NextResponse.json({ tree })
  } catch (error: any) {
    console.error("College tree error:", error)
    return NextResponse.json(
      { error: error.message || String(error) },
      { status: 500 }
    )
  }
}