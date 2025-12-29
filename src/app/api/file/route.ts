import FileModel from '@/models/files';
import { NextResponse } from 'next/server';
import { Types } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import FileItemModel from '@/models/fileItem';
import { adminAuth } from '@/lib/firebaseAdmin';
import { ro } from 'date-fns/locale';
import User from '@/models/users';

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
    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const userId = decodedToken.uid;

    if (!userId) {
      return NextResponse.json({ message: 'missing user id' }, { status: 401 });
    }

    const user = await User.findById(userId);
    const ownerId = user.role === "admin" ? user.collegeId : user._id;

    // Fetch files
    let rootFolder = await FileItemModel.findOne({ ownerId, isRoot: true });
    if (!rootFolder) {
      return NextResponse.json({ message: 'Root folder not found' }, { status: 404 });
      // don't forget to remove the below later and uncommrent the above and change the above let to const
      // rootFolder = await FileItemModel.create({
      //   ownerId: userId,
      //   filename: '/',
      //   isFolder: true,
      //   parentFolderId: null,
      //   isRoot: true,
      // });
    }

    const files = await FileItemModel.find({
      ownerId,
      parentFolderId: rootFolder._id,
    }).sort({ createdAt: -1 });

    return NextResponse.json({
      message: 'Files fetched',
      data: files,
    });
  } catch (error: any) {
    console.error('Error fetching files:', error);
    return NextResponse.json(
      {
        message: 'Internal server error',
        error: error.message,
      },
      { status: 500 }
    );
  }
};
