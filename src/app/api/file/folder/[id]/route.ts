import dbConnect from "@/lib/dbConnect";
import FileModel from "@/models/files";
import User from "@/models/users";
import { Types } from "mongoose";
import { NextResponse } from "next/server";

export const runtime = 'nodejs';

async function getAllDescendantIds(folderId: Types.ObjectId) {
  const descendants = [];
  const queue = [folderId];
  
  while (queue.length > 0) {
    const currentId = queue.shift();
    
    // Find all children of current folder
    const children = await FileModel.find({ 
      parentFolderId: currentId 
    }).select('_id isFolder');

    for (const child of children) {
      descendants.push(child._id);
      if (child.isFolder) {
        queue.push(child._id); // Add folders to queue for further traversal
      }
    }
  }
  
  return descendants;
}

async function deleteFileOrFolder(fileId: Types.ObjectId) {
  const file = await FileModel.findById(fileId);
  
  if (!file) {
    throw new Error('File not found');
  }
  
  if (file.isFolder) {
    // Get all descendant IDs
    const descendantIds = await getAllDescendantIds(fileId);
    
    // Bulk soft delete all descendants
    await FileModel.updateMany(
      { _id: { $in: descendantIds } },
      { isDeleted: true, deletedAt: new Date() }
    );
  }
  
  // Delete/soft delete the folder itself
  await FileModel.findByIdAndUpdate(fileId, { 
    isDeleted: true,
    deletedAt: new Date() 
  });
  
  return { success: true };
}


// get the contents of a folder
export const GET = async(req: Request, {params}: any) => {
    // const cookieStore = await cookies();
    // const token = cookieStore.get('token')?.value;

    // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

    // const decodedToken = await adminAuth.verifyIdToken(token);
    // const {email} = decodedToken;

    const email = 'demo@gmail.com'; // substitute for now
    const user = await User.findOne({email});
    

    await dbConnect();

    const {id} = await params;
    const folderId = new Types.ObjectId(id as string);

    const folder = await FileModel.findOne({_id: folderId, isFolder: true, ownerId: user._id});
    if(!folder) return NextResponse.json({message: "Folder not Found"}, {status: 404});

     const contents = await FileModel.find({
            parentFolderId: folderId,
            ownerId: user._id
    });

    return NextResponse.json({contents});
}

// delete a folder and its contens
export const DELETE = async(req: Request, {params}: any) => {
    try {
        // const cookieStore = await cookies();
        // const token = cookieStore.get('token')?.value;

        // if(!token) return NextResponse.json({error: "Not Authenticated"}, {status: 401});

        // const decodedToken = await adminAuth.verifyIdToken(token);
        // const {email} = decodedToken;

        const email = "demo@gmail.com";
        const user = await User.findOne({email});

        await dbConnect();

        const {id} = await params;

        const folderId = new Types.ObjectId(id);
        const folder = await FileModel.findOne({_id: folderId, isFolder: true, ownerId: user._id});
        if(!folder) return NextResponse.json({message: "No Folder Found"}, {status: 404});

        await deleteFileOrFolder(folderId);

        return NextResponse.json({message: "Successfully Deleted Folder"}, {status: 200});
    } catch (error) {
        console.error(error);
        return NextResponse.json({message: (error as Error).message || "Internal Server Error"}, {status: 500});
    }
}