'use client';

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
import { FileItem } from '@/types/File';

interface RowProps {
  file: FileItem;
  onDeleteClick?: (item: FileItem) => void;
  onOpen: (file: FileItem) => void;
}

export function FileTableRow({ file, onDeleteClick, onOpen }: RowProps) {
  const { isSelected, eventHandlers } = useHighlightable(file.id);
  

  return (
    <>
      <TableRow
        {...eventHandlers}
        onDoubleClick={() => onOpen(file)}
        className={`
    transition cursor-pointer !border-b-0 select-none touch-none
    ${isSelected ? 'bg-[#0AFEF236] hover:bg-[#0AFEF236]' : 'hover:bg-muted/40'}
  `}>
        <TableCell className="w-[40%] text-left rounded-l-lg">
          <div className="flex items-center gap-3 overflow-hidden">
            <Fileicon
              type={file.type}
              isSheetPage={false}
            />
            <span className="font-medium truncate" title={file.name}>{file.name}</span>
          </div>
        </TableCell>

        <TableCell className="w-[20%] text-left overflow-hidden">
          <span className='truncate' title={file.author}>
          <AuthorCell author={file.author} />
          </span>
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
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TRIGGER THE DELETE MODAL
                      onDeleteClick?.(file);
                    }}>
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>
        </TableCell>
      </TableRow>
      <TableRow className="pointer-events-none !border-b-0">
        <TableCell
          colSpan={5}
          className="h-[2px]"
        />
      </TableRow>
    </>
  );
}

export function MobileFileRow({ file, onDeleteClick, onOpen }: RowProps) {
  const { isSelected, eventHandlers } = useHighlightable(file.id);

  return (
    <div
      {...eventHandlers}
      onDoubleClick={() => onOpen(file)}
      className={`
        flex items-center justify-between p-4 transition cursor-pointer select-none touch-none
        ${isSelected ? 'bg-[#0AFEF236]' : 'hover:bg-muted/40'}
      `}>
      <div className="flex items-center gap-4 overflow-hidden">
        <div className="flex-shrink-0">
          <Fileicon
            type={file.type}
            isSheetPage={false}
          />
        </div>

        <div className="flex flex-col overflow-hidden">
          <span className="font-semibold text-[15px] truncate text-[#050E3F] dark:text-white">
            {file.name}
          </span>

          <div className="flex items-center gap-1 text-[12px] text-muted-foreground font-normal">
            <span className="truncate max-w-[80px]">{file.author}</span>
            <span>•</span>
            <span>{file.size}</span>
            <span>•</span>
            <span className="truncate">{file.modified}</span>
          </div>
        </div>
      </div>

      <div className="flex-shrink-0 ml-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="p-2 hover:bg-black/5 rounded-full transition-colors"
              onClick={(e) => e.stopPropagation()}>
              <MoreHorizontal className="w-5 h-5 dark:text-[#0AFEF2] text-[#050E3F]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              className="text-red-600 focus:text-red-600"
              onClick={(e) => {
                e.stopPropagation();
                onDeleteClick?.(file);
              }}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Permanently
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
