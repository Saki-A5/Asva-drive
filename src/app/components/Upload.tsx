'use client';

import { Button } from '@/components/ui/button';
import { UploadIcon } from 'lucide-react';

const Upload = () => {
  return (
    <>
      <Button
        variant="outline"
        className="bg-[#001f3f] cursor-pointer text-white hover:bg-[#001f3f] hover:text-white transition-none dark:bg-white dark:text-black dark:hover:bg-white dark:hover:text-black">
        <span className="flex items-center">
          <UploadIcon />
          <span className="pl-2">Upload</span>
        </span>
      </Button>
    </>
  );
};

export default Upload;
