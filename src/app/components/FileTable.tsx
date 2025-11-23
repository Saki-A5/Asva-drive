'use client';

import { Table, TableBody } from '@/components/ui/table';
import { MoreHorizontal, LayoutGrid } from 'lucide-react';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import FileTableRow from './FileTableRow';
import FileTableHeader from './FileTableHeader';

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
      type: 'folder',
      sharing: 'Public',
      size: '2.7GB',
      modified: 'Oct 12, 2025',
      sharedUsers: [],
    },
    {
      id: '333444',
      name: 'MATLAB',
      type: 'folder',
      sharing: 'Public',
      size: '5.2GB',
      modified: 'Jan 12, 2026',
      sharedUsers: [],
    },
    {
      id: '444555',
      name: 'Previous Work',
      type: 'pdf',
      sharing: 'Public',
      size: '1.0GB',
      modified: 'Nov 8, 2025',
      sharedUsers: [],
    },

    {
      id: '555666',
      name: 'AutoCAD Workbook',
      type: 'folder',
      sharing: 'Public',
      size: '320MB',
      modified: 'Yesterday',
      sharedUsers: [],
    },
    {
      id: '666777',
      name: 'Python',
      type: 'folder',
      sharing: 'Shared',
      size: '1.2GB',
      modified: 'Apr 27, 2025',
      sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
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
