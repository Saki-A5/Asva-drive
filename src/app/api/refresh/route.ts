import { NextResponse } from "next/server"
import { adminAuth } from "@/lib/firebaseAdmin"

export const POST = async (req: Request) => {
  try {
    const { idToken } = await req.json()
    if (!idToken) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 })
    }

    // Verify the token with Firebase Admin
    const decodedToken = await adminAuth.verifyIdToken(idToken)


    // Reset cookie
    const res = NextResponse.json({ message: "Token refreshed" })
    res.cookies.set("token", idToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    })

    return res
  } catch (error: any) {
    console.error("Refresh Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
