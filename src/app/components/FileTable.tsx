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

export type FileItem = {
  id: string;
  name: string;
  type: string;
  sharing: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

interface FileTableProps {
  files: FileItem[];
}

export default function FileTable({ files }: FileTableProps) {
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
