import { UploadApiOptions as CloudinaryUploadApiOptions } from "cloudinary";

declare module 'cloudinary' {
    interface UploadApiOptions extends CloudinaryUploadApiOptions{
        asset_folder?: string;  // asset_folder hasn't been added as a property in the current node SDK
    }
}