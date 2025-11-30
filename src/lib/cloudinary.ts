import {v2 as cloudinary, UploadApiOptions, UploadApiResponse} from 'cloudinary'
import { Types } from 'mongoose';
import FileModel from '@/models/files';

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
    fileId: any;
    publicId: string;
    url: string;
    raw?: any;
};

export async function uploadFile(filename: string, file: Buffer, folderId: Types.ObjectId, ownerId: Types.ObjectId, tags?: string[], destFolder?: string): Promise<UploadResult|null>

export async function uploadFile(filename: string, file: string, folderId: Types.ObjectId, ownerId: Types.ObjectId, tags?: string[], destFolder?: string): Promise<UploadResult|null>

export async function uploadFile(filename: string, file: string | Buffer, folderId: Types.ObjectId, ownerId: Types.ObjectId, tags: string[] = [], destFolder: string = ''): Promise<UploadResult | null> {

    if (typeof file === 'string' && /^data:.*;base64,/.test(file)) {
        throw new Error('Base64 files are not allowed');
    }



    const folder = await FileModel.findOne({
        _id: new Types.ObjectId(folderId.toString()),
        ownerId: new Types.ObjectId(ownerId.toString()),
        isFolder: true
    });

    if (!folder) throw new Error(`Folder not found: ${folderId}`)

    const folderLocation = `${ownerId.toString()}/${destFolder}`

    const options: UploadApiOptions = {
        overwrite: true,
        folder: folderLocation,
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto', 
        public_id: filename
    };

    try {
        let result;

        if (Buffer.isBuffer(file)) {
            // Upload binary data using upload_stream
            result = await new Promise<UploadApiResponse>((resolve, reject) => {
                const uploadStream = cloudinary.uploader.upload_stream(
                    options,
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result!);
                    }
                );
                
                // Create a readable stream from the buffer
                const Readable = require('stream').Readable;
                const bufferStream = new Readable();
                bufferStream.push(file);
                bufferStream.push(null);
                
                bufferStream.pipe(uploadStream);
            });
        } else {
            // Upload from HTTPS URL directly
            result = await cloudinary.uploader.upload(file, options);
        }
        
        const cFile = await FileModel.create({
            filename: filename, // generate a better way to store the filename
            cloudinaryUrl: result.public_id,
            fileLocation: `${folder.fileLocation}${filename}`,
            ownerId: ownerId,
            resourceType: result.resource_type, // default for now
            mimeType: result.format,
            sizeBytes: result.bytes,
            tags: tags
        });

        await cFile.save();

        return {
            fileId: cFile._id,
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
        console.log(result)
        return result;
    } catch (err: any) {
        const status = err.error.http_code as number;
        const message = err.error.message as string;

        const isNotFound = status === 404 || /not found|does not exist|resource\s+not\s+found/i.test(message);

        if (isNotFound) {
            console.warn(`Cloudinary getAsset: asset not found: ${publicId}`);
        }
        else{
            console.error('Cloudinary getAsset error:', err);
        }

        throw new Error(message);   // let the route handler catch this error

    }
}

export async function getFolderWithContents(folderId: string | Types.ObjectId, ownerId: string | Types.ObjectId) {
    try {
        const folder = await FileModel.findOne({
            _id: new Types.ObjectId(folderId as string),
            ownerId: new Types.ObjectId(ownerId as string),
            isFolder: true
        });

        if (!folder) {
            throw new Error(`Folder not found: ${folderId}`);
        }


        const contents = await FileModel.find({
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
    parentFolderId: Types.ObjectId,
    ownerId: Types.ObjectId
) {
    let parentFilepath = '';

    // If there's a parent, get its filepath
    if (parentFolderId) {
        const parentFolder = await FileModel.findOne({
            _id: new Types.ObjectId(parentFolderId),
            ownerId: new Types.ObjectId(ownerId),
            isFolder: true
        });

        if (!parentFolder) {
            throw new Error('Parent folder not found');
        }

        parentFilepath = parentFolder.fileLocation;
    }

    const newFilepath = `${parentFilepath}${folderName}/`;

    // Create folder document in MongoDB
    const folder = await FileModel.create({
        filename: folderName,
        fileLocation: newFilepath,
        isFolder: true,
        parentFolderId: parentFolderId || null,
        ownerId,
    });

    return folder;
}
