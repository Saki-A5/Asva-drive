import FileModel from '@/models/files';
import { NextResponse } from 'next/server';
import { requireRole } from '@/lib/roles';
import { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';

export const GET = async (req: Request) => {
  // Protect the route — only allow admins
  // const { user, error, status } = await requireRole(req, ['admin']);
  // if (error) return NextResponse.json({ message: error }, { status });
  await dbConnect();
  
  const { searchParams } = new URL(req.url);
  const ownerId = searchParams.get('ownerId');

    if (!ownerId)
      return NextResponse.json({ message: 'Missing ownerId' }, { status: 400 });

  const rootFolder = await FileModel.findOne({ownerId: new Types.ObjectId(ownerId), isRoot: true});
  const files = await FileModel.find({ ownerId: new Types.ObjectId(ownerId), parentFolderId: rootFolder._id}).sort({
    createdAt: -1,
  });

    return NextResponse.json({
      message: 'Files fetched',
      data: files,
    });
  } catch (error) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
};
