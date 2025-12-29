import { deleteAsset, deleteAssets } from "@/lib/cloudinary";
import FileModel, { FileInterface } from "@/models/files";
import { Job, Worker } from "bullmq";
import { HydratedDocument, Types } from "mongoose";
import { getAllDescendantIds } from "./folder/[id]/route";
import FileItemModel from "@/models/fileItem";

const handleFolderDeletion = async (folderId: Types.ObjectId) => {

    const { descendantFileItems: fileItems, descendantFolderItems: folderItems } = await getAllDescendantIds(folderId);

    // descendantFiles could contain referencedFiles and nonReferencedFiles
    // make sure that only nonReferencedFiles go through this code block
    const files: {file: {cloudinaryUrl: string, _id: Types.ObjectId}}[] = await FileItemModel.find({_id: {$in: fileItems}, isReference: false}).populate<{file: FileInterface}>("file", "cloudinaryUrl _id").select<{file: {cloudinaryUrl: string, _id: Types.ObjectId}}>("file").lean();

    const publicIds = files.map(i => i.file.cloudinaryUrl);
    const ids = files.map(i => i.file._id);

    for (let i = 0; i < publicIds.length; i += 100) {   // cloudinary only allows to delete a 100 elements at once
        const result = await deleteAssets(publicIds.slice(i, i + 100));
        if(result.error){
            throw new Error(`[Folder Deletion] ${result.error}`);
        }
    }
    // delete the actual files
    await FileModel.deleteMany(ids);
    // delete the files and folders
    await FileModel.deleteMany(fileItems.concat(folderItems));
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

        // delete the actual file
        await FileModel.findOneAndDelete(fileId);
        // delete the file Item and all references
        await FileItemModel.deleteMany({file: fileId});

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