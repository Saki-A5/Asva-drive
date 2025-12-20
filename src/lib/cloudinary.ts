import { v2 as cloudinary, ConfigAndUrlOptions, TransformationOptions, UploadApiOptions, UploadApiResponse } from 'cloudinary'
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

function formatFilename(filename: string, parentFolderId: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const videoExts = ['mp4', 'webm', 'mov', 'avi', 'mkv'];

    const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');

    if (imageExts.includes(ext) || videoExts.includes(ext)) {
        return `${nameWithoutExt}-${parentFolderId}`;   // remove the extension from videos and images (cloudinary requirements)
    }
    return `${nameWithoutExt}-${parentFolderId}.${ext}`;
}

export async function uploadFile(filename: string, file: Buffer, folderId: Types.ObjectId, ownerId: Types.ObjectId, tags?: string[], destFolder?: string): Promise<UploadApiResponse | null>

export async function uploadFile(filename: string, file: string, folderId: Types.ObjectId, ownerId: Types.ObjectId, tags?: string[], destFolder?: string): Promise<UploadApiResponse | null>

export async function uploadFile(filename: string, file: string | Buffer, parentFolderId: Types.ObjectId, collegeId: Types.ObjectId, tags: string[] = [], destFolder: string = ''): Promise<UploadApiResponse | null> {

    if (typeof file === 'string' && /^data:.*;base64,/.test(file)) {
        throw new Error('Base64 files are not allowed');
    }

    const folderLocation = `${collegeId.toString()}/${destFolder}`;

    const formattedFilename = formatFilename(filename, parentFolderId.toString());
    const options: UploadApiOptions = {
        overwrite: true,
        asset_folder: folderLocation,
        public_id: formattedFilename,
        unique_filename: false,
        resource_type: 'auto',
        type: 'authenticated'   // makes sure that access to the folder isn't public
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
                uploadStream.end(file);
            });

            console.log(`result: ${JSON.stringify(result)}`)
        } else {
            // Upload from HTTPS URL directly
            result = await cloudinary.uploader.upload(file, options);
        }

        return result;
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
        else {
            console.error('Cloudinary getAsset error:', err);
        }

        throw new Error(message);   // let the route handler catch this error

    }
}


export async function deleteAsset(publicId: string, resourceType: string): Promise<{ succeeded: boolean, error?: string }> {
    try {
        const result = await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
        console.log(result);
        return {
            succeeded: true
        }
    }
    catch (e: any) {
        console.error('Cloudinary destroy error: ', e);
        return {
            succeeded: false,
            error: e.message || "Error While Destroying Asset",
        }
    }
}

export async function deleteAssets(publicIds: string[]): Promise<{ succeeded: boolean, error?: false }> {
    try {
        const result = await cloudinary.api.delete_resources(publicIds);
        console.log(result);

        return {
            succeeded: true
        }
    }
    catch (e: any) {
        console.error("Cloudinary delete resources error: ", e);
        return {
            succeeded: false,
            error: e.message || "Error while destroying assets"
        }
    }
}

export async function renameAsset(publicId: string, parentFolderId: Types.ObjectId, newFilename: string) {
    try {
        const formattedFilename = formatFilename(newFilename, parentFolderId.toString());
        const result = await cloudinary.uploader.rename(publicId, formattedFilename);
    }
    catch (e:any) {
        throw new Error(e.message || 'Error renaming file');
    }
}

export function getAssetDeliveryUrl(publicId: string, options: ConfigAndUrlOptions){
    const signedUrl = cloudinary.url(publicId, {
        resource_type: options.resource_type, 
        type: options.type, 
        sign_url: options.sign_url, 
        secure: options.secure, 
        expires_at: options.expires_at, 
        attachment: options.attachment,
    });

    return signedUrl;
}