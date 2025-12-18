import { renameAsset } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import { requireRole } from "@/lib/roles";
import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: NextRequest, {params}: any) => {
    try {
        await dbConnect();

        // const {user, error, status} = await requireRole(req, ['admin']);
        // if(error) return NextResponse.json({error}, {status});

        const { filename } = await req.json();
        
        const {id} = (await params);

        const fileId = new Types.ObjectId(id);

        const file = await FileModel.findOne({_id: fileId});
        if(!file) return NextResponse.json({message: "File Does not Exist"}, {status: 404});

        await renameAsset(file.cloudinaryUrl, file.parentFolderId, filename as string);

        await FileModel.updateOne({_id: file._id}, {$set: {filename: filename as string}});

        return NextResponse.json({message: "Successfully renamed"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "An error occurred"}, {status: 500});
    }
}