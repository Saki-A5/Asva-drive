import { deleteAsset, deleteAssets } from "@/lib/cloudinary";
import FileModel, { FileInterface } from "@/models/files";
import FileItemModel from "@/models/fileItem";
import { Worker, Job } from "bullmq";
import { Types } from "mongoose";
import { getAllDescendantIds } from "./folder/[id]/route";

// --- Redis Connection (Upstash) ---
const redisConnection = {
  host: process.env.UPSTASH_REDIS_HOST,
  port: Number(process.env.UPSTASH_REDIS_PORT),
  password: process.env.UPSTASH_REDIS_PASSWORD,
  tls: {},
};

// --- Handle Folder Deletion ---
const handleFolderDeletion = async (folderId: Types.ObjectId) => {
  console.log(`[Folder Deletion] Starting deletion for folder: ${folderId}`);

  const { descendantFileItems, descendantFolderItems } = await getAllDescendantIds(folderId);

  // Only delete non-referenced files
  const files = await FileItemModel.find({
    _id: { $in: descendantFileItems },
    isReference: false,
  })
    .populate<{ file: FileInterface }>("file", "cloudinaryUrl _id")
    .lean<{ file: { cloudinaryUrl: string; _id: Types.ObjectId } }[]>();

  const publicIds = files.map(i => i.file.cloudinaryUrl);
  const ids = files.map(i => i.file._id);

  // Delete from Cloudinary in batches of 100
  for (let i = 0; i < publicIds.length; i += 100) {
    const batch = publicIds.slice(i, i + 100);
    const result = await deleteAssets(batch);
    if (result.error) throw new Error(`[Cloudinary Folder Deletion] ${result.error}`);
  }

  // Delete files from MongoDB
  if (ids.length) await FileModel.deleteMany({ _id: { $in: ids } });

  // Delete all folder/file items
  const allItems = descendantFileItems.concat(descendantFolderItems);
  if (allItems.length) await FileItemModel.deleteMany({ _id: { $in: allItems } });

  // Delete the folder itself
  await FileItemModel.findByIdAndDelete(folderId);

  console.log(`[Folder Deletion] Successfully deleted folder: ${folderId}`);
  return true;
};

// --- Handle Single File Deletion ---
const handleFileDeletion = async (fileId: Types.ObjectId) => {
  console.log(`[File Deletion] Starting deletion for file: ${fileId}`);
  const file = await FileModel.findById(fileId);
  if (!file) throw new Error("[File Deletion] File not found");

  const result = await deleteAsset(file.cloudinaryUrl, file.resourceType);
  if (result.error) throw new Error(`[Cloudinary File Deletion] ${result.error}`);

  // Delete the file and its references
  await FileModel.findByIdAndDelete(fileId);
  await FileItemModel.deleteMany({ file: fileId });

  console.log(`[File Deletion] Successfully deleted file: ${fileId}`);
  return true;
};

// --- Worker ---
const fileWorker = new Worker(
  "file",
  async (job: Job) => {
    try {
      if (job.name === "delete-file") {
        const { fileId } = job.data as { fileId: string };
        await handleFileDeletion(new Types.ObjectId(fileId));
      } else if (job.name === "delete-folder") {
        const { folderId } = job.data as { folderId: string };
        await handleFolderDeletion(new Types.ObjectId(folderId));
      } else {
        throw new Error(`[Worker] Unknown job name: ${job.name}`);
      }
    } catch (err) {
      console.error(`[Worker] Job failed: ${job.id}`, err);
      throw err; // ensures BullMQ marks job as failed
    }
  },
  { connection: redisConnection }
);

fileWorker.on("completed", job => console.log(`[Worker] Job completed: ${job.id}`));
fileWorker.on("failed", (job, err) => console.error(`[Worker] Job failed: ${job?.id}`, err));

console.log("File worker started ✅");
