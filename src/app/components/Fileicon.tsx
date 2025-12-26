'use client';

import { FileArchive, FileSpreadsheet, FileText, Folder } from 'lucide-react';

type FileiconProps = {
  type: string | undefined;
  isSheetPage: boolean;
};
const Fileicon = ({ type, isSheetPage }: FileiconProps) => {
  const sizeClass = isSheetPage ? 'h-32 w-32' : 'h-8 w-8';
  switch (type) {
    case 'folder':
      return (
        <Folder
          className={`${sizeClass} fill-current dark:text-[#0AFEF2] text-[#001f3f]`}
        />
      );
    case 'pdf':
      return (
        <FileText
          className={`${sizeClass} h-8 w-8 text-red-600`}
          fill="#ef4444"
        />
      );
    case 'word':
      return (
        <FileText
          className={`${sizeClass} h-8 w-8 text-blue-600`}
          fill="#2563eb"
        />
      );
    case 'excel':
      return (
        <FileSpreadsheet
          className={`${sizeClass} h-8 w-8 text-green-600`}
          fill="#16a34a"
        />
      );
    case 'zip':
      return (
        <FileArchive
          className={`${sizeClass} h-8 w-8 text-yellow-600`}
          fill="#eab308"
        />
      );
    default:
      return (
        <FileText
          className={`${sizeClass} h-8 w-8 text-gray-500`}
          fill="#9ca3af"
        />
      );
  }
};

export default Fileicon;
