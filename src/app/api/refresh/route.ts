export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";

export const POST = async (req: Request) => {
  try {
    const { idToken } = await req.json();

    // If idToken is provided, use it to create a new session cookie
    if (idToken) {
      // Verify Firebase ID token
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      // Create new session cookie with 5-day expiration (same as login)
      const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days in milliseconds
      const sessionCookie = await adminAuth.createSessionCookie(idToken, { expiresIn });

      // Set the new session cookie
      const res = NextResponse.json({ 
        message: "Session refreshed successfully",
        expiresIn: expiresIn / 1000 // Return expiration in seconds for client reference
      });
      
      res.cookies.set("token", sessionCookie, { 
        httpOnly: true, 
        secure: process.env.NODE_ENV === "production",  
        path: '/',
        maxAge: expiresIn / 1000, // Convert to seconds
        sameSite: 'lax'
      });

      return res;
    }

    // If no idToken provided, try to verify existing session cookie
    const cookieStore = await cookies();
    const existingToken = cookieStore.get("token")?.value;

    if (!existingToken) {
      return NextResponse.json({ 
        error: "No session found. Please provide an idToken or log in again." 
      }, { status: 401 });
    }

    try {
      // Check if existing session cookie is still valid (not expired)
      const decodedCookie = await adminAuth.verifySessionCookie(existingToken, true);
      
      // Session is still valid, return success without creating a new cookie
      // The client can optionally provide a fresh idToken to extend the session
      return NextResponse.json({ 
        message: "Session is still valid",
        valid: true 
      });
    } catch (error: any) {
      // Session cookie is expired or invalid
      return NextResponse.json({ 
        error: "Session expired. Please provide a fresh idToken to refresh the session." 
      }, { status: 401 });
    }
  } catch (error: any) {
    console.error("Refresh Session Error:", error);
    return NextResponse.json({ 
      error: error.message || "Failed to refresh session" 
    }, { status: 401 });
  }
};

