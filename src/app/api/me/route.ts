export const runtime = "nodejs";
import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import User from "@/models/users";

export async function GET () {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("token")?.value;

        if (!token) {
            return NextResponse.json({error: "Not authenticated"}, { status: 401 });
        }

        // Verify token and get user info
        const decodedToken = await adminAuth.verifyIdToken(token);
        const { email } = decodedToken;

        await dbConnect();

        // Fetch user from database
        const user = await User.findOne({ email})
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        return NextResponse.json({user})
    } catch (error: any) {
        console.error("Fetch User Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }               
}