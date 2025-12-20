import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import FileModel from "@/models/files";
import User from "@/models/users";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const POST = async (req: Request, {params}: any) => {
    try {
        dbConnect();

        const {parentFolderId} = await req.json();

        const {id: fileId} = await params;

        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
        }

        // Verify Firebase ID token
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { email } = decodedToken as { email?: string };

        const user = await User.findOne({email});

        const file = await FileModel.findById(fileId);
        if(!file) return NextResponse.json({error: "File Not Found"}, {status: 404});
        if(file.isFolder) return NextResponse.json({error: "You can't reference Link Folders"}, {status: 400});

        
    }
    catch (e: any) {
        return NextResponse.json({ error: e.message || "An Error Occurred" }, { status: 500 });
    }
}