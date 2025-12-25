'use client';
import React from 'react';
import { useHighlightable } from '@/hooks/useHighlightable';
import { TableCell, TableRow } from '@/components/ui/table';
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import AuthorCell from "./AuthorCell";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import Fileicon from "./Fileicon";

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
      <TableRow
        {...eventHandlers}
        className={`
          transition cursor-pointer !border-b-0 select-none touch-none
          ${
            isSelected
              ? 'bg-[#0AFEF236] !border-b-0 hover:bg-0'
              : 'hover:bg-muted/40 transition !border-b-0 cursor-pointer'
          }
        `}>
        <TableCell className="rounded-l-lg">
          <div className="flex items-center gap-3">
            <Fileicon
              type={file.type}
              isSheetPage={false}
            />
            <span className="font-medium">{file.name}</span>
          </div>
        </TableCell>

        <TableCell>
          <AuthorCell author={file.author} />
        </TableCell>

        <TableCell className="text-muted-foreground">{file.size}</TableCell>
        <TableCell className="text-muted-foreground">{file.modified}</TableCell>

        <TableCell className="text-right rounded-r-lg">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon">
                  <MoreHorizontal className="w-4 h-4 dark:text-[#0AFEF2] text-[#050E3F]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>File Actions Menu</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>

      {/* Spacer row */}
      <TableRow className="pointer-events-none !border-b-0">
        <TableCell
          colSpan={5}
          className="h-[2px]"
        />
      </TableRow>
    </>
  );
}
