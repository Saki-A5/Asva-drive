import dbConnect from "@/lib/dbConnect";
import FileItemModel from "@/models/fileItem";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export const GET = async (req: Request) => {
  try {
    await dbConnect();

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

    if (user.role !== "admin") {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const ownerId = user.collegeId;

    const trashedItems = await FileItemModel.find({
      ownerId,
      isDeleted: true,
    }).populate({
      path: "file",
      select: "sizeBytes mimeType updatedAt uploadedBy",
      populate: {
        path: "uploadedBy",
        select: "email name",
      },
    });

    return NextResponse.json({
      message: "Trashed items fetched",
      data: trashedItems,
    });
  } catch (error: any) {
    console.error("Error fetching trashed items:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
};

