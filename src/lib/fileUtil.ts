import FileItemModel from "@/models/fileItem";
import { FileData } from "@/types/fileData.type";

export async function getFileData(fileItem: any[]): Promise<FileData[]>
export async function getFileData(fileItem: any): Promise<FileData>

export async function getFileData(fileItem: any | any[]): Promise<FileData[]|FileData> {
    if (Array.isArray(fileItem)) {
        const pFileItems = await Promise.all(fileItem.map(async (f) => {
            const pFileItem = FileItemModel.findById(f._id).populate("fileId");
            return pFileItem;
        }))
        const fileData: FileData[] = pFileItems.map(f => ({
            filename: f.fileId.filename,
            cloudinaryUrl: f.fileId.cloudinaryId,
            extractedText: f.fileId.extractedText,
            uploadedBy: f.fileId.uploadedBy,
            resourceType: f.fileId.resourceType,
            indexed: f.fileId.boolean,
            mimeType: f.fileId.mimeType,
            sizeBytes: f.fileId.sizeBytes,
            tags: f.fileId.tags,
            isFolder: f.isFolder,
            parentFolderId: f.parentFolderId,
            ownerId: f.ownerId,
            ownerType: f.ownerType,
            isRoot: f.isRoot,
            isDeleted: f.isDeleted,
            deletedAt: f.deletedAt,
            isReference: f.isReference
        }));

        return fileData;
    }
    else {
        const f = await FileItemModel.findById(fileItem._id).populate("fileId");

        const fileData: FileData = {
            filename: f.fileId.filename,
            cloudinaryUrl: f.fileId.cloudinaryId,
            extractedText: f.fileId.extractedText,
            uploadedBy: f.fileId.uploadedBy,
            resourceType: f.fileId.resourceType,
            indexed: f.fileId.boolean,
            mimeType: f.fileId.mimeType,
            sizeBytes: f.fileId.sizeBytes,
            tags: f.fileId.tags,
            isFolder: f.isFolder,
            parentFolderId: f.parentFolderId,
            ownerId: f.ownerId,
            ownerType: f.ownerType,
            isRoot: f.isRoot,
            isDeleted: f.isDeleted,
            deletedAt: f.deletedAt,
            isReference: f.isReference
        };

        return fileData;
    }
}