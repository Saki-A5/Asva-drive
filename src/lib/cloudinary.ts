import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary'
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

export async function uploadFile(filename: string, file: string | Buffer, parentFolderId: Types.ObjectId, ownerId: Types.ObjectId, tags: string[] = [], destFolder: string = ''): Promise<UploadApiResponse | null> {

    if (typeof file === 'string' && /^data:.*;base64,/.test(file)) {
        throw new Error('Base64 files are not allowed');
    }

    const folderLocation = `${ownerId.toString()}/${destFolder}`;

    const formattedFilename = formatFilename(filename, parentFolderId.toString());
    const options: UploadApiOptions = {
        overwrite: true,
        asset_folder: folderLocation,
        public_id: formattedFilename,
        use_filename: true,
        unique_filename: false,
        resource_type: 'auto',
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


