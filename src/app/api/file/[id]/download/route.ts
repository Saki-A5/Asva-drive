import { getAssetDeliveryUrl } from "@/lib/cloudinary";
import FileItemModel from "@/models/fileItem";
import FileModel from "@/models/files";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
    try {
        const { id } = await params;

        const fileItem = await FileItemModel.findById(id);
        if (!fileItem) return NextResponse.json({ error: "Could not find file" }, { status: 404 });

        // get the actual file
        const file = await FileModel.findById(fileItem.file);
        if(!file) return NextResponse.json({error: "File could not be found"}, {status: 404});
        

        const signedUrl = getAssetDeliveryUrl(file.cloudinaryUrl, {
            attachment: true,
            resource_type: file.resourceType,
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // default of one hour
            type: 'authenticated'
        });

        return NextResponse.json({ message: "Successfully retrieved delivery Url", signedUrl })
    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Internal Server Error" }, { status: 500 });
    }
}