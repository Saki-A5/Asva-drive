'use client';

import { TableHeader, TableRow, TableHead } from '@/components/ui/table';
import { ArrowUp, ArrowDown } from 'lucide-react';

type SortKeyType = 'name' | 'author' | 'size' | 'modified';

interface FileTableHeaderProps {
  onSort: (key: SortKeyType) => void;
  sortKey: SortKeyType;
  sortDirection: 'asc' | 'desc';
}

function SortArrow({
  active,
  direction,
}: {
  active: boolean;
  direction: 'asc' | 'desc';
}) {
  if (!active) return null;

  return direction === 'asc' ? (
    <ArrowUp className="ml-1 h-4 w-4 inline-block text-muted-foreground" />
  ) : (
    <ArrowDown className="ml-1 h-4 w-4 inline-block text-muted-foreground" />
  );
}

export default function FileTableHeader({
  onSort,
  sortKey,
  sortDirection,
}: FileTableHeaderProps) {
  return (
    <TableHeader className="sticky top-0 bg-background z-10">
      <TableRow className="border-b border-gray-200 hover:bg-transparent">
        <TableHead
          className="w-[40%] text-left cursor-pointer select-none hover:bg-muted/50"
          onClick={() => onSort('name')}>
          <span className="inline-flex items-center">
            Name
            <SortArrow
              active={sortKey === 'name'}
              direction={sortDirection}
            />
          </span>
        </TableHead>

        <TableHead
          className="w-[20%] text-left cursor-pointer select-none hover:bg-muted/50"
          onClick={() => onSort('author')}>
          <span className="inline-flex items-center">
            Author
            <SortArrow
              active={sortKey === 'author'}
              direction={sortDirection}
            />
          </span>
        </TableHead>

        <TableHead
          className="w-[15%] text-left cursor-pointer select-none hover:bg-muted/50"
          onClick={() => onSort('size')}>
          <span className="inline-flex items-center">
            Size
            <SortArrow
              active={sortKey === 'size'}
              direction={sortDirection}
            />
          </span>
        </TableHead>

        <TableHead
          className="w-[15%] text-left cursor-pointer select-none hover:bg-muted/50"
          onClick={() => onSort('modified')}>
          <span className="inline-flex items-center">
            Modified
            <SortArrow
              active={sortKey === 'modified'}
              direction={sortDirection}
            />
          </span>
        </TableHead>

        <TableHead className="w-[10%] text-right" />
      </TableRow>
    </TableHeader>
  );
}
