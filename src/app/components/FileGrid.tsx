'use client';

import React from 'react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { MoreHorizontal } from 'lucide-react';
import Fileicon from './Fileicon';
import { useSelection } from '@/context/SelectionContext';
import { useHighlightable } from '@/hooks/useHighlightable';

export interface FileItem {
  id: string;
  name: string;
  type: string;
  sharing?: string;
  size: string;
  modified?: string;
  sharedUsers?: string[];
}

interface FileGridItemProps {
  file: FileItem;
}

export const capitalizeFirstLetter = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

const FileGridItem: React.FC<FileGridItemProps> = ({ file }) => {
  const { isSelected, eventHandlers } = useHighlightable(file.id);
  const { selectedItems, toggleItem } = useSelection();

  const selected = selectedItems.includes(file.id);

  return (
    <div
      {...eventHandlers}
      className={`flex flex-col items-start p-4 rounded-xl shadow-sm transition h-[200px] gap-3 w-full cursor-pointer touch-none select-none
        ${selected ? "bg-[#0AFEF236] border border-blue-400" : "bg-white dark:bg-neutral-900 hover:shadow-md"}
      `}
    >
      {/* Top File Display */}
      <div className="w-full bg-black/10 h-[80%] flex justify-center items-center rounded-md relative">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <button className="p-2 rounded-md absolute top-0 right-2 cursor-pointer">
                <MoreHorizontal className="w-5 h-5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>
              <p>File actions menu</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <div className="flex flex-col items-center text-sm font-bold">
          <Fileicon
            type={file.type}
            isSheetPage={false}
          />
          {capitalizeFirstLetter(file.type)}
        </div>
      </div>

      {/* File Info */}
      <div className="flex gap-3 items-center flex-wrap justify-center">
        <div>
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
