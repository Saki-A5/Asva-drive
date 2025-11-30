'use client';

import { Button } from '@/components/ui/button';
import { uploadToServer } from '@/utils/uploadToServer';
import { UploadIcon } from 'lucide-react';
import { useState, useRef } from 'react';

const Upload = () => {
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);

    const response = await uploadToServer({
      file,
      folderId: '67a93bc9f92a5b14e25c5123', // change later
      email: 'jika@gmail.com',
      tags: ['school', 'pdf'],
    });

    console.log('Upload response:', response);
    setLoading(false);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        className="hidden"
        onChange={handleUpload}
      />
      <Button
        variant="outline"
        className="bg-[#001f3f] cursor-pointer text-white hover:bg-[#001f3f] hover:text-white transition-none dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black"
        onClick={triggerFileInput}
        disabled={loading}>
        <span className="flex items-center">
          <UploadIcon />
          <span className="pl-2">{loading ? 'Uploading...' : 'Uploads'}</span>
        </span>
      </Button>
    </>
  );
};

export default Upload;
