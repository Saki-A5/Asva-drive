import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import Notification from "@/models/notificationSchema";
import { Types } from "mongoose";
export const PATCH = async (req: Request, { params }: any) => {
  const { id } = params;

  if (!id) return NextResponse.json({ error: "Notification ID is required" }, { status: 400 });

  await dbConnect();

  try {
    const notification = await Notification.findByIdAndUpdate(
      new Types.ObjectId(id),
      { read: true },
      { new: true }
    );

    if (!notification) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marked as read", data: notification });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
};