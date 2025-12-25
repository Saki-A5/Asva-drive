import FileModel from '@/models/files';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import { adminAuth } from '@/lib/firebaseAdmin';

export const GET = async (req: Request) => {
  try {
    await dbConnect();

    //  Get session cookie
    const cookies = req.headers.get('cookie') || '';
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;
    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Verify session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
    const ownerId = decodedToken.uid;

    if (!ownerId) {
      return NextResponse.json({ message: 'missing user id' }, { status: 401 });
    }

    // Fetch files
    const rootFolder = await FileModel.findOne({ ownerId, isRoot: true });
    if (!rootFolder) {
      return NextResponse.json({ message: 'Root folder not found' }, { status: 404 });
    }

    const files = await FileModel.find({ ownerId, parentFolderId: rootFolder._id })
      .sort({ createdAt: -1 });

    return NextResponse.json({
      message: 'Files fetched',
      data: files,
    });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json({
      message: 'Internal server error',
      error: error.message,
    }, { status: 500 });
  }
};
