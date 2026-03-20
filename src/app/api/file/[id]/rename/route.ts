import { renameAsset } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import FileItemModel from "@/models/fileItem";
import FileModel, { FileInterface } from "@/models/files";
import User from "@/models/users";
import { HydratedDocument, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: NextRequest, { params }: any) => {
  try {
    await dbConnect();

    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
    );
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: "Missing user id" }, { status: 401 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    // Only admins are allowed to rename files/folders
    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ownerId = user.collegeId;

    const { filename } = await req.json();
    const { id } = await params;
    const fileItemId = new Types.ObjectId(id);

    const fileItem = await FileItemModel.findOne({
      _id: fileItemId,
      ownerId,
      isDeleted: { $ne: true },
    }).populate<{ file: HydratedDocument<FileInterface> }>("file");

    if (!fileItem) {
      return NextResponse.json(
        { message: "File Does not Exist" },
        { status: 404 },
      );
    }

    if (fileItem.isFolder) {
      // Folder: rename this folder item (folders aren't shared across owners)
      await FileItemModel.updateOne(
        { _id: fileItemId },
        { $set: { filename: filename as string } },
      );
    } else if (fileItem.file) {
      // File: rename underlying asset + all references for all owners
      try {
        const publicId = await renameAsset(
          fileItem.file.cloudinaryUrl,
          fileItem.parentFolderId || fileItem._id,
          filename as string,
          fileItem.file.resourceType,
        );

        await FileModel.updateOne(
          { _id: fileItem.file._id },
          {
            $set: {
              filename: filename as string,
              cloudinaryUrl: publicId,
            },
          },
        );
      } catch (e: any) {
        // If Cloudinary says the new public_id is equivalent, treat as success
        if (
          !String(e?.message || "").includes(
            "Can't rename to same or equivalent public_id",
          )
        ) {
          throw e;
        }
      }

      await FileItemModel.updateMany(
        { file: fileItem.file._id },
        { $set: { filename: filename as string } },
      );
    }

    return NextResponse.json({ message: "Successfully renamed", file: fileItem });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "An Error Occurred" },
      { status: 500 },
    );
  }
}