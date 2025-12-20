import dbConnect from "@/lib/dbConnect";
import { fileQueue } from "@/lib/queue";
import { requireRole } from "@/lib/roles";
import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

export async function getAllDescendantIds(folderId: Types.ObjectId) {
  const descendantFolders = [];
  const descendantFiles = [];
  const queue = [folderId];

  while (queue.length > 0) {
    const currentId = queue.shift();

    // Find all children of current folder
    const children = await FileModel.find({
      parentFolderId: currentId
    }).select('_id isFolder');

    for (const child of children) {
      if (child.isFolder) {
        descendantFolders.push(child._id);
        queue.push(child._id); // Add folders to queue for further traversal
      } else {
        descendantFiles.push(child._id);
      }
    }
  }

  return { descendantFolders, descendantFiles };
}

async function deleteFolder(fileId: Types.ObjectId) {
  const file = await FileModel.findById(fileId);

  if (!file) {
    throw new Error('Folder not found');
  }

  if (file.isFolder) {
    // Get all descendant IDs
    const { descendantFiles, descendantFolders } = await getAllDescendantIds(fileId);

    if (descendantFiles.length === 0) {// if the folder is empty contains empty folders permanently delete it
      await FileModel.findByIdAndDelete(fileId);
      return { success: true, isEmpty: true }
    }
    // Bulk soft delete all descendants
    await FileModel.updateMany(
      { _id: { $in: descendantFiles.concat(descendantFolders) } },
      { isDeleted: true, deletedAt: new Date() }
    );
  }

  // Delete/soft delete the folder itself
  await FileModel.findByIdAndUpdate(fileId, {
    isDeleted: true,
    deletedAt: new Date()
  });

  return { success: true, isEmpty: false };
}


// get the contents of a folder
export const GET = async (req: Request, { params }: any) => {
  // const cookieStore = await cookies();
  // const token = cookieStore.get('token')?.value;

  // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

  // const decodedToken = await adminAuth.verifyIdToken(token);
  // const {email} = decodedToken;

  const email = 'demo@gmail.com'; // substitute for now
  const user = await User.findOne({ email });


  await dbConnect();

  const { id } = await params;
  const folderId = new Types.ObjectId(id as string);

  const folder = await FileModel.findOne({ _id: folderId, isFolder: true, ownerId: user._id });
  if (!folder) return NextResponse.json({ message: "Folder not Found" }, { status: 404 });

  const contents = await FileModel.find({
    parentFolderId: folderId,
    ownerId: user._id
  });

  return NextResponse.json({ contents });
}

// delete a folder and its contens
export const DELETE = async (req: Request, { params }: any) => {
  try {
    await dbConnect();
    const { user, error, status } = await requireRole(req, ['admin']);

    if (error) return NextResponse.json({ error }, { status });

    const { id } = await params;

    const folderId = new Types.ObjectId(id);
    const folder = await FileModel.findOne({ _id: folderId, isFolder: true, ownerId: user._id });
    if (!folder) return NextResponse.json({ message: "No Folder Found" }, { status: 404 });

    const { isEmpty } = await deleteFolder(folderId);
    const fileRestoreWindow = +(!process.env.FILE_RESTORE_WINDOW) || 28;
    const delay = fileRestoreWindow * (1000 * 60 * 60 * 24);
    if (!isEmpty) { // only add folders to the queue if they are not empty
      await fileQueue.add(
        'delete-folder',
        {
          id: folderId
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

    return NextResponse.json({ message: "Successfully Deleted Folder" }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: (error as Error).message || "Internal Server Error" }, { status: 500 });
  }
}