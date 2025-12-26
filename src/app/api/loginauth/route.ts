export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";

export const POST = async (req: Request) => {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { email} = decodedToken;

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up first" }, { status: 404 });
    }

    // firebase session cookie
    const expiresIn = 60 * 60 * 24 * 28; // 5 days
    const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

    // cookie
    const res = NextResponse.json({ message: "Login successful", user });
    res.cookies.set("token", sessionCookie, { 
      httpOnly: true, 
      secure: process.env.NODE_ENV === "production",  
      path: '/',
      maxAge: 60 * 60 * 24 * 28, 
      sameSite: 'lax'
    });

    return res;
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: "Authentication failed" }, { status: 401 });
  }
}