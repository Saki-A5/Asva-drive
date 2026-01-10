import { getAsset, getAssetDeliveryUrl } from "@/lib/cloudinary";
import dbConnect from "@/lib/dbConnect";
import FileModel, { FileInterface } from "@/models/files";
import { Types, Schema } from "mongoose";
import { NextResponse } from "next/server";
import User from "@/models/users";
import { requireRole } from "@/lib/roles";
import { fileQueue } from "@/lib/queue";
import FileItemModel from "@/models/fileItem";

export const runtime = 'nodejs';

export const GET = async (req: Request, { params }: any) => {
    const { id } = await params;
    const fileItemId = new Types.ObjectId(id as string);

    await dbConnect();
    const fileItem = await FileItemModel.findOne({ _id: fileItemId }).populate<{ file: FileInterface }>("file");
    if (!fileItem) return NextResponse.json({ message: 'No Such File exists' }, { status: 404 });

    try {
        const signedUrl = getAssetDeliveryUrl(fileItem.file.cloudinaryUrl, {
            attachment: true,
            resource_type: fileItem.file.resourceType,
            sign_url: true,
            secure: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600, // default of one hour
            type: 'authenticated'
        });
        console.log(signedUrl);
        return NextResponse.json({ message: "Successfully Retrieved Asset", fileItem, signedUrl });
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

        const user = await User.findOne({ email: 'demo@gmail.com' });
        const { id } = await params;
        const fileItemId = new Types.ObjectId(id);
        const ownerId = user.role === 'admin' ? user.collegeId : user._id;

        const fileItem = await FileItemModel.findOne({ _id: fileItemId, ownerId });
        if (!fileItem) return NextResponse.json({ message: "No File Found" }, { status: 404 });

        // if file is a reference file,  delete that reference file
        if (fileItem.isReference) {
            await FileItemModel.findOneAndDelete(fileItemId);
            return NextResponse.json({ message: "Reference File Successfully Deleted" })
        }

        // soft delete the actual file
        await FileModel.findByIdAndUpdate(fileItem.file, { $set: { isDeleted: true, deletedAt: Date.now() } }),
            // soft delete the file Item
            await FileItemModel.updateOne({ file: fileItem.file }, { $set: { isDeleted: true, deletedAt: Date.now() } })

        // add the deleted file to the deleted queue so that 
        const fileRestoreWindow = +(!process.env.FILE_RESTORE_WINDOW) || 28;
        const delay = fileRestoreWindow * (1000 * 60 * 60 * 24);
        await fileQueue.add(
            'delete-file',
            { id: fileItem.file },
            {
                delay,
                attempts: 5,
                backoff: { type: 'exponential', delay: 1000 },
                removeOnComplete: true,
                jobId: `delete-file-${fileItemId}`
            }
        )

        return NextResponse.json({ message: "Successfully Deleted File" });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ message: (error as Error).message || "Internal Server Error" }, { status: 500 });
    }
}