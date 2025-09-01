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
    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        uid,
        email,
        name: name || (email? email.split("@")[0]: "User")
        // picture: picture || "",
      });
    }

    return NextResponse.json({ message: "user sign-in successful", user });
  } catch (error: any) {
    console.error("Sign-up Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
