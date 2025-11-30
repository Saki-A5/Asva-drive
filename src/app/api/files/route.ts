import FileModel from '@/models/files';
import { NextResponse } from 'next/server';

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');

  if (!ownerId)
    return NextResponse.json({ message: 'Missing ownerId' }, { status: 400 });

  const files = await FileModel.find({ owner: ownerId }).sort({
    createdAt: -1,
  });

  return NextResponse.json({
    message: 'Files fetched',
    data: files,
  });
};
