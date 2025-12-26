export const runtime = 'nodejs';

import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const POST = async (req: Request) => {
    const { folderName, parentFolderId, ownerId } = await req.json();
    if(!folderName || !parentFolderId || !ownerId) return NextResponse.json({message: "folder name, parentFolderId and ownerId are compulsory"}, {status: 400});

    try{
        const parentFolder = await FileModel.findOne({
            _id: new Types.ObjectId(parentFolderId)
        });
        if(!parentFolder) return NextResponse.json({
            message: 'Parent Folder not Found'
        }, {status: 404});

        const owner = await User.findOne({
            _id: new Types.ObjectId(ownerId)
        });
        if(!owner) return NextResponse.json({
            message: "No user with that ID"
        }, {status: 404});

        const folder = await FileModel.create({
            filename: folderName, 
            parentFolderId: parentFolderId, 
            ownerId,
        })

        return NextResponse.json({
            message: 'Folder successfully created', 
            data: {folderId: folder._id}
        })
    }
    catch(e: any){
        return NextResponse.json({
            message: e.message
        }, {status: 404})
    }

    
}
