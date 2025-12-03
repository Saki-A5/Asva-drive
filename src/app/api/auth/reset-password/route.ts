export const runtime = "nodejs";

import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import PasswordReset from "@/models/passwordReset";
import { adminAuth } from "@/lib/firebaseAdmin";

export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return NextResponse.json(
        { error: "Token and new password are required" },
        { status: 400 }
      );
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: "Password must be at least 6 characters" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Find the reset token
    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() }, // Not expired
    });

    if (!resetToken) {
      return NextResponse.json(
        { error: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Find the user
    const user = await User.findOne({ email: resetToken.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get Firebase user by email
    let firebaseUser;
    try {
      firebaseUser = await adminAuth.getUserByEmail(resetToken.email);
    } catch (error: any) {
      return NextResponse.json(
        { error: "User not found in authentication system" },
        { status: 404 }
      );
    }

    // Update password in Firebase
    try {
      await adminAuth.updateUser(firebaseUser.uid, {
        password: newPassword,
      });
    } catch (error: any) {
      console.error("Firebase password update error:", error);
      return NextResponse.json(
        { error: "Failed to update password. Please try again." },
        { status: 500 }
      );
    }

    // Mark token as used
    resetToken.used = true;
    await resetToken.save();

    // Delete all reset tokens for this email (cleanup)
    await PasswordReset.deleteMany({ email: resetToken.email });

    return NextResponse.json({
      message: "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error: any) {
    console.error("Reset Password Error:", error);
    return NextResponse.json(
      { error: error.message || "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

// Verify token validity (for checking if token is valid before showing reset form)
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    const resetToken = await PasswordReset.findOne({
      token,
      used: false,
      expiresAt: { $gt: new Date() },
    });

    if (!resetToken) {
      return NextResponse.json(
        { valid: false, error: "Invalid or expired token" },
        { status: 400 }
      );
    }

    return NextResponse.json({ valid: true });
  } catch (error: any) {
    console.error("Token Verification Error:", error);
    return NextResponse.json(
      { valid: false, error: "An error occurred" },
      { status: 500 }
    );
  }
}

