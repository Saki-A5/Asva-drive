import { v2 as cloudinary, UploadApiOptions } from 'cloudinary';
import {Types} from 'mongoose';
import File from '@/models/files';

const { CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET } = process.env;
if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
    throw new Error('Missing Cloudinary configuration in environment variables');
}

cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET
});


export type UploadResult = {
    publicId: string;
    url: string;
    raw?: any;
};

export async function uploadFile(file: string, folderId: Types.ObjectId, ownerId: Types.ObjectId): Promise<UploadResult | null> {
    if (/^data:.*;base64,/.test(file)) {
        throw new Error('Base64 files are not allowed');
    }

    const folder = await File.findOne({
        _id: new Types.ObjectId(folderId.toString()), 
        ownerId: new Types.ObjectId(ownerId.toString()), 
        isFolder: true
    });

    if(!folder) throw new Error(`Folder not found: ${folderId}`)
    
    const folderPath = (folder.fileLocation.cloudinaryPath || folder.fileLocation.humanReadable) as string; // if this is the first file to be passed to the folder, the cloudinaryPath will be empty

    const options: UploadApiOptions = {
        overwrite: true,
        folderPath,
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto'
    };

    try {
        const result = await cloudinary.uploader.upload(file, options);
        
        const cloudinaryFolderPath = result.public_id.substring(0, result.public_id.lastIndexOf('/'));

        // update the parent folder cloudinary path if not set
        if(!folder.fileLocation.cloudinaryPath){
            await File.updateOne({_id: folderId}, {'fileLocation.cloudinaryPath': cloudinaryFolderPath} )
        }
        
        return {
            publicId: result.public_id,
            url: result.secure_url,
            raw: result
        };
    } catch (error) {
        console.error('Cloudinary upload error:', error);
        return null;
    }
}

export async function getAsset(publicId: string): Promise<any | null> {
    try {
        const result = await cloudinary.api.resource(publicId);
        return result;
    } catch (err: any) {
        const status = err && (err.http_code || err.status_code || err.status);
        const msg = err && err.message ? String(err.message) : '';

        const isNotFound = status === 404 || /not found|does not exist|resource\s+not\s+found/i.test(msg);

        if (isNotFound) {
            console.warn(`Cloudinary getAsset: asset not found: ${publicId}`);
            return null;
        }

        console.error('Cloudinary getAsset error:', err);
        return null;
    }
}

export async function getFolderWithContents(folderId: string | Types.ObjectId, ownerId: string | Types.ObjectId) {
    try {
        const folder = await File.findOne({
            _id: new Types.ObjectId(folderId as string),
            ownerId: new Types.ObjectId(ownerId as string),
            isFolder: true
        });

        if (!folder) {
            throw new Error(`Folder not found: ${folderId}`);
        }

        
        const contents = await File.find({
            parentFolderId: new Types.ObjectId(folderId as string),
            ownerId: new Types.ObjectId(ownerId as string)
        });

        return {
            folder,
            contents
        };
    } catch (error) {
        console.error('Error fetching folder:', error);
        throw error;
    }
}

export async function createFolder(
    folderName: string,
    parentFolderId: Types.ObjectId | null,
    ownerId: Types.ObjectId
) {
    let parentFilepath = '';
    
    // If there's a parent, get its filepath
    if (parentFolderId) {
        const parentFolder = await File.findOne({
            _id: parentFolderId,
            ownerId,
            isFolder: true
        });
        
        if (!parentFolder) {
            throw new Error('Parent folder not found');
        }
        
        parentFilepath = parentFolder.filepath;
    }
    
    // Compute the new folder's filepath (slugify folder name)
    const sluggedName = folderName.toLowerCase().replace(/\s+/g, '-');
    const newFilepath = `${parentFilepath}${sluggedName}/`;
    
    // Create folder document in MongoDB
    const folder = await File.create({
        filename: folderName,
        filepath: newFilepath,
        isFolder: true,
        parentFolderId: parentFolderId || null,
        ownerId,
        // No cloudinaryPublicId for folders
    });
    
    return folder;
}
