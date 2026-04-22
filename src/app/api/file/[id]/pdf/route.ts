import { NextResponse } from "next/server";
import axios, { AxiosError } from "axios";
import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";
import { v2 as cloudinary } from "cloudinary";
import type { FileInterface } from "@/models/files";
import { getAssetDeliveryUrl, getAssetUrl } from "@/lib/cloudinary";
import https from 'https';

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
    // Use the cloudinaryUrl directly - it already has the .pdf extension
    const publicId = fileItem.file.cloudinaryUrl;

    const expiresAt = Math.floor(Date.now() / 1000) + 3600;
    console.log("expires_at being passed:", expiresAt);
    console.log("Public ID for signed URL:", publicId);
    
    const signedUrl = await getAssetUrl(publicId, {
      resource_type: "raw",
      type: "authenticated",
      expires_at: expiresAt,
    });

    console.log("Generated signed URL:", signedUrl);

    const response = await axios.get<ArrayBuffer>(signedUrl, {
      responseType: "arraybuffer",
      httpsAgent: new https.Agent({ family: 4 })   // use Ipv4 by default
    });

    console.log("Response status:", response.status);
    console.log("Response data size:", response.data?.byteLength || 0);
    console.log("Response headers:", response.headers);

    if (!response.data || response.data.byteLength === 0) {
      console.error("Received empty response from Cloudinary");
      return NextResponse.json(
        { message: "Empty PDF from Cloudinary" },
        { status: 500 }
      );
    }

    console.log("Array Buffer Achieved");

    const buffer = Buffer.from(response.data);
    console.log("Buffer size:", buffer.length);

    return new Response(buffer, {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition":
          "inline; filename=" +
        encodeURIComponent(fileItem.filename ?? "file.pdf"),
        "Content-Length": buffer.length.toString(),
      "Cache-Control": "private, max-age=3600",
    },
  });
  } catch (error: any) {
    console.log("Error type:", error instanceof AxiosError);
    if(error instanceof AxiosError){
      console.log("AxiosError details:", error.toJSON());
      console.log("Response status:", error.response?.status);
      console.log("Response data:", error.response?.data);
    }
    console.error("Proxy error:", error);
    return NextResponse.json(
      { 
        message: error.message,
        details: error instanceof AxiosError ? error.response?.data : undefined
      }, 
      { status: 500 }
    );
  }
}