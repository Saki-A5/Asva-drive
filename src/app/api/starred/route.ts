import "@/models/files";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FileItemModel from "@/models/fileItem";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";

export const GET = async (req: Request) => {
  try {
    await dbConnect();

    // ── Auth ──────────────────────────────────────────────────────────────────
    const cookies = req.headers.get("cookie") || "";
    const match = cookies.match(/token=([^;]+)/);
    const sessionCookie = match ? match[1] : null;

    if (!sessionCookie) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decodedToken = await adminAuth.verifySessionCookie(
      sessionCookie,
      true,
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

    // ── Get starred files sorted by updatedAt (most recent first) ────────────
    const files = await FileItemModel.find({
      ownerId,
      starred: true,
      isDeleted: { $ne: true },
    })
      .sort({ updatedAt: -1 })
      .populate({
        path: "file",
        select: "sizeBytes mimeType updatedAt uploadedBy",
        populate: {
          path: "uploadedBy",
          select: "email name",
        },
      });

    return NextResponse.json({
      message: "Starred files fetched",
      data: files,
    });
  } catch (error: any) {
    console.error("Error fetching starred files:", error);
    return NextResponse.json(
      { message: error.message || "Internal server error" },
      { status: 500 },
    );
  }
};
