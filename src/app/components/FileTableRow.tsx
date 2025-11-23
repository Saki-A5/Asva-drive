import React from 'react';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import SharingCell from './SharingCell';
import { Button } from '@/components/ui/button';
import { MoreHorizontal } from 'lucide-react';
import Fileicon from './Fileicon';

type FileItem = {
  id: string;
  name: string;
  type: string;
  sharing: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

export default function FileTableRow({ file }: { file: FileItem }) {
  return (
    <TableRow className="hover:bg-muted/40 transition !border-b-0 cursor-pointer">
      <TableCell>
        <div className="flex items-center gap-3">
          <Fileicon type={file.type} />
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
