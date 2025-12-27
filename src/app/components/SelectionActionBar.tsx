"use client";

import {
  X,
  Trash2,
  Download,
  UserPlus2,
  Link2,
  FolderSymlinkIcon,
  MoreVertical,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type SelectionActionBarProps = {
  count: number;
  onClear: () => void;
  onDelete?: () => void;
  onDownload?: () => void;
  onShare?: () => void;
  onGetLink?: () => void;
  onMove?: () => void;
};


const iconClass =
  "text-[#050E3F] w-5 h-5 cursor-pointer dark:text-white";

const SelectionActionBar = ({
  count,
  onClear,
  onDelete,
  onDownload,
  onShare,
  onGetLink,
  onMove,
}: SelectionActionBarProps) => {
  if (count <= 1) return null;

  return (
    <div className="w-full min-h-[44px] py-2 bg-[#0AFEF236] rounded-lg flex px-2 items-center mb-3 mt-3 gap-4 flex-wrap dark:bg-[#0AFEF236]">
      <X
        className="text-[#00000080] w-5 h-5 cursor-pointer dark:text-[#D9D9D999]"
        onClick={onClear}
      />

      <p className="font-semibold text-[#050E3F] text-sm sm:text-base whitespace-nowrap dark:text-white">
        {count} selected
      </p>

      <Trash2 className={iconClass} onClick={onDelete} />
      <Download className={iconClass} onClick={onDownload} />

      <div className="hidden sm:flex gap-3">
        <UserPlus2 className={iconClass} onClick={onShare} />
        <Link2 className={iconClass} onClick={onGetLink} />
        <FolderSymlinkIcon className={iconClass} onClick={onMove} />
      </div>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="sm:hidden">
            <MoreVertical className={iconClass} />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent align="end" className="w-44">
          <DropdownMenuItem onClick={onShare}>
            <UserPlus2 className="mr-2 h-4 w-4" />
            Share
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onGetLink}>
            <Link2 className="mr-2 h-4 w-4" />
            Get link
          </DropdownMenuItem>

          <DropdownMenuItem onClick={onMove}>
            <FolderSymlinkIcon className="mr-2 h-4 w-4" />
            Move to folder
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SelectionActionBar;
