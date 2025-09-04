import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";

export const POST = async(req: Request) => {
  try {
    const { idToken } = await req.json();

    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(idToken);
    const { uid, email, name} = decodedToken;

    await dbConnect();

    // Find or create user
    let user = await User.findOne({ uid });
    if (!user) {
      return NextResponse.json({ error: "User not found. Please sign up first" }, { status: 404 });
    }

    return NextResponse.json({ message: "Login successful", user });
  } catch (error: any) {
    console.error("Login Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}