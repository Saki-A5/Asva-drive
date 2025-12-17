import dbConnect from "@/lib/dbConnect";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

const POST = async(req: Request) => {
    try{
        await dbConnect();
        
        const {fileId} = await req.json();
        
        
    }
    catch(e: any){
        console.error(e);
        return NextResponse.json({error: e.message}, {status: 500});
    }
}