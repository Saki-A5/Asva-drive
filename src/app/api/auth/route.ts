export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import FileModel from "@/models/files";
import Otp from "@/models/Otp";
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

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: 60 * 60 * 24 * 5 * 1000
    });


    await dbConnect();

    // Check if OTP for this email was verified
    const otpRecord = await Otp.findOne({ email });
    if (!otpRecord || !otpRecord.verified) {
      return NextResponse.json(
        { error: "Email verification required. Please verify your OTP." },
        { status: 403 }
      );
    }

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        firebaseUid: uid,
        email,
        name: clientName || firebaseName || email.split("@")[0]
      });
    } else {
      user.firebaseUid = uid,
      await user.save()
    }

    let rootFolderId: string;
    try{
      rootFolderId = await createRootIfNotExists(user._id.toString(), "User");
    }
    catch(e: any){
      console.log("[Auth] An error occured while creating the root folder");
      throw new Error(e.message);
    }
    
    // Clean up OTP record after successful signup
    await Otp.deleteOne({ email });

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
      maxAge: 60 * 60 * 24 * 5,
      sameSite: 'lax'
    });

    return res;
  } catch (error: any) {
    console.error("Sign-up Error:", error);
    console.error("Stack Trace:", error?.stack);
    return NextResponse.json({ error: error.message || "Internal Server Error" }, { status: 500 });
  }
}
