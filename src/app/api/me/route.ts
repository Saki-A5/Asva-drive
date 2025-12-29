export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";

// Read user (GET)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Verify token and get user info
    const decodedToken = await adminAuth.verifySessionCookie(token, true);
    const { email } = decodedToken;

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Fetch user from database
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ user });
  } catch (error: any) {
    console.error("Fetch User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}