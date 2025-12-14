import FileModel from '@/models/files';
import { NextResponse } from 'next/server';

export const GET = async () => {
  const recent = await FileModel.find({}).sort({ createdAt: -1 }).limit(20);

  return NextResponse.json({
    message: 'Recent files',
    data: recent,
  });
};
