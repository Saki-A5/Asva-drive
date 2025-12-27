import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationSchema";

export const PATCH = async (req: Request) => {
  const { userId } = await req.json();

  if (!userId) return NextResponse.json({ error: "User ID is required" }, { status: 400 });

  await dbConnect();

  try {
    const result = await Notification.updateMany(
      { userId, read: false },
      { read: true }
    );

    return NextResponse.json({ message: "All notifications marked as read", data: result });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};