export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebaseAdmin";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";

// Update user (PUT)
export async function PUT(req: Request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    
    // Verify Firebase ID token
    const decodedToken = await adminAuth.verifyIdToken(token);
    const { email } = decodedToken as { email?: string };

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await req.json();
    // Whitelist fields that can be updated
    const allowed: string[] = [];
    const updates: any = {};
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    await dbConnect();

    const updated = await User.findOneAndUpdate({ email }, { $set: updates }, { new: true });

    if (!updated) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ 
      message: "User updated", 
      user: updated 
    });
  } catch (error: any) {
    console.error("Update User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Delete user (DELETE)
export async function DELETE() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    const { uid, email } = decodedToken as { uid?: string; email?: string };

    if (!email) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await dbConnect();

    // Remove from MongoDB
    await User.findOneAndDelete({ email });

    // Remove from Firebase auth if uid exists
    if (uid) {
      try {
        await adminAuth.deleteUser(uid);
      } catch (e: any) {
        // Log but don't fail the whole operation if Firebase delete fails
        console.warn("Firebase deleteUser failed:", e?.message || e);
      }
    }

    // Clear authentication cookie
    const res = NextResponse.json({ 
      message: "User deleted" 
    });
    res.cookies.set("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 0,
      sameSite: "lax",
    });

    return res;
  } catch (error: any) {
    console.error("Delete User Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
