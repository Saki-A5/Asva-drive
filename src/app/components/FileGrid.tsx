'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, Trash2 } from 'lucide-react';
import Fileicon from './Fileicon';
import { useSelection } from '@/context/SelectionContext';
import { useHighlightable } from '@/hooks/useHighlightable';
import { FileItem } from '@/types/File';

interface FileGridItemProps {
  file: FileItem;
  onDeleteClick?: (item: FileItem) => void;
  onOpen: (item: FileItem) => void;
}

export const capitalizeFirstLetter = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const FileGridItem: React.FC<FileGridItemProps> = ({ file, onDeleteClick, onOpen }) => {
  const { isSelected, eventHandlers } = useHighlightable(file.id);
  const { selectedItems } = useSelection();

  const selected = selectedItems.includes(file.id);

  return (
    <div
      {...eventHandlers}
      onDoubleClick={() => onOpen(file)}
      className={`flex flex-col items-start p-4 rounded-xl shadow-sm transition h-[200px] gap-3 w-full cursor-pointer touch-none select-none
        ${
          selected
            ? 'bg-[#0AFEF236] border border-blue-400'
            : 'bg-white dark:bg-neutral-900 hover:shadow-md'
        }
      `}>
      <div className="w-full bg-black/10 h-[80%] flex justify-center items-center rounded-md relative">
        <div className="absolute top-0 right-2 z-20">
          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <button
                      className="p-2 rounded-md cursor-pointer hover:bg-black/5"
                      onClick={(e) => e.stopPropagation()}>
                      <MoreHorizontal className="w-5 h-5" />
                    </button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>File actions menu</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <DropdownMenuContent align="end">
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600 cursor-pointer"
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

        <div className="flex flex-col items-center text-sm font-bold">
          <Fileicon
            type={file.type}
            isSheetPage={false}
          />
          {capitalizeFirstLetter(file.type)}
        </div>
      </div>

      <div className="flex gap-3 items-center flex-wrap justify-center w-full">
        <div className="w-full">
          <h3 className="font-semibold text-sm truncate w-full">{file.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {file.size}. {capitalizeFirstLetter(file.type)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default FileGridItem;
