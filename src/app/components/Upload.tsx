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

    // DEV/JIKA: CHANGE THIS SECTION AFTER UPLOAD FORM IS CREATED
    // TODO: Replace 'folderId' and 'email' with actual values as needed
    // const response = await uploadToServer({
    //   file,
    //   folderId: 'default-folder-id',
    //   email: 'user@example.com',
    // });

    // console.log('Upload response:', response);
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
          <span className="pl-2 hidden [@media(min-width:440px)]:inline-block">
            Upload
          </span>
        </span>
      </Button>
    </>
  );
};

export default Upload;
