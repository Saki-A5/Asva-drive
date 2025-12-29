export interface FileData {
    // file
    filename: string, 
    cloudinaryUrl: string, 
    extractedText: string, 
    uploadedBy: string, 
    resourceType: string,
    indexed: boolean, 
    mimeType: string, 
    sizeBytes: number, 
    tags: string[], 
    //fileItem
    isFolder: boolean, 
    parentFolderId: string, 
    ownerId: string, 
    ownerType: 'User'|'College',
    isRoot: boolean, 
    isDeleted: boolean, 
    deletedAt: Date|null,
    isReference: boolean
}