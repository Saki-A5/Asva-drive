import axios from 'axios';

export interface UploadParams {
  file: File;
  folderId?: string;
  email: string;
  tags?: string[];
  onProgress?: (percent: number) => void;
}

export interface UploadResponse {
  message: string;
  data?: any;
  error?: string;
}

export async function uploadToServer(
  params: UploadParams
): Promise<UploadResponse> {
  const { file, folderId, email, tags = [], onProgress } = params;

  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('mimetype', file.type);
    if (folderId) formData.append('folderId', folderId);
    formData.append('email', email);
    formData.append('tags', tags.join(','));

    const res = await axios.post('/api/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (event) => {
        if (!event.total) return;
        const percent = Math.round((event.loaded * 100) / event.total);
        onProgress?.(percent);
      },
    });

    return res.data;
  } catch (error) {
    console.error('Upload error:', error);
    return { message: 'Upload failed', error: 'NETWORK_ERROR' };
  }
}
