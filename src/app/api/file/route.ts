import "@/models/files";
import { NextResponse } from "next/server";
import dbConnect from "@/lib/dbConnect";
import FileItemModel from "@/models/fileItem";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";

// First page: 24 items. Every page after: 16 items.
const FIRST_PAGE_LIMIT = 24;
const NEXT_PAGE_LIMIT = 16;

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

    // ── Pagination params ─────────────────────────────────────────────────────
    // page=1 → first 24 items
    // page=2 → next 16, page=3 → next 16, etc.
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10));

    // Calculate skip + limit
    // page 1: skip=0, limit=24
    // page 2: skip=24, limit=16
    // page 3: skip=40, limit=16  etc.
    const limit = page === 1 ? FIRST_PAGE_LIMIT : NEXT_PAGE_LIMIT;
    const skip =
      page === 1 ? 0 : FIRST_PAGE_LIMIT + (page - 2) * NEXT_PAGE_LIMIT;

    // ── Root folder ───────────────────────────────────────────────────────────
    const rootFolder = await FileItemModel.findOne({ ownerId, isRoot: true });

    if (!rootFolder) {
      return NextResponse.json(
        { message: "Root folder not found" },
        { status: 404 },
      );
    }

    // ── Query with pagination ─────────────────────────────────────────────────
    const baseQuery = {
      ownerId,
      parentFolderId: rootFolder._id,
      isDeleted: { $ne: true },
    };

    const [files, total] = await Promise.all([
      FileItemModel.find(baseQuery)
        .skip(skip)
        .limit(limit)
        .populate({
          path: "file",
          select: "sizeBytes mimeType updatedAt uploadedBy",
          populate: {
            path: "uploadedBy",
            select: "email name",
          },
        }),
      FileItemModel.countDocuments(baseQuery),
    ]);

    const hasMore = skip + files.length < total;

    return NextResponse.json({
      message: "Files fetched",
      data: files,
      pagination: {
        page,
        limit,
        total,
        hasMore,
      },
    });
  } catch (error: any) {
    console.error("Error fetching files:", error);
    return NextResponse.json(
      { message: "Internal server error", error: error.message },
      { status: 500 },
    );
  }
};
