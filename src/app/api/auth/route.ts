export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import FileModel from "@/models/files";
import { Types } from "mongoose";

// Create user (POST)
export async function POST(req: Request) {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || (email ? email.split("@")[0] : "User")
      });
    }

    // find or create the root folder
    let rootFolder = await FileModel.findOne({
      ownerId: new Types.ObjectId(user._id.toString()), 
      filename: '/', 
      isFolder: true,
      isRoot: true,
    });
    if(!rootFolder){
      rootFolder = await FileModel.create({
        ownerId: new Types.ObjectId(user._id.toString()), 
        filename: '/', 
        isFolder: true, 
        parentFolder: null,
        isRoot: true
      })
    }

    // Set authentication cookie
    const res = NextResponse.json({ 
      message: "Signup successful", 
      user, 
      rootFolder: rootFolder.id, 
    });
    res.cookies.set("token", idToken, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",  
      path: '/',
      maxAge: 60 * 60 * 24 * 30,
      sameSite: 'lax'
    });

    return res;
  } catch (error: any) {
    console.error("Sign-up Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
