import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FileItemModel from "@/models/fileItem";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";
import { Types } from "mongoose";

export const runtime = "nodejs";

/**
 * POST /api/file/[id]/star
 * 
 * Toggles the starred status of a file or folder.
 * Returns the updated starred status.
 */
export const POST = async (req: Request, { params }: any) => {
  try {
    await dbConnect();

    const { id } = await params;

    if (!Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { message: "Invalid file ID" },
        { status: 400 }
      );
    }

    // ── Auth ────────────────────────────────────────────────────────────────
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true
    );
    const userEmail = decodedToken.email;

    if (!userEmail) {
      return NextResponse.json({ message: "Missing user id" }, { status: 401 });
    }

    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const ownerId = user.role === "admin" ? user.collegeId : user._id;

    // ── Find and update the file item ───────────────────────────────────────
    const fileItem = await FileItemModel.findOne({
      _id: new Types.ObjectId(id),
      ownerId,
      isDeleted: { $ne: true },
    });

    if (!fileItem) {
      return NextResponse.json(
        { message: "File not found" },
        { status: 404 }
      );
    }

    // Toggle starred status
    fileItem.starred = !fileItem.starred;
    await fileItem.save();

    return NextResponse.json({
      message: "File starred status updated",
      data: {
        id: fileItem._id,
        starred: fileItem.starred,
      },
    });
  } catch (error: any) {
    console.error("Error updating starred status:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 }
    );
  }
};
