import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import { NextResponse } from "next/server";
import { getAllDescendantIds } from "../folder/[id]/route";
import { fileQueue } from "@/lib/queue";
import { requireRole } from "@/lib/roles";

export const runtime = 'nodejs';

export const POST = async(req: Request) => {
    try{
        await dbConnect();

        // const {user, error, status} = await requireRole(req, ['admin']);
        // if(error) return NextResponse.json({error}, {status});
        
        const {fileId} = await req.json();

        const restoreWindow = Number(process.env.FILE_RESTORE_WINDOW) || 28;
        const restoreWindowMs = restoreWindow * 24 * 60 * 60 * 1000;
        
        const file = await FileModel.findById(fileId);
        if(!file) return NextResponse.json({error: "File Not Found"}, {status: 404});

        if(!file.isDeleted) return NextResponse.json({error: "File has not been deleted"}, {status: 400});

        if(file.isFolder){
            const {descendantFiles, descendantFolders} = await getAllDescendantIds(fileId);
            // check if the restore window has passed
            if((Date.now() - file.deleteAt) > restoreWindowMs){
                return NextResponse.json({message: "Restore window has passed"});
            } 
            
            // delete the job
            const job = await fileQueue.getJob(`delete-folder-${fileId}`);
            if(job) await job.remove();

            // restore all the files and folders
            await FileModel.updateMany({id: {$in: descendantFiles.concat(descendantFolders)}}, {$set: {isDeleted: false, deletedAt: null}});
        }
        else{

            if((Date.now() - file.deletedAt) > restoreWindowMs) return NextResponse.json({message: "Restore Window has passed"});

            // delete the job
            const job = await fileQueue.getJob(`delete-file-${fileId}`);
            if(job) await job.remove();

            // restore the file
            await FileModel.findByIdAndUpdate(fileId, {$set: {isDeleted: false, deletedAt: null}});
        }

        return NextResponse.json({message: "File has been successfully restored"});
    }
    catch(e: any){
        console.error(e);
        return NextResponse.json({error: e.message}, {status: 500});
    }
}