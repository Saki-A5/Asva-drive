import { renameAsset } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/roles";
import FileItemModel from "@/models/fileItem";
import FileModel, { FileInterface } from "@/models/files";
import User from "@/models/users";
import { HydratedDocument, Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: NextRequest, { params }: any) => {
    try {
        await dbConnect();

        // const {user, error, status} = await requireRole(req, ['admin']);
        // if(error) return NextResponse.json({error}, {status});

        const { filename } = await req.json();

        const { id } = (await params);

        const fileItemId = new Types.ObjectId(id);

        const fileItem = await FileItemModel.findById(fileItemId).populate<{ file: HydratedDocument<FileInterface> }>("file");
        if (!fileItem) return NextResponse.json({ message: "File Does not Exist" }, { status: 404 });

        if (!fileItem.isFolder) {
            const publicId = await renameAsset(fileItem.file.cloudinaryUrl, fileItem.parentFolderId!, filename as string, fileItem.file.resourceType); 
            // rename the actual file
            await FileModel.updateOne({ _id: fileItem.file._id }, { $set: { filename: filename as string, cloudinaryUrl: publicId } });
        }
        // rename the file item and all reference files
        await FileItemModel.updateMany({ file: fileItem.file._id }, { $set: { filename: filename as string } });

        return NextResponse.json({ message: "Successfully renamed", file: fileItem });
    } catch (error: any) {
        console.error(error);
        return NextResponse.json({ error: error.message || "An Error Occurred" }, { status: 500 });
    }
}