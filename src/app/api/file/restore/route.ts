import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import { NextResponse } from "next/server";
import { getAllDescendantIds } from "../folder/[id]/route";
import { fileQueue } from "@/lib/queue";
import { requireRole } from "@/lib/roles";
import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
    try {
        await dbConnect();

        // const {user, error, status} = await requireRole(req, ['admin']);
        // if(error) return NextResponse.json({error}, {status});

        const { fileItemId } = await req.json();

        const restoreWindow = Number(process.env.FILE_RESTORE_WINDOW) || 28;
        const restoreWindowMs = restoreWindow * 24 * 60 * 60 * 1000;

        const fileItem = await FileItemModel.findById(fileItemId);
        if (!fileItem) return NextResponse.json({ error: "File Not Found" }, { status: 404 });

        if (!fileItem.isDeleted) return NextResponse.json({ error: "File has not been deleted" }, { status: 400 });

        if (fileItem.isFolder) {
            const { descendantFileItems, descendantFolderItems } = await getAllDescendantIds(fileItemId);
            // check if the restore window has passed
            if ((Date.now() - fileItem.deletedAt!.getTime()) > restoreWindowMs) {
                return NextResponse.json({ message: "Restore window has passed" });
            }

            // delete the job
            const job = await fileQueue.getJob(`delete-folder-${fileItemId}`);
            if (job) await job.remove();

            // restore all the files items
            await FileItemModel.updateMany({ id: { $in: descendantFileItems.concat(descendantFolderItems) } }, { $set: { isDeleted: false, deletedAt: null } });
            // restore the actual files, if any were soft deleted
            const fileIds = await FileItemModel.find({ _id: { $in: descendantFileItems }, isReference: false }).select<{ file: { _id: Types.ObjectId } }>("file._id");
            if (fileIds.length > 0) await FileModel.updateMany({ _id: { $in: fileIds } }, { isDeleted: false, deletedAt: null });
        }
        else {

            if ((Date.now() - fileItem.deletedAt!.getTime()) > restoreWindowMs) return NextResponse.json({ message: "Restore Window has passed" });

            // delete the job
            const job = await fileQueue.getJob(`delete-file-${fileItemId}`);
            if (job) await job.remove();

            // restore the file
            await FileModel.findByIdAndUpdate(fileItemId, { $set: { isDeleted: false, deletedAt: null } });
            // restore referenced files
            await FileModel.updateMany({ "reference.referencedFile": fileItemId }, { $set: { isDeleted: false, deletedAt: null } })
        }

        return NextResponse.json({ message: "File has been successfully restored" });
    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}