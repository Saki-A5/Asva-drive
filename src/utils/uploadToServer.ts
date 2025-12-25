import axios from 'axios';
export interface UploadParams {
  file: File;
  folderId: string;
  email: string;
  tags?: string[];
}

export interface UploadResponse {
  message: string;
  data?: any;
  error?: string;
}

export async function uploadToServer(
  params: UploadParams
): Promise<UploadResponse> {
  const { file, folderId, email, tags = [] } = params;

  try {
    const formData = new FormData();

    formData.append('file', file);
    formData.append('filename', file.name);
    formData.append('mimetype', file.type);
    formData.append('folderId', folderId);
    formData.append('email', email);
    formData.append('tags', tags.join(','));

    const res = await axios.post('/api/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  } catch (error) {
    console.error('Upload error:', error);
    return {
      message: 'Upload failed',
      error: 'NETWORK_ERROR',
    };
  }
}
