import { getAsset } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import FileModel  from "@/models/files";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const GET = async(req: Request, {params}: any) => {
    const {id} = await params;
    const fileId = new Types.ObjectId(id as string);

    await dbConnect();
    const file = await FileModel.findOne({_id: fileId});
    if(!file) return NextResponse.json({message: 'No Such File exists'}, {status: 404});

    try{
        await getAsset(file.cloudinaryUrl);
        return NextResponse.json({message: "Successfully Retrieved Asset"});
    }
    catch(e: any){
        return NextResponse.json({message: e.message}, {status: 500})
    }

}