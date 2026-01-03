import dbConnect from "@/lib/dbConnect";
import College from "@/models/colleges";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const GET = async (req: Request) => {
    try{
        await dbConnect();
        const colleges = await College.find();

        return NextResponse.json({message: "Successfully retrieved Colleges", colleges});
    }
    catch(err: any){
        console.error(err);
        return NextResponse.json({error: err.message || "An Error Occurred"}, {status: 500});
    }
}