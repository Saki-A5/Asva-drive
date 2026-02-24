import dbConnect from "@/lib/dbConnect";
import { fileQueue } from "@/lib/queue";
import { requireRole } from "@/lib/roles";
import FileItemModel from "@/models/fileItem";
import FileModel, { FileInterface } from "@/models/files";
import User from "@/models/users";
import { HydratedDocument, Types } from "mongoose";
import { NextResponse } from "next/server";
import { deleteAssets } from "@/lib/cloudinary";

export const runtime = 'nodejs';

export async function getAllDescendantIds(folderId: Types.ObjectId) {
  const descendantFolderItems = [];
  const descendantFileItems = [];
  const queue = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    // Find all children of current folder
    const children = await FileItemModel.find({
      parentFolderId: currentId
    }).select('_id isFolder');

    for (const child of children) {
      if (child.isFolder) {
        descendantFolderItems.push(child._id);
        queue.push(child._id); // Add folders to queue for further traversal
      } else {
        descendantFileItems.push(child._id);
      }
    }
  }

  return { descendantFolderItems, descendantFileItems };
}

async function deleteFolder(folderId: Types.ObjectId): Promise<{ success: boolean, permanentlyDeleted: boolean }> {
  const folder = await FileItemModel.findById(folderId);

  const { descendantFileItems: fileItems, descendantFolderItems: folderItems } = await getAllDescendantIds(folderId);

  if (fileItems.concat(folderItems).length === 0) { // if there are no contents in this folder, permanently delete it
    await FileItemModel.deleteOne(folderId);
    return { success: true, permanentlyDeleted: true }
  }

  // if the folder is owned by a "user", it contains reference files and should be deleted permanently
  if ((folder!).ownerType === "User") {
    await FileItemModel.deleteMany({ _id: { $in: fileItems.concat([...folderItems, folderId]) } }) // delete all children files and folders along with the parent folder
    return { success: true, permanentlyDeleted: true }
  };

  // for non reference files
  // soft delete children fileItems and the folder Item
  await FileItemModel.updateMany({ _id: { $in: fileItems.concat([...folderItems, folderId]) } }, { $set: { isDeleted: true, deletedAt: Date.now() } });

  // soft delete the actual files
  const files = await FileItemModel.find({ _id: { $in: fileItems }, isReference: false }).select("file") as { file: Types.ObjectId }[];
  const fileIds = files.map(file => file.file);
  // soft delete the actual files
  if (files.length > 0) await FileModel.updateMany({_id: {$in: fileIds}}, { $set: { isDeleted: true, deletedAt: Date.now() } });

  return {
    success: true, 
    permanentlyDeleted: false
  }
  
}

// get the contents of a folder
export const GET = async (req: Request, { params }: any) => {
  // const cookieStore = await cookies();
  // const token = cookieStore.get('token')?.value;

  // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

  // const decodedToken = await adminAuth.verifyIdToken(token);
  // const {email} = decodedToken;

  await dbConnect();
  const email = 'asvasoftwareteam@gmail.com'; // substitute for now
  const user = await User.findOne({ email });



  const { id } = await params;
  const folderId = new Types.ObjectId(id as string);

  // if the user is an admin, they are accessing college files, if the user is a "user" they are accessing user files
  const ownerId = user.role === "admin" ? user.collegeId : user._id;

  const folder = await FileItemModel.findOne({ _id: folderId, isFolder: true, ownerId });
  if (!folder) return NextResponse.json({ error: "Folder not Found" }, { status: 404 });
  if (!folder.isFolder) return NextResponse.json({ error: "This is not a folder" }, { status: 400 })

  const contents = await FileItemModel.find({
    parentFolderId: folderId,
    ownerId
  })
  .populate({
      path: "file",
      select: "sizeBytes mimeType updatedAt uploadedBy",
      populate: {
        path: "uploadedBy",
        select: "email name"
      }
    })
   const breadcrumbs: { _id: string; filename: string }[] = [];
    let currentFolder: any = folder;
    while (currentFolder) {
      breadcrumbs.unshift({ _id: currentFolder._id.toString(), filename: currentFolder.filename });
      if (!currentFolder.parentFolderId) break;
      currentFolder = await FileItemModel.findById(currentFolder.parentFolderId);
    }

  return NextResponse.json({ contents, breadcrumbs, folderName: folder.filename });
} 

// delete a folder and its contents
export const DELETE = async (req: Request, { params }: any) => {
  try {
    await dbConnect();
    // const { user, error, status } = await requireRole(req, ['admin', 'user']);

    // if (error) return NextResponse.json({ error }, { status });

    const user = await User.findOne({email: 'asvasoftwareteam@gmail.com'}); // comment this and uncomment the code block above in production
    const ownerId = user.role === "admin" ? user.collegeId : user._id;

    const { id } = await params;

    const folderId = new Types.ObjectId(id);
    const folder = await FileItemModel.findOne({ _id: folderId, isFolder: true, ownerId: ownerId });
    if (!folder) return NextResponse.json({ error: "No Folder Found" }, { status: 404 });
    if (!folder.isFolder) return NextResponse.json({ error: "This is not a folder" }, { status: 400 })

    // Check user role to determine delete type
    const isAdmin = user.role === 'admin';

    if (isAdmin) {
      // Admin: soft delete (goes to trash)
      const { permanentlyDeleted } = await deleteFolder(folderId);
      const fileRestoreWindow = +(!process.env.FILE_RESTORE_WINDOW) || 28;
      const delay = fileRestoreWindow * (1000 * 60 * 60 * 24);
      if (!permanentlyDeleted) { // only add folders to the queue if they have not been permanently deleted
        await fileQueue.add(
          'delete-folder',
          {
            folderId: folderId.toString()
          },
          {
            delay,
            attempts: 5,
            backoff: { type: 'exponential', delay: 1000 },
            removeOnComplete: true,
            jobId: `delete-folder-${folderId}`
          }
        )
      }
    } else {
      // Normal user: permanent delete
      const { descendantFileItems, descendantFolderItems } = await getAllDescendantIds(folderId);

      // Only delete non-referenced files
      const fileItems = await FileItemModel.find({
        _id: { $in: descendantFileItems },
        isReference: false,
      })
        .populate<{ file: FileInterface }>("file", "cloudinaryUrl resourceType _id")
        .lean<{ file: { cloudinaryUrl: string; resourceType: string; _id: Types.ObjectId } }[]>();

      const publicIds = fileItems.map(i => i.file.cloudinaryUrl);
      const fileIds = fileItems.map(i => i.file._id);

      // Delete from Cloudinary in batches of 100
      for (let i = 0; i < publicIds.length; i += 100) {
        const batch = publicIds.slice(i, i + 100);
        const result = await deleteAssets(batch);
        if (!result.succeeded) {
          throw new Error(result.error || 'Failed to delete files from storage');
        }
      }

      // Delete files from MongoDB
      if (fileIds.length) await FileModel.deleteMany({ _id: { $in: fileIds } });

      // Delete all folder/file items
      const allItems = descendantFileItems.concat(descendantFolderItems);
      if (allItems.length) await FileItemModel.deleteMany({ _id: { $in: allItems } });

      // Delete the folder itself
      await FileItemModel.findByIdAndDelete(folderId);
    }

    return NextResponse.json({ message: "Successfully Deleted Folder" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}