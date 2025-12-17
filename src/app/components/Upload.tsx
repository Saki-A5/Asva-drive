"use client";

import { useState, useRef } from 'react';
import {
  UploadIcon,
  X,
  UploadCloud,
  Dot,
  Loader,
  CircleCheck,
} from 'lucide-react';
import Fileicon from './Fileicon';

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

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (!selectedFiles) return;

    // Convert FileList to array
    const newFiles = Array.from(selectedFiles).map((file) => ({
      name: file.name,
      progress: 0,
      file,
    }));

    // Add new files to state (instead of replacing)
    setFiles((prev) => [...prev, ...newFiles]);

    for (const f of newFiles) {
      setLoading(true);
      const response = await uploadToServer({
        file: f.file,
        folderId: 'default-folder-id',
        email: 'user@example.com',
      });
      console.log(response);

      // Update progress to 100% when done
      setFiles((prev) =>
        prev.map((p) => (p.name === f.name ? { ...p, progress: 100 } : p))
      );
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={setOpen}>
      {/* Trigger */}
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="bg-[#001f3f] text-white hover:bg-[#001f3f] dark:bg-white dark:text-black">
          <UploadIcon className="h-4 w-4" />
          <span className="ml-2 hidden [@media(min-width:440px)]:inline-block">
            Upload
          </span>
        </Button>
      </DialogTrigger>

      <DialogContent className="w-[95vw] max-w-md max-h-[90vh] overflow-y-auto rounded-xl [&>button]:hidden dark:bg-[#1A1E26]">
        <DialogHeader className="flex flex-row items-center justify-between border-b-[#D9D9D961] border-b-[1px] pb-5 rounded-b-2xl dark:rounded-b-none dark:border-b-0">
          <DialogTitle className="text-2xl font-bold flex items-center gap-2">
            <div className="px-3 py-3 rounded-full border border-[#D9D9D999]">
              <UploadCloud className="text-[#000000] dark:text-white" />
            </div>
            Upload Files
          </DialogTitle>
          <X
            className="h-6 w-6 cursor-pointer text-[#00000080] dark:text-white"
            onClick={() => setOpen(false)}
          />
        </DialogHeader>

        <div
          onClick={() => fileInputRef.current?.click()}
          className="mt-4 flex flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center cursor-pointer hover:bg-muted h-64">
          <UploadIcon className="mb-2 h-6 w-6 text-muted-foreground" />
          <p className="font-medium">Choose a file or drag & drop it here</p>
          <p className="text-sm text-muted-foreground mt-1">
            JPEG, PNG, PDF, DOCX, MP3, MP4 (max 50MB)
          </p>

          <Button
            variant="outline"
            className="mt-3 dark:bg-white dark:text-black">
            Browse Files
          </Button>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileSelect}
            multiple
          />
        </div>

        {/* Description */}
        <div className="mt-4 border-[#E8E8E8]">
          <label className="text-sm font-semibold dark:text-white">
            Description
          </label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will this file(s) describe"
            className="mt-1 placeholder:text-[#00000080] h-24 dark:placeholder:text-[#FFFFFFB2]"
          />
        </div>
        {/* File progress */}
        <div className="mt-4 space-y-4 overflow-y-auto max-h-32">
          {files.map((file) => {
            const extension = file.name.split('.').pop()?.toLowerCase();

            return (
              <div
                key={file.name}
                className="mt-4 border py-3 px-3 rounded-xl border-[#E8E8E8] mb-5">
                <div className="flex justify-between text-sm mb-1">
                  <div className="flex items-center gap-1.5">
                    <Fileicon
                      isSheetPage={false}
                      type={extension}
                    />
                    <span className="dark:text-[#0AFEF2] text-sm">
                      {file.name}
                    </span>
                  </div>
                  <X className="cursor-pointer font-semibold text-[#00000080] dark:text-[#FFFFFF73]" />
                </div>
                <div className="flex text-[#00000080] text-[12px] mb-1 items-center">
                  <span className="dark:text-[#FFFFFF73]">
                    {file.progress}% of 100%
                  </span>
                  <Dot className="text-[#02427E] dark:text-[#0AFEF2]" />
                  {file.progress < 100 ? (
                    <div className="flex">
                      <Loader className="text-[#02427EA6]" />
                      <span className="text-[#02427E] dark:text-[#0AFEF2]">
                        Uploading...
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <CircleCheck
                        className="text-white w-4 h-4"
                        fill="#39C92B"
                      />
                      <span className="font-semibold dark:text-[#0AFEF2]">
                        Completed
                      </span>
                    </div>
                  )}
                </div>
                <Progress
                  value={file.progress}
                  className=""
                />
              </div>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Upload;
