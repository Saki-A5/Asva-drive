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

  const response = await axios.get<ArrayBuffer>(signedUrl, {
    responseType: "arraybuffer",
  });

  const buffer = Buffer.from(response.data)

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition":
        "inline; filename=" + encodeURIComponent(fileItem.filename ?? "file.pdf"),
      "Content-Length": response.headers["content-length"] || undefined,
      "Cross-Origin-Resource-Policy": "same-origin",
    },
  });
}
