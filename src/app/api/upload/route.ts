export const runtime = "nodejs";

import { uploadFile } from '@/lib/cloudinary';
import dbConnect from '@/lib/dbConnect';
import { adminAuth } from '@/lib/firebaseAdmin';
import User from '@/models/users';
import { File } from 'buffer';
import { error } from 'console';
import { Types } from 'mongoose';
import {cookies} from 'next/headers'
import { NextResponse } from 'next/server';

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
        const file = formData.get("file") as File | null;
        const filename = formData.get("filename") as string;
        const fileUrl = formData.get("fileUrl") as string | null;
        const tags = (formData.get("tags") as string)?.split(",") || [];

        const user = await User.findOne({email: email});
        if(!user) return NextResponse.json({error: "User not found"}, {status: 404});
        console.log(file);

        // Validation
        if (!folderId) {
            return NextResponse.json({ error: "Missing folderId" }, { status: 400 });
        }

        if (!file && !fileUrl) {
            return NextResponse.json({ error: "Missing file or fileUrl" }, { status: 400 });
        }

        let fileBuffer: any;

        // Handle file upload (binary)
        if (file) {
            fileBuffer = await file.arrayBuffer();
            // Convert to base64 for Cloudinary (Cloudinary accepts base64 or URLs)
            fileBuffer =Buffer.from(fileBuffer);
        }
        // Handle URL upload
        else if (fileUrl) {
            fileBuffer = fileUrl;
        } else {
            return NextResponse.json({ error: "Invalid file data" }, { status: 400 });
        }

        // Call uploadFile function
        const result = await uploadFile(
            filename,
            fileBuffer,
            new Types.ObjectId(folderId),
            user._id,
            tags
        );

        if (!result) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }

        return NextResponse.json({
            message: "File uploaded successfully",
            data: result
        }, { status: 200 });
    }
    catch (e) {
        console.log(e);
        return NextResponse.json({
            message: "Error"
        },{status: 500})
    }
}