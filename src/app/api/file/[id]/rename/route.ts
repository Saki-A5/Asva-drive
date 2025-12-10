import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextRequest, NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: NextRequest, {params}: {params:{id: string}}) => {
    try {
        // const cookieStore = await cookies();
        // const token = cookieStore.get('token')?.value;

        // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

        // const decodedToken = await adminAuth.verifyIdToken(token);
        // const {email} = decodedToken;

        const { filename } = await req.json();

        const email = 'demo@gmail.com';
        const user = await User.findOne({email});
        if (!user) return NextResponse.json({message: "Did not find User"}, {status: 404});
        
        const id = params.id;

        const fileId = new Types.ObjectId(id);

        const file = await FileModel.findOne({_id: fileId});
        if(!file) return NextResponse.json({message: "File Does not Exist"}, {status: 404});

        await FileModel.updateOne({_id: file._id}, {$set: {filename: filename as string}});

        return NextResponse.json({message: "Successfully renamed"});
    } catch (error) {
        console.error(error);
        return NextResponse.json({error: "An error occurred"}, {status: 500});
    }
}