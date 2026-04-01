import FileItemModel from "@/models/fileItem";
import { Types } from "mongoose";

export async function createRootIfNotExists(
  ownerId: string,
  ownerType: "College" | "User",
): Promise<string> {
  const rootFolder = await FileItemModel.findOne({
    ownerId,
    ownerType,
    isRoot: true,
  });
  if (!rootFolder) {
    const newRootFolder = await FileItemModel.create({
      filename: "/",
      isFolder: true,
      parentFolderId: null,
      // ownerId: ownerType === "College" ? ownerId : new Types.ObjectId(ownerId),
      // ownerId: new Types.ObjectId(ownerId),
      ownerId: ownerId,
      ownerType,
      isRoot: true,
    });

    return newRootFolder._id.toString();
  }

  return rootFolder._id.toString();
}
