export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/users";
import PasswordReset from "@/models/passwordReset";
import { sendPasswordResetEmail } from "@/lib/email";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    await dbConnect();

    // Check if user exists
    const user = await User.findOne({ email });
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Generate secure token
      const token = randomBytes(32).toString("hex");
      
      // Set expiration to 1 hour from now
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 1);

      // Delete any existing reset tokens for this email
      await PasswordReset.deleteMany({ email });

      // Create new reset token
      await PasswordReset.create({
        email,
        token,
        expiresAt,
        used: false,
      });

      // Generate reset link
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 
        (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : null) ||
        "http://localhost:3000";
      const resetLink = `${baseUrl}/reset-password?token=${token}`;

      // Send email
      try {
        await sendPasswordResetEmail(email, resetLink);
      } catch (emailError: any) {
        console.error("Email sending error:", emailError);
        // Still return success to user, but log the error
      }
    }

    // Always return success message
    return NextResponse.json({
      message: "If an account with that email exists, a password reset link has been sent.",
    });
  } catch (error: any) {
    console.error("Forgot Password Error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again later." },
      { status: 500 }
    );
  }
}

