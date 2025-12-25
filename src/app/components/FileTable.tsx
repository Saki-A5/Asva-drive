"use client";

import { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  MoreHorizontal,
  LayoutGrid,
  Columns,
  Download,
  Star,
  Trash2,
} from 'lucide-react';
import { SelectionProvider, useSelection } from '@/context/SelectionContext';

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from '@/components/ui/tooltip';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { parseDate, parseSize } from '@/utils/sort';

import FileTableRow from './FileTableRow';
import FileTableHeader from './FileTableHeader';
import FileGrid from './FileGrid';
import Fileicon from './Fileicon';
import SelectionActionBar from './SelectionActionBar';
import AuthorCell from './AuthorCell';

const SORT_COOKIE_KEY = 'file_table_sort';

export type FileItem = {
  id: string;
  name: string;
  type: string;
  items?: string;
  author: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

interface FileTableProps {
  files: FileItem[];
  header?: string;
}

export default function FileTable({ files }: FileTableProps) {
  // useState to control the layout onClick
  const [layout, setLayout] = useState('flex');

  return (
    <SelectionProvider>
      <FileTableContent
        files={files}
        layout={layout}
        setLayout={setLayout}
      />
    </SelectionProvider>
  );
}

interface FileTableContentProps {
  files: FileItem[];
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  header?: string;
}

type SortKeyType = 'name' | 'author' | 'size' | 'modified';

function FileTableContent({
  files,
  layout,
  setLayout,
  header,
}: FileTableContentProps) {
  const { selectedItems, clearSelection } = useSelection();
  const [sheetOpen, setSheetOpen] = useState(false);

  const [sortKey, setSortKey] = useState<SortKeyType>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  function handleSort(key: SortKeyType) {
    if (sortKey === key) {
      // same column → toggle direction
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      // new column → start ascending
      setSortKey(key);
      setSortDirection('asc');
    }
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (!sortKey) return 0;

    let aValue: any = a[sortKey];
    let bValue: any = b[sortKey];

    if (sortKey === 'size') {
      aValue = parseSize(a.size);
      bValue = parseSize(b.size);
    }

    if (sortKey === 'modified') {
      aValue = parseDate(a.modified).getTime();
      bValue = parseDate(b.modified).getTime();
    }

    if (typeof aValue === 'string') {
      return sortDirection === 'asc'
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
  });

  useEffect(() => {
    const cookie = document.cookie
      .split('; ')
      .find((row) => row.startsWith(`${SORT_COOKIE_KEY}=`));

    if (!cookie) return;

    try {
      const value = JSON.parse(decodeURIComponent(cookie.split('=')[1]));
      if (value.sortKey && value.sortDirection) {
        setSortKey(value.sortKey);
        setSortDirection(value.sortDirection);
      }
    } catch {
      // ignore corrupted cookie
      console.error('Cookie corrupted');
    }
  }, []);

  useEffect(() => {
    const value = JSON.stringify({ sortKey, sortDirection });

    document.cookie = `${SORT_COOKIE_KEY}=${encodeURIComponent(
      value
    )}; path=/; max-age=31536000`;
  }, [sortKey, sortDirection]);

  useEffect(() => {
    if (selectedItems.length === 1) {
      setSheetOpen(true);
    } else {
      setSheetOpen(false);
    }
  }, [selectedItems.length]);

  console.log(selectedItems);

  return (
    <div className="border border-gray-200 rounded-2xl p-2 md:p-5 flex flex-col h-full min-h-0 text-base font-semibold">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{header}</h2>
        <div className="flex justify-end items-center gap-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 hover:bg-muted rounded-md"
                  onClick={
                    layout == 'flex'
                      ? () => setLayout('grid')
                      : () => setLayout('flex')
                  }>
                  {layout == 'flex' ? (
                    <LayoutGrid className="w-5 h-5" />
                  ) : (
                    <Columns className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{layout == 'flex' ? 'Grid' : 'Flex'} View</p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-2 hover:bg-muted rounded-md">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>More actions</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* conditional here */}
      {layout === 'grid' ? (
        <section className="flex-1 min-h-0 overflow-y-auto p-4 rounded-xl bg-card">
          <SelectionActionBar
            count={selectedItems.length}
            onClear={clearSelection}
            // onDelete={handleDelete}
            // onDownload={handleDownload}
            // onShare={handleShare}
            // onGetLink={handleGetLink}
            // onMove={handleMove}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {sortedFiles.map((file) => (
              <FileGrid
                file={file}
                key={file.id}
              />
            ))}
          </div>
        </section>
      ) : (
        <>
          <SelectionActionBar
            count={selectedItems.length}
            onClear={clearSelection}
            // onDelete={handleDelete}
            // onDownload={handleDownload}
            // onShare={handleShare}
            // onGetLink={handleGetLink}
            // onMove={handleMove}
          />

          <div className="flex flex-col flex-1 min-h-0  rounded-2xl">
            {/* SelectionActionBar */}
            <SelectionActionBar
              count={selectedItems.length}
              onClear={clearSelection}
            />

            <div className="flex flex-col flex-1 min-h-0">
              <div className="overflow-hidden">
                <Table className="table-fixed min-w-[550px] w-full">
                  <FileTableHeader
                    onSort={handleSort}
                    sortKey={sortKey}
                    sortDirection={sortDirection}
                  />
                </Table>
              </div>

              <div className="flex-1 overflow-x-auto overflow-y-auto">
                <Table className="table-fixed min-w-[550px] w-full">
                  <TableBody>
                    {sortedFiles.map((file) => (
                      <FileTableRow
                        key={file.id}
                        file={file}
                      />
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </>
      )}

      {files.map(
        (file) =>
          selectedItems.includes(file.id) && (
            <Sheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              key={file.id}>
              <SheetContent
                side="right"
                className="w-[80vw] max-w-[360px] sm:w-[360px] md:w-[480px] overflow-y-auto">
                <div className="mt-6 flex flex-col items-center w-full px-4 sm:px-6">
                  <div className="w-full max-w-[224px] aspect-square flex flex-col border rounded-[15px] justify-center items-center">
                    <Fileicon
                      type={file.type}
                      isSheetPage={sheetOpen}
                    />
                    <p className="text-[24px] font-semibold">{file.name}</p>
                  </div>
                  <div className="mt-5 flex gap-4">
                    <div className="bg-[#D9D9D961] p-2 rounded-[3px] cursor-pointer dark:bg-white">
                      <Download className="text-[#050E3F]" />
                    </div>
                    <div className="bg-[#D9D9D961] p-2 rounded-[3px] cursor-pointer dark:bg-white">
                      {' '}
                      <Star fill="#050E3F" />
                    </div>
                    <div className="bg-[#D9D9D961] p-2 rounded-[3px] cursor-pointer dark:bg-white">
                      <Trash2 className="text-[#050E3F]" />
                    </div>
                  </div>

                  <div className="w-full max-w-[320px] mt-6">
                    <h3 className="font-bold text-[20px] dark:text-white">
                      Description
                    </h3>
                    <p className="font-[400] text-sm dark:text-[#FFFFFFB2]">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Voluptates nostrum tempora dicta maxime non id eos
                      exercitationem cumque minima. Eaque odio sunt voluptate
                      aspernatur eos!
                    </p>
                  </div>

                  <div className="w-full max-w-[320px] mt-6">
                    <h3 className="font-bold text-[20px]">Info</h3>
                    <div className="flex justify-between mb-5">
                      <p className="dark:text-[#FFFFFF73]">Size</p>
                      <p>{file.size}</p>
                    </div>
                    <div className="flex justify-between">
                      <p className="dark:text-[#FFFFFF73]">Items</p>
                      <p>{file.id}</p>
                    </div>
                  </div>

                  <div className="w-full max-w-[320px] mt-6">
                    <h3 className="font-bold text-[20px]">Shared by</h3>
                    {/* <AuthorCell author={file.author} /> */}
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          )
      )}
    </div>
  );
}
