import { NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebaseAdmin";

export const POST = async (req: Request) => {
  try {
    // Get the current session cookie from the request
    const cookieHeader = req.headers.get("cookie") || "";
    const cookies = Object.fromEntries(
      cookieHeader.split("; ").map((c) => {
        const [key, val] = c.split("=");
        return [key, decodeURIComponent(val)];
      })
    );
    const sessionCookie = cookies.token;

    if (!sessionCookie) {
      return NextResponse.json({ error: "No session cookie found" }, { status: 401 });
    }

    // Verify the session cookie
    const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);

    // Create a new session cookie to extend expiry
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const newSessionCookie = await adminAuth.createSessionCookie(sessionCookie, { expiresIn });

    // Set the new cookie
    const res = NextResponse.json({ message: "Session refreshed" });
    res.cookies.set("token", newSessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: expiresIn / 1000,
    });

    return res;
  } catch (error: any) {
    console.error("Refresh Error:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
};