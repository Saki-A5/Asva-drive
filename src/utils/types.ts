export interface UploadParams {
  file: File;
  folderId?: string;
  ownerId?: string;
}

export interface UploadResponse {
  success: boolean;
  message: string;
  url?: string;
}
