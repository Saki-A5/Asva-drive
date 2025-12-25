'use client';
import React from 'react';
import { useHighlightable } from '@/hooks/useHighlightable';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
} from '@/components/ui/dropdown-menu';
import AuthorCell from './AuthorCell';
import { Button } from '@/components/ui/button';
import { MoreHorizontal, Share2, Link, UserPlus, Trash2 } from 'lucide-react';
import Fileicon from './Fileicon';

type FileItem = {
  id: string;
  name: string;
  type: string;
  author: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

export default function FileTableRow({ file }: { file: FileItem }) {
  const { isSelected, eventHandlers } = useHighlightable(file.id);

  return (
    <>
      {/* <TableRow
        {...eventHandlers}
        className={`
    transition cursor-pointer !border-b-0 select-none touch-none
    ${isSelected ? 'bg-[#0AFEF236] hover:bg-[#0AFEF236]' : 'hover:bg-muted/40'}
  `}>
        <TableCell className="w-[40%] text-left rounded-l-lg">
          <div className="flex items-center gap-3">
            <Fileicon
              type={file.type}
              isSheetPage={false}
            />
            <span className="font-medium">{file.name}</span>
          </div>
        </TableCell>

        <TableCell className="w-[20%] text-left">
          <AuthorCell author={file.author} />
        </TableCell>

        <TableCell className="w-[15%] text-left text-muted-foreground">
          {file.size}
        </TableCell>

        <TableCell className="w-[15%] text-left text-muted-foreground">
          {file.modified}
        </TableCell>

        {/* Actions */}
        <TableCell className="w-[10%] text-right rounded-r-lg">
          <TooltipProvider>
            <Tooltip>
              <DropdownMenu>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-4 h-4 dark:text-[#0AFEF2] text-[#050E3F]" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>

                <TooltipContent side="left">
                  <p>Actions</p>
                </TooltipContent>

                <DropdownMenuContent align="end">
                  <DropdownMenuSub>
                    <DropdownMenuSubTrigger>
                      <Share2 className="mr-2 h-4 w-4" />
                      Share with
                    </DropdownMenuSubTrigger>

                    <DropdownMenuSubContent className="mr-2 mt-2">
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Share directly', file.id);
                        }}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Share via mail
                      </DropdownMenuItem>

                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log('Share via link', file.id);
                        }}>
                        <Link className="mr-2 h-4 w-4" />
                        Share via link
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>

                  <DropdownMenuItem
                    className="text-red-600 focus:text-red-600"
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('Delete', file.id);
                    }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      {/* </TableRow> */}

      <TableRow className="pointer-events-none !border-b-0">
        <TableCell
          colSpan={5}
          className="h-[2px]"
        />
      </TableRow>
    </>
  );
}
