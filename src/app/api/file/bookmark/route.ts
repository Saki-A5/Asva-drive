export const runtime = "nodejs";

import dbConnect from "@/lib/dbConnect";
import { adminAuth } from "@/lib/firebaseAdmin";
import FileItemModel from "@/models/fileItem";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

/**
 * POST /api/file/bookmark
 *
 * Saves a reference to a college file into the authenticated user's My Files.
 * - Only normal users (role !== "admin") may call this.
 * - Folders cannot be bookmarked.
 * - Creates a FileItem in the user's chosen folder (or root) that points to the
 *   same underlying `file` document as the original, so no file data is duplicated.
 *
 * Body: { sourceFileItemId: string, targetFolderId?: string }
 */
export const POST = async (req: Request) => {
  await dbConnect();

  // Auth
  const cookies = req.headers.get("cookie") || "";
  const match = cookies.match(/token=([^;]+)/);
  const sessionCookie = match ? match[1] : null;

  if (!sessionCookie) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  let decodedToken;
  try {
    decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
  } catch {
    return NextResponse.json({ message: "Invalid session" }, { status: 401 });
  }

  const user = await User.findOne({ email: decodedToken.email });
  if (!user) {
    return NextResponse.json({ message: "User not found" }, { status: 401 });
  }

  // Admins cannot use this endpoint
  if (user.role === "admin") {
    return NextResponse.json({ message: "Forbidden" }, { status: 403 });
  }

  // Body
  let body: { sourceFileItemId?: string; targetFolderId?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ message: "Invalid JSON body" }, { status: 400 });
  }

  const { sourceFileItemId, targetFolderId } = body;

  if (!sourceFileItemId || !Types.ObjectId.isValid(sourceFileItemId)) {
    return NextResponse.json(
      { message: "sourceFileItemId is required and must be a valid ObjectId" },
      { status: 400 },
    );
  }

  // Source file validation
  const source = await FileItemModel.findById(sourceFileItemId);
  if (!source) {
    return NextResponse.json(
      { message: "Source file not found" },
      { status: 404 },
    );
  }
  if (source.isFolder) {
    return NextResponse.json(
      { message: "Folders cannot be saved to My Files" },
      { status: 400 },
    );
  }

  // Resolve destination folder
  const userId = user._id;

  let parentFolder;
  if (targetFolderId) {
    if (!Types.ObjectId.isValid(targetFolderId)) {
      return NextResponse.json(
        { message: "Invalid targetFolderId" },
        { status: 400 },
      );
    }
    parentFolder = await FileItemModel.findOne({
      _id: new Types.ObjectId(targetFolderId),
      ownerId: userId,
      isFolder: true,
      isDeleted: { $ne: true },
    });
    if (!parentFolder) {
      return NextResponse.json(
        { message: "Target folder not found or does not belong to you" },
        { status: 404 },
      );
    }
  } else {
    // Fall back to the user's root folder
    parentFolder = await FileItemModel.findOne({
      ownerId: userId,
      isRoot: true,
    });
    if (!parentFolder) {
      return NextResponse.json(
        { message: "Root folder not found" },
        { status: 404 },
      );
    }
  }

  // Duplicate check
  // Prevent saving the same file into the same folder twice
  const alreadyExists = await FileItemModel.findOne({
    ownerId: userId,
    parentFolderId: parentFolder._id,
    file: source.file,
    isDeleted: { $ne: true },
  });
  if (alreadyExists) {
    return NextResponse.json(
      { message: "This file is already saved in the selected folder" },
      { status: 409 },
    );
  }

  // Create the bookmark FileItem
  const bookmark = await FileItemModel.create({
    filename: source.filename,
    isFolder: false,
    parentFolderId: parentFolder._id,
    ownerId: userId,
    ownerType: "User",
    file: source.file, // same File document — no duplication
    isBookmark: true, // optional flag; add to your schema if you want to distinguish bookmarks
  });

  return NextResponse.json(
    {
      message: "File saved to My Files",
      data: { bookmarkId: bookmark._id },
    },
    { status: 201 },
  );
};
