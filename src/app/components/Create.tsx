'use client';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown } from 'lucide-react';

const Create = () => {
  return (
    <>
      <Button
        variant="outline"
        className="cursor-pointer">
        <span className="flex gap-2">
          <span className="flex items-center">
            <Plus className="h-7 w-7" />
            <span className="pl-1 hidden [@media(min-width:440px)]:inline-block">
              Create
            </span>
          </span>
          <span className="flex items-center">
            <ChevronDown className="h-6 w-6" />
          </span>
        </span>
      </Button>
    </>
  );
};
export default Create;
