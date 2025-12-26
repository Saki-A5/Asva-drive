import { getAsset, getAssetDeliveryUrl } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import { Types } from "mongoose";
import { NextResponse } from "next/server";
import User from "@/models/users";
import { requireRole } from "@/lib/roles";
import { fileQueue } from "@/lib/queue";

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
    const { id } = await params;
    const fileId = new Types.ObjectId(id as string);

    await dbConnect();
    const file = await FileModel.findOne({ _id: fileId });
    if (!file) return NextResponse.json({ message: 'No Such File exists' }, { status: 404 });

    try {
        const signedUrl = getAssetDeliveryUrl(file.cloudinarUrl, {
            attachment: false, 
            resource_type: file.resourceType, 
            secure: true
        });
        return NextResponse.json({ message: "Successfully Retrieved Asset", file, signedUrl});
    }
    catch (e: any) {
        return NextResponse.json({ message: e.message }, { status: 500 })
    }

}

// delete a file
export const DELETE = async (req: Request, { params }: any) => {
    try {
        await dbConnect();

        // const { user, error, status } = await requireRole(req, ['admin']);
        // if (error) return NextResponse.json({ error }, { status });

        const user = await User.findOne({email: 'demo@gmail.com'});
        const { id } = await params;
        const fileId = new Types.ObjectId(id);

        const file = await FileModel.findOne({ _id: fileId, ownerId: user._id });
        if (!file) return NextResponse.json({ message: "No File Found" }, { status: 404 });

        await FileModel.findByIdAndUpdate(fileId, {
            isDeleted: true,
            deletedAt: new Date()
        });

        // add the deleted file to the deleted queue so that 
        const fileRestoreWindow = +(!process.env.FILE_RESTORE_WINDOW) || 28;
        const delay = fileRestoreWindow * (1000 * 60 * 60 * 24);
        await fileQueue.add(
            'delete-file', 
            {id: fileId}, 
            {   
                delay,
                attempts: 5, 
                backoff: {type: 'exponential', delay: 1000}, 
                removeOnComplete: true, 
                jobId: `delete-file-${fileId}`
            }
        )

        return NextResponse.json({ message: "Successfully Deleted File" }, { status: 200 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: (error as Error).message || "Internal Server Error" }, { status: 500 });
    }
}