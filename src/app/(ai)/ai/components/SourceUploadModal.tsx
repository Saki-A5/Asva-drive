"use client";
import React, { useRef, useState, useCallback } from "react";
import { X, Upload } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onFilesSelected?: (files: File[]) => void;
};

export default function SourcesUploadModal({
  open,
  onClose,
  onFilesSelected,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleFiles = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    onFilesSelected?.(Array.from(files));
    onClose();
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  }, []);

  if (!open) return null;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      onClick={onClose}
    >
      {/* Modal card */}
      <div
        className="relative bg-white rounded-2xl shadow-xl w-105 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-semibold text-gray-800">
            Sources Upload
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Drop zone */}
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl py-10 px-6 transition-colors cursor-pointer ${
            dragging
              ? "border-[#22d3ee] bg-cyan-50"
              : "border-gray-200 bg-gray-50 hover:border-gray-300"
          }`}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-8 w-8 text-gray-400" />
          <p className="text-sm font-medium text-gray-700">
            Choose a file or drag & drop it here
          </p>
          <p className="text-[11px] text-gray-400 text-center">
            JPEG, PNG, PDF, DOCX, MP3 AND MP4 FORMATS, and others up to 50MB
          </p>
        </div>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".jpeg,.jpg,.png,.pdf,.docx,.mp3,.mp4"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-3 mt-5">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Asva Hub
          </button>
          <button
            onClick={() => inputRef.current?.click()}
            className="px-5 py-2 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            Browse Files
          </button>
        </div>
      </div>
    </div>
  );
}
