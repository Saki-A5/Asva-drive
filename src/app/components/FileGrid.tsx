"use client";

import React from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, MoreHorizontal, Share2, Trash2, UserPlus } from "lucide-react";
import Fileicon from "./Fileicon";
import { useSelection } from "@/context/SelectionContext";
import { useHighlightable } from "@/hooks/useHighlightable";
import { FileItem } from "@/types/File";
import { Button } from "@/components/ui/button";

interface FileGridItemProps {
  file: FileItem;
  onDeleteClick?: (item: FileItem) => void;
  onOpen: (item: FileItem) => void;
  onRenameClick?: (item: FileItem) => void;
}

export const capitalizeFirstLetter = (str: string) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1) : "";

const FileGridItem: React.FC<FileGridItemProps> = ({
  file,
  onDeleteClick,
  onOpen,
  onRenameClick,
}) => {
  const { isSelected, eventHandlers } = useHighlightable(file.id);
  const { selectedItems } = useSelection();

  const selected = selectedItems.includes(file.id);

  return (
    <div
      {...eventHandlers}
      onDoubleClick={() => onOpen(file)}
      className={`flex flex-col items-start p-4 rounded-xl shadow-sm transition h-[200px] gap-3 w-full cursor-pointer touch-pan-y select-none
        ${
          selected
            ? "bg-[#0AFEF236] border border-blue-400"
            : "bg-white dark:bg-neutral-900 hover:shadow-md"
        }
      `}>
      <div className="w-full bg-black/10 h-[80%] flex justify-center items-center rounded-md relative">
        <div className="absolute top-0 right-2 z-20">
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
                          console.log("Share directly", file.id);
                        }}>
                        <UserPlus className="mr-2 h-4 w-4" />
                        Share via mail
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={(e) => {
                          e.stopPropagation();
                          console.log("Share via link", file.id);
                        }}>
                        <Link className="mr-2 h-4 w-4" />
                        Share via link
                      </DropdownMenuItem>
                    </DropdownMenuSubContent>
                  </DropdownMenuSub>
                  {onDeleteClick && (
                    <DropdownMenuItem
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(file);
                      }}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </Tooltip>
          </TooltipProvider>
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
