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

// upload a file
export const POST = async (req: Request) => {
  try {
    await dbConnect();

    // const {user, error, status} = await requireRole(req, ['admin']);
    // if(error) return NextResponse.json({message: "Unauthorized"}, {status});

    const user = await User.findOne({ email: 'asvasoftwareteam@gmail.com' });

    const formData = await req.formData();
    const folderId = formData.get("folderId") as string;

    let targetFolder;

// CASE 1: folderId explicitly provided (subfolder upload)
if (folderId && Types.ObjectId.isValid(folderId)) {
  targetFolder = await FileItemModel.findById(folderId);
  if (!targetFolder) {
    return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });
  }
}

// CASE 2: NO folderId → ROOT upload
if (!targetFolder) {
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

    const file = formData.get("file") as File || null;
    const tags = (formData.get("tags") as string)?.split(",") || [];

    console.log(file);

    // Validation
    // if (!folderId) {
    //   return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    // }
    // const folder = await FileItemModel.findById(folderId);
    // if (!folder) return NextResponse.json({ error: "Folder does not exist" }, { status: 404 });
    // i commented line sixety seven to seventy two to allow root uploads

    if (!file) {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const fileArrayBuffer = await file.arrayBuffer();
    const fileBuffer = Buffer.from(fileArrayBuffer);


    // Call uploadFile function
    const result = await uploadFile(
      file.name,
      fileBuffer,
      new Types.ObjectId(folderId),
      new Types.ObjectId(user.collegeId), // i changed this to collegeId from college
      tags,
    );

    if (!result) return NextResponse.json({ message: "Error uploading file" }, { status: 500 });

    const cFile = await FileModel.create({
      filename: file.name,
      cloudinaryUrl: result.public_id,
      parentFolderId: targetFolder._id,
      ownerId: new Types.ObjectId(user.collegeId),
      resourceType: result.resource_type, // default for now
      mimeType: file.type,
      sizeBytes: result.bytes,
      tags: tags,
      college: user.collegeId,
      uploadedBy: new Types.ObjectId(user._id)
    });

    await cFile.save();

    const fileItem = await FileItemModel.create({
      filename: file.name, 
      // parentFolderId: new Types.ObjectId(folderId),
      parentFolderId: targetFolder._id,
      ownerId: new Types.ObjectId(cFile.ownerId), 
      ownerType: 'College', 
      file: new Types.ObjectId(cFile._id)
    });

    await fileItem.save();
    const pFileItem = await FileItemModel.findById(fileItem._id).populate("file");

    // in app notifications
    await Notification.create({
      userId: user._id,
      title: "New File Uploaded",
      body: `${file.name} has been uploaded to your folder`,
      type: "FILE_UPLOAD",
      metadata: {
        fileId: cFile._id,
        folderId,
      },
      read: false,
    });

    const usersToNotify = await User.find({
      collegeId: user.collegeId
    })
    await Notification.insertMany(
      usersToNotify.map(u=> ({
        userId: u._id,
        title: "New File Uploaded",
        body: `${file.name} has been uploaded to your folder`,
        type: "FILE_UPLOAD",
        metadata: {
          fileId: cFile._id,
          folderId: targetFolder._id,
        },
        read: false,
      }))
    )
    // push notifications
    const recipientTokens = await Token.find({ userId: user._id }).distinct("token");
    if (recipientTokens.length > 0) {
      await sendPush({
        tokens: recipientTokens,
        title: "New File Uploaded",
        body: `${file.name} has been uploaded to your folder`,
        data: {
          fileId: cFile._id.toString(),
          folderId: targetFolder._id.toString(),
        },
      })
    } else {
      console.log("No FCM tokens found for user")
    }

    try {
      await sendPush({
        tokens: recipientTokens,
        title: "New File Uploaded",
        body: `${file.name} has been uploaded to your folder`,
        data: {
          fileId: cFile._id.toString(),
          folderId,
        },
      });
    } catch (e) {
      console.log("Error sending push notification:", e);
    }


    // Enqueue indexing job (worker will fetch document by id and index)
    await indexQueue.add(
      'index-file',
      { id: cFile._id.toString() },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 1000 },
        removeOnComplete: true,
        jobId: `file-${cFile._id.toString()}`,
      }
    )

    return NextResponse.json({
      message: "File uploaded successfully",
      file: pFileItem
    }, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Error"
    }, { status: 500 })
  }
}

// import { NextResponse } from "next/server";

// export const GET = async () => {
//   return NextResponse.json({ message: "Upload route alive" });
// };

// export const POST = async (req: Request) => {
//   return NextResponse.json({ message: "POST upload hit" });
// };

