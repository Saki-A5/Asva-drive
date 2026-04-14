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
  /** Admins only: opens create-event dialog from dashboard Create menu */
  onCreateEventClick?: () => void;
}

const Create: FC<CreateProps> = ({
  onCreateFolderClick,
  creating,
  onCreateEventClick,
}) => {
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
          onSelect={(e) => {
            e.preventDefault()
            onCreateFolderClick()}}
          disabled={creating}
        >
          Folder
        </DropdownMenuItem>
        {onCreateEventClick && (
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              onCreateEventClick();
            }}
          >
            Event
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default Create;
