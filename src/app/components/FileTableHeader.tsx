import React from 'react';
import { TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChevronDown } from 'lucide-react';

export default function FileTableHeader() {
  return (
    <TableHeader className="sticky top-0 bg-background z-10">
      <TableRow className="border-gray-200 hover:bg-transparent text-white opacity-45">
        <TableHead className="w-[40%] flex items-center">
          <span>Name</span>
          <ChevronDown className="h-6 w-6" />
        </TableHead>
        <TableHead>Author</TableHead>
        <TableHead>Size</TableHead>
        <TableHead>Modified</TableHead>
        <TableHead className="text-right"></TableHead>
      </TableRow>
    </TableHeader>
  );
}
