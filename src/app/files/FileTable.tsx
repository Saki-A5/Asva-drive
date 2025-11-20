'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  Folder,
  FileText,
  LayoutGrid,
  ChevronDown,
} from 'lucide-react';
import { Avatar, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import Fileicon from '../components/Fileicon';

// type File = {
//   id: string;
//   name: string;
//   type: string;
//   size: number | string;
//   modified: Date;
// };

// const mockFiles: File[] = [
//   {
//     id: '1',
//     name: 'report.pdf',
//     type: 'PDF',
//     size: 2048 * 1024,
//     modified: new Date('2025-10-10'),
//   },
//   {
//     id: '2',
//     name: 'asva logo.jpg',
//     type: 'Image',
//     size: 1536 * 1024,
//     modified: new Date('2025-10-15'),
//   },
//   {
//     id: '3',
//     name: 'presentation.pptx',
//     type: 'Text',
//     size: 512 * 1024,
//     modified: new Date('2025-09-10'),
//   },
// ];

type FileItem = {
  id: string;
  name: string;
  type: string;
  sharing: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

export default function FileTable() {
  const files: FileItem[] = [
    {
      id: '111222',
      name: 'Past Questions',
      type: 'folder',
      sharing: 'Public',
      size: '1.2GB',
      modified: 'Jun 12, 2025',
      sharedUsers: [],
    },
    {
      id: '222333',
      name: 'C#/C++',
      type: 'pdf',
      sharing: 'Public',
      size: '2.7GB',
      modified: 'Oct 12, 2025',
      sharedUsers: [],
    },
    {
      id: '333444',
      name: 'MATLAB',
      type: 'word',
      sharing: 'Public',
      size: '5.2GB',
      modified: 'Jan 12, 2026',
      sharedUsers: [],
    },
    {
      id: '444555',
      name: 'Previous Work',
      type: 'zip',
      sharing: 'Public',
      size: '1.0GB',
      modified: 'Nov 8, 2025',
      sharedUsers: [],
    },
    {
      id: '555666',
      name: 'Python',
      type: 'folder',
      sharing: 'Shared',
      size: '1.2GB',
      modified: 'Apr 27, 2025',
      sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
    },
    {
      id: '666777',
      name: 'AutoCAD Workbook',
      type: 'excel',
      sharing: 'Public',
      size: '320MB',
      modified: 'Yesterday',
      sharedUsers: [],
    },
  ];

  return (
    <div className="border border-gray-200 rounded-2xl p-5 h-auto text-base font-semibold">
      <div className="flex justify-end items-center gap-0">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md">
                <LayoutGrid className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Grid View</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 hover:bg-muted rounded-md">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>More actions</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      <Table>
        <FileTableHeader />
        <TableBody>
          {files.map((file) => (
            <FileTableRow
              key={file.id}
              file={file}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function FileTableHeader() {
  return (
    <TableHeader>
      <TableRow className="border-gray-200 hover:bg-transparent text-white opacity-45">
        <TableHead className="w-[40%] flex items-center">
          <span>Name</span>
          <ChevronDown className="h-6 w-6" />
        </TableHead>
        <TableHead>Sharing</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Modified</TableHead>
        <TableHead className="text-right"></TableHead>
      </TableRow>
      {/* addedd fro extra space before the body */}
      <div className="h-12"></div>
    </TableHeader>
  );
}

function FileTableRow({ file }: { file: FileItem }) {
  return (
    <TableRow className="hover:bg-muted/40 transition !border-b-0 cursor-pointer">
      <TableCell>
        <div className="flex items-center gap-3">
          <FileIcon type={file.type} />
          <span className="font-medium">{file.name}</span>
        </div>
      </TableCell>

      <TableCell>
        <SharingCell
          sharing={file.sharing}
          sharedUsers={file.sharedUsers}
        />
      </TableCell>

      <TableCell className="text-muted-foreground">{file.size}</TableCell>
      <TableCell className="text-muted-foreground">{file.modified}</TableCell>

      <TableCell className="text-right">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon">
                <MoreHorizontal className="w-4 h-4 dark:text-[#0AFEF2]" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>File Actions Menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </TableCell>
    </TableRow>
  );
}

function FileIcon({ type }: { type: 'folder' | 'file' }) {
  return <Fileicon type={type} />;
}

function SharingCell({
  sharing,
  sharedUsers,
}: {
  sharing: string;
  sharedUsers: string[];
}) {
  if (sharedUsers.length === 0) {
    return <span className="text-muted-foreground">{sharing}</span>;
  }

  return (
    <div className="flex -space-x-2">
      {sharedUsers.map((img, i) => (
        <Avatar
          key={i}
          className="w-9.5 h-9.5 bg-[#D9D9D9]">
          <AvatarImage
            src={img}
            alt="user"
          />
        </Avatar>
      ))}
    </div>
  );
}
