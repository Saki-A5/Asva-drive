import { renameAsset } from "@/lib/cloudinary";
import FileItemModel from "@/models/fileItem";
import { FileInterface } from "@/models/files";
import { HydratedDocument } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
    const { fileItemId, currentParent, destParent } = await req.json();

    try {
        if(!fileItemId || !currentParent || destParent) return NextResponse.json({error: "fileItemId, currentParent and destParent are cumpulsory paramters"});

        const fileItem = await FileItemModel.findById(fileItemId).populate<{file: HydratedDocument<FileInterface>}>("file");
        if(!fileItem) return NextResponse.json({error: "File Item was not found"});

        const parentFolder = await FileItemModel.findById(currentParent);
        if(!parentFolder) return NextResponse.json({error: "Current Folder not found"});

        const destParentFolder = await FileItemModel.findById(destParent);
        if(!destParentFolder) return NextResponse.json({error: "Destination Folder not found"});
        if(!destParentFolder.isFolder) return NextResponse.json({error: "Destination Folder cannot be a file"});

        // for assets in cloudinary, their filename contains the name of their parent folder
        // if this item to be moved is a file and is not a reference file, then the file on clouidnary should be renamed
        if(!fileItem.isFolder && !fileItem.isReference){
            await renameAsset(fileItem.file.cloudinaryUrl, destParent._id, fileItem.filename, fileItem.file.resourceType);
        }

        fileItem.parentFolderId = destParentFolder._id;
        await fileItem.save();

        return NextResponse.json({message: "File Item has been moved", fileItem});
    } catch (err: any){
        console.error(err);
        return NextResponse.json({error: err.message || "An Error Occurred"});
    }    
}