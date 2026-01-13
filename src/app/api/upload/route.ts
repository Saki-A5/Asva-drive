export const runtime = "nodejs";

import { uploadFile } from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import { adminAuth } from '@/lib/firebaseAdmin';
import { indexQueue } from '@/lib/queue';
import FileModel from '@/models/files';
import User from '@/models/users';
// import { File } from 'buffer';
import { Types } from 'mongoose';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';
import Notification from '@/models/notificationSchema';
import { sendPush } from '@/lib/sendPush';
import Token from '@/models/notificationToken';
import College from '@/models/colleges';
import FileItemModel from '@/models/fileItem';
import { createRootIfNotExists } from '@/lib/fileUtil';

export function getCloudinaryResourceType(mimeType: string) {
  if (!mimeType) return 'raw';

  const type = mimeType.toLowerCase();
  if (type.startsWith('image/')) return 'image';
  if (type.startsWith('video/')) return 'video';  
  if (type.startsWith('audio/')) return 'video';
  return 'raw';
}

// upload a file
export const POST = async (req: Request) => {
  try {
    await dbConnect();

    // Get user 
    const user = await User.findOne({ email: 'asvasoftwareteam@gmail.com' });
    if (!user || !user.collegeId) {
      return NextResponse.json({ error: "User or college not found" }, { status: 400 });
    }

    const formData = await req.formData();
    const folderId = formData.get("folderId") as string | null;

    //  Determine target folder 
    let targetFolder;

    if (folderId && Types.ObjectId.isValid(folderId)) {
      // Subfolder upload
      targetFolder = await FileItemModel.findById(folderId);
      if (!targetFolder) {
        return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });
      }
    }

    if (!targetFolder) {
      // Root folder upload
      targetFolder = await FileItemModel.findOne({
        ownerId: user.collegeId,
        isRoot: true,
      });

      if (!targetFolder) {
        targetFolder = await FileItemModel.create({
          filename: '/',
          isFolder: true,
          parentFolderId: null,
          ownerId: user.collegeId,
          ownerType: 'College',
          isRoot: true,
        });
      }
    }

    // Get file 
    const file = formData.get("file") as File | null;
    if (!file) return NextResponse.json({ error: "Missing file" }, { status: 400 });

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);

    const resourceType = getCloudinaryResourceType(file.type);

    // Upload to Cloudinary
    const result = await uploadFile(
      file.name,
      fileBuffer,
      targetFolder._id,
      user.collegeId,
      resourceType,
      (formData.get("tags") as string)?.split(",") || []
    );

    if (!result) return NextResponse.json({ message: "Error uploading file" }, { status: 500 });

    //  Save File document 
    const cFile = await FileModel.create({
      filename: file.name,
      cloudinaryUrl: result.public_id,
      parentFolderId: targetFolder._id,
      ownerId: user.collegeId,
      resourceType: result.resource_type,
      mimeType: file.type,
      sizeBytes: result.bytes,
      tags: (formData.get("tags") as string)?.split(",") || [],
      college: user.collegeId,
      uploadedBy: user._id,
    });

    // ------------------ Save FileItem document ------------------
    const fileItem = await FileItemModel.create({
      filename: file.name,
      isFolder: false,
      parentFolderId: targetFolder._id,
      ownerId: cFile.ownerId,
      ownerType: 'College',
      file: new Types.ObjectId(cFile._id),
      isRoot: false,
      isReference: false,
      isDeleted: false,
    });

    // Notifications / Indexing 
    const usersToNotify = await User.find({ collegeId: user.collegeId });
    await Notification.insertMany(
      usersToNotify.map(u => ({
        userId: u._id,
        title: "New File Uploaded",
        body: `${file.name} has been uploaded`,
        type: "FILE_UPLOAD",
        metadata: { fileId: cFile._id, folderId: targetFolder._id },
        read: false,
      }))
    );

    const recipientTokens = await Token.find({ userId: user._id }).distinct("token");
    if (recipientTokens.length > 0) {
      await sendPush({
        tokens: recipientTokens,
        title: "New File Uploaded",
        body: `${file.name} has been uploaded`,
        data: { fileId: cFile._id.toString(), folderId: targetFolder._id.toString() },
      });
    }

    await indexQueue.add('index-file', { id: cFile._id.toString() }, {
      attempts: 5,
      backoff: { type: 'exponential', delay: 1000 },
      removeOnComplete: true,
      jobId: `file-${cFile._id.toString()}`,
    });

    const populatedFileItem = await FileItemModel.findById(fileItem._id).populate('file');
    return NextResponse.json({ message: "File uploaded successfully", file: populatedFileItem }, { status: 200 });

  } catch (e) {
    console.error(e);
    return NextResponse.json({ message: "Error uploading file", error: (e as Error).message }, { status: 500 });
  }
};

