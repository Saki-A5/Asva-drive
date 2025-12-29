import FileItemModel from "@/models/fileItem";

export async function createRootIfNotExists(ownerId: string, ownerType: "College"|"User"): Promise<string>{
    const rootFolder = await FileItemModel.findOne({ownerId, ownerType, isRoot: true});
    if(!rootFolder){
        const newRootFolder = await FileItemModel.create({
            filename: '/', 
            isFolder: true, 
            parentFolderId: null, 
            ownerId, 
            ownerType, 
            isRoot: true,
        });

        return newRootFolder._id.toString();
    }

    return rootFolder._id.toString();
}