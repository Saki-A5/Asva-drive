import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationSchema";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";
import { NextResponse } from "next/server";

export const GET = async (req: Request) => {
  try {
    await dbConnect();

    // Get session cookie
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // Verify session
    const decoded = await adminAuth.verifySessionCookie(sessionCookie, true);
    const user = await User.findOne({ email: decoded.email });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const notifications = await Notification.find({ userId: user._id })
      .sort({ createdAt: -1 });

    return NextResponse.json({ data: notifications });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
};
