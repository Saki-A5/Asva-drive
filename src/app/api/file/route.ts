import FileModel from '@/models/files';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/roles';

export const GET = async (req: Request) => {
  // Protect the route — only allow admins
  const { user, error, status } = await requireRole(req, ['admin']);
  if (error) return NextResponse.json({ message: error }, { status });

  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');

  if (!ownerId)
    return NextResponse.json({ message: 'Missing ownerId' }, { status: 400 });

  const rootFolder = await FileModel.findOne({ownerId, isRoot: true});
  const files = await FileModel.find({ ownerId,parentFolderId: rootFolder._id}).sort({
    createdAt: -1,
  });

  return NextResponse.json({
    message: 'Files fetched',
    data: files,
  });
};
