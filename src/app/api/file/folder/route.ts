export const runtime = 'nodejs';

import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import FileItemModel from "@/models/fileItem";
import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    await dbConnect()
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
    const userEmail = decodedToken.email;
    // const userEmail = "asvasoftwareteam@gmail.com"; // comment this line and uncomment the code block above
    const user = await User.findOne({email: userEmail});
    if(!user) return NextResponse.json({error: "Could not find user"}, {status: 401});

    const ownerId = user.role === "admin" ? user.collegeId : user._id;
    const ownerType = user.role === "admin" ? "College" : "User";

    const { folderName, parentFolderId } = await req.json();
    // const parentId = parentFolderId ? new Types.ObjectId(parentFolderId): null
    // if (!folderName || !parentFolderId) return NextResponse.json({ message: "folder name, parentFolderId and ownerId are compulsory" }, { status: 400 });
    if (!folderName || !folderName.trim()) {
    return NextResponse.json({ message: "folderName is required" }, { status: 400 });
  } // just added

    try {
        // const parentFolder = await FileItemModel.findOne({
        //     _id: new Types.ObjectId(parentFolderId)
        // });
        // if (!parentFolder) return NextResponse.json({
        //     message: 'Parent Folder not Found'
        // }, { status: 404 });

        let parentFolder = null;
    if (parentFolderId) {
      if (!Types.ObjectId.isValid(parentFolderId)) {
        return NextResponse.json({ message: "Invalid parentFolderId" }, { status: 400 });
      }

      parentFolder = await FileItemModel.findById(parentFolderId);
      if (!parentFolder) {
        return NextResponse.json({ message: "Parent folder not found" }, { status: 404 });
      }
    }

        const folder = await FileItemModel.create({
            // filename: folderName,
            filename: folderName.trim(),
            isFolder: true,
            // parentFolderId: parentFolderId,
            parentFolderId: parentFolder ? parentFolder._id : null,
            ownerId,
            ownerType
        });

        return NextResponse.json({
            message: 'Folder successfully created',
            data: { folderId: folder._id }
        })
    }
    catch (e: any) {
        return NextResponse.json({
            message: e.message
        }, { status: 404 })
    }


}
