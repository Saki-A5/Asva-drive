'use client';

import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu'; // Shadcn DropdownMenu
import { FC } from 'react';

interface CreateProps {
  onCreateFolderClick: () => void;
  creating?: boolean;
}

const Create: FC<CreateProps> = ({ onCreateFolderClick, creating }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="cursor-pointer">
          <span className="flex gap-2 items-center">
            <Plus className="h-5 w-5" />
            <span className="hidden [@media(min-width:440px)]:inline-block">
              Create
            </span>
            <ChevronDown className="h-4 w-4" />
          </span>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-40">
        <DropdownMenuItem
          onSelect={onCreateFolderClick}
          disabled={creating}
        >
          Folder
        </DropdownMenuItem>
        {/* Add more items here in the future */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Create;
