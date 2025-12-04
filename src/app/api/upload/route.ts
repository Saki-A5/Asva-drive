export const runtime = "nodejs";

import { uploadFile } from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import { adminAuth } from '@/lib/firebaseAdmin';
import { indexQueue } from '@/lib/queue';
import FileModel from '@/models/files';
import User from '@/models/users';
import { File } from 'buffer';
import { Types } from 'mongoose';
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server';

// upload a file
export const POST = async (req: Request) => {
  try {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('token')?.value;

    // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

    // const decodedToken = await adminAuth.verifyIdToken(token);
    // const {email} = decodedToken;

    await dbConnect();


    const formData = await req.formData();
    const folderId = formData.get("folderId") as string;
    const email = formData.get("email") as string;
    const file = formData.get("file") as File || null;
    const tags = (formData.get("tags") as string)?.split(",") || [];

    const user = await User.findOne({ email: email });
    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
    console.log(file);

    // Validation
    if (!folderId) {
      return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
    }
    const folder = await FileModel.findOne({
        _id: new Types.ObjectId(folderId.toString()),
        ownerId: new Types.ObjectId(user._id.toString()),
        isFolder: true
    });
    if(!folder) return NextResponse.json({error: "Folder does not exist"}, {status: 404});

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
      user._id,
      tags
    );

    if(!result) return NextResponse.json({message: "Error uploading file"}, {status: 500})

      const cFile = await FileModel.create({
            filename: file.name,
            cloudinaryUrl: result.public_id,
            fileLocation: `${folder.fileLocation}${file.name}`,
            ownerId: new Types.ObjectId(user._id),
            resourceType: result.resource_type, // default for now
            mimeType: result.format,
            sizeBytes: result.bytes,
            tags: tags
        });

        await cFile.save();

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

    if (!result) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    return NextResponse.json({
      message: "File uploaded successfully",
      file: cFile
    }, { status: 200 });
  }
  catch (e) {
    console.log(e);
    return NextResponse.json({
      message: "Error"
    }, { status: 500 })
  }
}
