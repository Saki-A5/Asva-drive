import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import type { FileInterface } from "@/models/files";
import { getAssetDeliveryUrl } from "@/lib/cloudinary";

export const runtime = "nodejs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
console.log("Cloudinary config check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? "SET" : "MISSING",
});
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await dbConnect();

  const { id } = await params;
  console.log("PDF proxy hit, id: ", id);

  const fileItem = await FileItemModel.findById(new Types.ObjectId(id)).populate<{
    file: FileInterface;
  }>("file");

  if (!fileItem || !fileItem.file.cloudinaryUrl) {
    return NextResponse.json({ message: "File not found" }, { status: 404 });
  }

  try {
    // public_id is stored with .pdf extension, strip it
    const publicId = fileItem.file.cloudinaryUrl.replace(/\.pdf$/i, "");

    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    console.log("expires_at being passed:", expiresAt);
    const signedUrl = getAssetDeliveryUrl(fileItem.file.cloudinaryUrl, {
    resource_type: "raw",
    type: "authenticated",
    sign_url: true,
    secure: true,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
});

    console.log("Generated signed URL:", signedUrl);

    const response = await axios.get<ArrayBuffer>(signedUrl, {
      responseType: "arraybuffer",
    });

    console.log("Array Buffer Achieved");

    const buffer = Buffer.from(response.data);

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "inline; filename=" +
          encodeURIComponent(fileItem.filename ?? "file.pdf"),
        "Content-Length": buffer.length.toString(),
        "Cache-Control": "private, max-age=3600",
        "Accept-Ranges": "bytes",
      },
    });
  } catch (error: any) {
    console.error("Proxy error:", error.message);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}