import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import { NextResponse } from "next/server";
import { getAllDescendantIds } from "../folder/[id]/route";
import { fileQueue } from "@/lib/queue";
import { requireRole } from "@/lib/roles";
import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";
import { adminAuth } from "@/lib/firebaseAdmin";
import User from "@/models/users";

export const runtime = 'nodejs';

export const POST = async (req: Request) => {
    try {
        await dbConnect();

        const cookies = req.headers.get("cookie") || "";
        const match = cookies.match(/token=([^;]+)/);
        const sessionCookie = match ? match[1] : null;

        if (!sessionCookie) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const decodedToken = await adminAuth.verifySessionCookie(sessionCookie, true);
        const userEmail = decodedToken.email;

        if (!userEmail) {
            return NextResponse.json({ message: "Missing user id" }, { status: 401 });
        }

        const user = await User.findOne({ email: userEmail });
        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        if (user.role !== "admin") {
            return NextResponse.json({ message: "Forbidden" }, { status: 403 });
        }

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

            // restore all the files items and the parent folder item
            await FileItemModel.updateMany({ _id: { $in: descendantFileItems.concat([...descendantFolderItems, fileItemId]) } }, { $set: { isDeleted: false, deletedAt: null } });

            // restore the actual files, if any were soft deleted
            const fileItems = await FileItemModel.find({ _id: { $in: descendantFileItems }, isReference: false }).select<{ file: Types.ObjectId }>("file");
            const fileIds = fileItems.map(fileItem => fileItem.file);
            if (fileIds.length > 0) await FileModel.updateMany({ _id: { $in: fileIds } }, { $set: { isDeleted: false, deletedAt: null } });

        }
        else {

            if ((Date.now() - fileItem.deletedAt!.getTime()) > restoreWindowMs) return NextResponse.json({ message: "Restore Window has passed" });

            // delete the job
            const job = await fileQueue.getJob(`delete-file-${fileItemId}`);
            if (job) await job.remove();

            // restore the file item itself
            await FileItemModel.updateMany(
                { file: fileItem.file },
                { $set: { isDeleted: false, deletedAt: null } }
            );

            // restore the underlying file (and any referenced file models)
            if (fileItem.file) {
                await FileModel.findByIdAndUpdate(fileItem.file, { $set: { isDeleted: false, deletedAt: null } });
                await FileModel.updateMany(
                    { "reference.referencedFile": fileItem.file },
                    { $set: { isDeleted: false, deletedAt: null } }
                );
            }
        }

        return NextResponse.json({ message: "File has been successfully restored" });
    }
    catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}