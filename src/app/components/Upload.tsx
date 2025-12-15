// 

'use client';

import { useState, useRef } from 'react';
import { UploadIcon, X } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';

import { uploadToServer } from '@/utils/uploadToServer';

type UploadingFile = {
  name: string;
  progress: number;
};

const Upload = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [files, setFiles] = useState<UploadingFile[]>([]);
  const [description, setDescription] = useState('');

  const handleFileSelect = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFiles([{ name: file.name, progress: 20 }]);
    setLoading(true);

    const response = await uploadToServer({
      file,
      folderId: 'default-folder-id',
      email: 'user@example.com',
    });

    console.log(response);

    setFiles([{ name: file.name, progress: 100 }]);
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#001f3f] text-white hover:bg-[#001f3f] dark:bg-white dark:text-black"
        >
          <UploadIcon className="mr-2 h-4 w-4" />
          Upload
        </Button>
      </DialogTrigger>

      {/* Content */}
      <DialogContent className="max-w-md rounded-xl">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-lg font-semibold">
            Upload Files
          </DialogTitle>
          <X
            className="h-5 w-5 cursor-pointer"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        {/* Drop zone */}
        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center cursor-pointer hover:bg-muted"
        >
          <UploadIcon className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="font-medium">Choose a file or drag & drop it here</p>
          <p className="text-sm text-muted-foreground mt-1">
            JPEG, PNG, PDF, DOCX, MP3, MP4 (max 50MB)
          </p>

          <Button variant="outline" className="mt-3">
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
          />
        </div>

        {/* Description */}
        <div className="mt-4">
          <label className="text-sm font-semibold">Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this file(s) describe"
            className="mt-1"
          />
        </div>

        {/* File progress */}
        {files.map((file) => (
          <div key={file.name} className="mt-4">
            <div className="flex justify-between text-sm mb-1">
              <span>{file.name}</span>
              <span>{file.progress}%</span>
            </div>
            <Progress value={file.progress} />
          </div>
        ))}
      </DialogContent>
    </Dialog>
  );
};

export default Upload;
