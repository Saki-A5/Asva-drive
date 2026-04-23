import { getAsset, getAssetDeliveryUrl, deleteAsset, getAssetUrl } from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import FileModel, { FileInterface } from '@/models/files';
import { Types, Schema } from 'mongoose';
import { NextResponse } from 'next/server';
import User from '@/models/users';
import { adminAuth } from '@/lib/firebaseAdmin';
import { requireRole } from '@/lib/roles';
import { fileQueue } from '@/lib/queue';
import FileItemModel from '@/models/fileItem';

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
  const { id } = await params;
  const fileItemId = new Types.ObjectId(id as string);

  await dbConnect();
  const fileItem = await FileItemModel.findOne({
    _id: fileItemId,
    isDeleted: { $ne: true },
  }).populate<{
    file: FileInterface;
  }>('file');
  if (!fileItem)
    return NextResponse.json(
      { message: 'No Such File exists' },
      { status: 404 }
    );

    try {
        // Track file access by updating the updatedAt timestamp
        if (fileItem.file) {
          await FileModel.findByIdAndUpdate(
            fileItem.file._id,
            { updatedAt: new Date() },
            { new: true }
          );
        }

        // const signedUrl = getAssetDeliveryUrl(fileItem.file.cloudinaryUrl, {
        //     resource_type: fileItem.file.resourceType,
        //     sign_url: true,
        //     secure: true,
        //     expires_at: Math.floor(Date.now() / 1000) + 3600, // default of one hour
        //     type: 'authenticated'
        // });
        const signedUrl = await getAssetUrl(fileItem.file.cloudinaryUrl, {
            resource_type: fileItem.file.resourceType,
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // default of one hour
            type: 'authenticated'
        });
        console.log(signedUrl);
        return NextResponse.json({ message: "Successfully Retrieved Asset", fileItem, signedUrl });
    }
    catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 })
    }

}

// delete a file
export const DELETE = async (req: Request, { params }: any) => {
  try {
    await dbConnect();

    // Reuse the same auth pattern as the list endpoint:
    // derive the current user from the Firebase session cookie.
    const cookies = req.headers.get('cookie') || '';
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    if (!sessionCookie) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: 'Missing user id' }, { status: 401 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }
    const { id } = await params;
    const fileItemId = new Types.ObjectId(id);
    const ownerId = user.role === 'admin' ? user.collegeId : user._id;

    const fileItem = await FileItemModel.findOne({ _id: fileItemId, ownerId });
    if (!fileItem)
      return NextResponse.json({ message: 'No File Found' }, { status: 404 });

    if (fileItem.isFolder) {
      return NextResponse.json(
        {
          message:
            'This item is a folder. Delete it from the files list or use DELETE /api/file/folder/:id.',
        },
        { status: 400 },
      );
    }

    // if file is a reference file, delete that reference file permanently
    if (fileItem.isReference) {
      await FileItemModel.findOneAndDelete({ _id: fileItemId });
      return NextResponse.json({
        message: 'Reference File Successfully Deleted',
      });
    }

    // Check user role to determine delete type
    const isAdmin = user.role === 'admin';
    const fileId = fileItem.file;

    if (!fileId) {
      return NextResponse.json({ message: 'File reference not found' }, { status: 400 });
    }

    if (isAdmin) {
      // Admin: soft delete (goes to trash)
      await FileModel.findByIdAndUpdate(fileId, {
        $set: { isDeleted: true, deletedAt: Date.now() },
      });
      // soft delete all file items referencing this file (hide from all users)
      await FileItemModel.updateMany(
        { file: fileId },
        { $set: { isDeleted: true, deletedAt: Date.now() } }
      );

      // add the deleted file to the deleted queue
      const fileRestoreWindow = Number(process.env.FILE_RESTORE_WINDOW) || 28;
      const delay = fileRestoreWindow * (1000 * 60 * 60 * 24);
      await fileQueue.add(
        'delete-file',
        { fileId: fileId.toString() },
        {
          delay,
          attempts: 5,
          backoff: { type: 'exponential', delay: 1000 },
          removeOnComplete: true,
          jobId: `delete-file-${fileItemId}`,
        }
      );
    } else {
      // Normal user: permanent delete
      const file = await FileModel.findById(fileId);
      if (file) {
        // Delete from Cloudinary
        const deleteResult = await deleteAsset(file.cloudinaryUrl, file.resourceType);
        if (!deleteResult.succeeded) {
          throw new Error(deleteResult.error || 'Failed to delete file from storage');
        }
        // Delete from MongoDB
        await FileModel.findByIdAndDelete(fileId);
      }
      // Delete all file items for this owner referencing this file
      await FileItemModel.deleteMany({ file: fileId, ownerId });
    }

    return NextResponse.json({ message: 'Successfully Deleted File' });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: (error as Error).message || 'Internal Server Error' },
      { status: 500 }
    );
  }
};
