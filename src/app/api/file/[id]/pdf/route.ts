import { NextResponse } from "next/server";
import axios from "axios";
import dbConnect from "@/lib/dbConnect";
import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";
import { getAssetDeliveryUrl } from "@/lib/cloudinary";
import type { FileInterface } from "@/models/files";

export const runtime = "nodejs";

export async function GET(request: Request, { params }: {params: Promise<{id: string}>}) {
  await dbConnect();

  const {id} = await params;
  const fileItem = await FileItemModel
  .findById(new Types.ObjectId(id))
  .populate<{ file: FileInterface }>("file");

if (!fileItem || !fileItem.file.cloudinaryUrl) {
  return NextResponse.json(
    { message: "File not found" },
    { status: 404 }
  );
}

const signedUrl = getAssetDeliveryUrl(fileItem.file.cloudinaryUrl, {
  secure: true,
  resource_type: "raw",
});

try {
  const response = await axios.get<ArrayBuffer>(signedUrl, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        "inline; filename=" + encodeURIComponent(fileItem.filename ?? "file.pdf"),
      "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=3600",
      "Accept-Ranges": "bytes",
    },
  });
} catch (error) {
  console.error("Error fetching PDF from Cloudinary:", error);
  return NextResponse.json(
    { message: "Failed to fetch PDF" },
    { status: 500 }
  );
}
}
