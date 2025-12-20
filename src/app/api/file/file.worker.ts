import { deleteAsset, deleteAssets } from "@/lib/cloudinary";
import FileModel from "@/models/files";
import { Job, Worker } from "bullmq";
import { Types } from "mongoose";
import { getAllDescendantIds } from "./folder/[id]/route";

const handleFolderDeletion = async (folderId: Types.ObjectId) => {

    const { descendantFiles, descendantFolders } = await getAllDescendantIds(folderId);

    const publicIds = (
        await Promise.all(
            descendantFiles.map(async (id) => {
                const file = await FileModel.findById(id)
                    .select("cloudinaryUrl")
                    .lean() as { cloudinaryUrl?: string } | null;
                return file?.cloudinaryUrl ?? null;
            })
        )
    ).filter((p): p is string => p !== null);

    for (let i = 0; i < publicIds.length; i += 100) {   // cloudinary only allows to delete a 100 elements at once
        const result = await deleteAssets(publicIds.slice(i, i + 100));
        if(result.error){
            throw new Error(`[Folder Deletion] ${result.error}`);
        }
    }

    // delete the files and folders
    await FileModel.deleteMany({ id: { $in: descendantFiles.concat(descendantFolders) } });
    // also delete the folder
    await FileModel.findByIdAndDelete(folderId);

    return true;
}

const handleFileDeletion = async (fileId: Types.ObjectId) => {
    try {
        const file = await FileModel.findOne({ _id: fileId });
        if (!file) throw new Error("[File-Deletion] File Not Found");

        const result = await deleteAsset(file.cloudinaryUrl, file.resourceType);
        if (result.error) {
            throw new Error(`[File Deletion] ${result.error}`);
        };

        await FileModel.deleteOne({ _id: file._id });

        console.log(`[File-Deletion] successfully deleted file`);
        return true;
    }
    catch (e: any) {
        console.error(`[File-Deletion] ${e}`);
        throw new Error(e.message);
    }
}

const worker = new Worker(
    'file',
    async (job: Job) => {
        if (job.name === "delete-file") {
            const data = job.data as { fileId: Types.ObjectId };
            handleFileDeletion(data.fileId);
        }
        else if (job.name === 'delete-folder') {
            const data = job.data as { folderId: Types.ObjectId };
            handleFolderDeletion(data.folderId);
        }
    }
)

worker.on('completed', job => console.log('File job completed', job.id))
worker.on('failed', (job, err) => console.error('File job failed', job?.id, err))

console.log('Worker started: file')