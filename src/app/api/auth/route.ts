export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import FileModel from "@/models/files";
import { Types } from "mongoose";
import FileItemModel from "@/models/fileItem";
import { createRootIfNotExists } from "@/lib/fileUtil";

// Create user (POST)
export async function POST(req: Request) {
  try {
    const { idToken, name: clientName } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name: firebaseName } = decodedToken;

    const sessionCookie = await adminAuth.createSessionCookie(idToken, { 
      expiresIn: 60 * 60 * 24 * 5 * 1000 
    });

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
        name: clientName || firebaseName || email ? email.split("@")[0] : "User"
      });
    }

    // find or create the root folder
    let rootFolderId = await createRootIfNotExists(uid, "User");
    try {
      rootFolderId = await createRootIfNotExists(uid, "User");
    } catch (error) {
      console.error("Error creating root folder:", error);
      throw new Error("Failed to create root folder");
    }
    // Set authentication cookie
    const res = NextResponse.json({ 
      message: "Signup successful", 
      user, 
      rootFolder: rootFolderId,
    });
    res.cookies.set("token", sessionCookie, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",  
      path: '/',
      maxAge: 60 * 60 * 24 * 5 * 1000,
      sameSite: 'lax'
    });

    return res;
  } catch (error: any) {
    console.error("Sign-up Error:", error);
    console.error("Stack Trace:", error?.stack);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
