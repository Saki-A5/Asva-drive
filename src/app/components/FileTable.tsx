"use client";

import { useState, useEffect, useRef } from "react";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  MoreHorizontal,
  LayoutGrid,
  Columns,
  Download,
  Star,
  Trash2,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { SelectionProvider, useSelection } from "@/context/SelectionContext";
import { useRouter } from "next/navigation";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { parseDate, parseSize } from "@/utils/sort";
import { FileItem } from "@/types/File";
import { FileTableRow, MobileFileRow } from "./FileTableRow";
import FileTableHeader from "./FileTableHeader";
import FileGrid from "./FileGrid";
import Fileicon from "./Fileicon";
import AuthorCell from "./AuthorCell";
import SelectionActionBar from "./SelectionActionBar";

const SORT_COOKIE_KEY = "file_table_sort";

interface FileTableProps {
  files: FileItem[];
  header?: string;
  onDeleteClick?: (item: FileItem) => void;
  onRenameClick?: (item: FileItem) => void;
  onRestoreClick?: (item: FileItem) => void;
  onOpen?: (item: FileItem) => void;
}

interface FileTableContentProps {
  files: FileItem[];
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  header?: string;
  onDeleteClick?: (item: FileItem) => void;
  onRenameClick?: (item: FileItem) => void;
  onRestoreClick?: (item: FileItem) => void;
  onOpen?: (item: FileItem) => void;
}

type SortKeyType = "name" | "author" | "size" | "modified";

// Only the changed/added lines are shown — merge into your existing FileTable.tsx

// 1. Add isCollegeView to FileTableProps
interface FileTableProps {
  files: FileItem[];
  header?: string;
  onDeleteClick?: (item: FileItem) => void;
  onRenameClick?: (item: FileItem) => void;
  onOpen?: (item: FileItem) => void;
  /** Set to true inside app/college/[slug] to show "Save to My Files" */
  isCollegeView?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

// 2. Pass it through in the default export
export default function FileTable({
  files,
  header,
  onDeleteClick,
  onRenameClick,
  isCollegeView = false,
  onOpen,
  hasMore,
  loadingMore,
  onLoadMore,
}: FileTableProps) {
  const [layout, setLayout] = useState("flex");

  return (
    <SelectionProvider>
      <FileTableContent
        files={files}
        layout={layout}
        setLayout={setLayout}
        header={header}
        onDeleteClick={onDeleteClick}
        onRenameClick={onRenameClick}
        isCollegeView={isCollegeView}
        onOpen={onOpen}
        hasMore={hasMore}
        loadingMore={loadingMore}
        onLoadMore={onLoadMore}
      />
    </SelectionProvider>
  );
}

// 3. Add isCollegeView to FileTableContentProps
interface FileTableContentProps {
  files: FileItem[];
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
  header?: string;
  onDeleteClick?: (item: FileItem) => void;
  onRenameClick?: (item: FileItem) => void;
  onOpen?: (item: FileItem) => void;
  isCollegeView?: boolean;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
}

// 4. Destructure and thread it to FileTableRow / MobileFileRow / FileGrid
// function FileTableContent({
//   files,
//   layout,
//   setLayout,
//   header,
//   onDeleteClick,
//   onRenameClick,
//   onOpen,
//   isCollegeView = false,
// }: FileTableContentProps) {
//   // ...all existing state and logic stays the same...
//   // In the table body:
//   // <FileTableRow ... isCollegeView={isCollegeView} />
//   // In the mobile list:
//   // <MobileFileRow ... isCollegeView={isCollegeView} />
// }

function FileTableContent({
  files,
  layout,
  setLayout,
  header,
  onDeleteClick,
  onRenameClick,
  onRestoreClick,
  onOpen,
  isCollegeView = false,
  hasMore,
  loadingMore,
  onLoadMore,
}: FileTableContentProps) {
  const { selectedItems, clearSelection } = useSelection();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sortKey, setSortKey] = useState<SortKeyType>("name");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const router = useRouter();

  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!sentinelRef.current || !onLoadMore) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, onLoadMore]);

  function handleSort(key: SortKeyType) {
    if (sortKey === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  }

  const sortedFiles = [...files].sort((a, b) => {
    if (!sortKey) return 0;
    let aValue: any;
    let bValue: any;
    if (sortKey === "size") {
      aValue = parseSize(a.size);
      bValue = parseSize(b.size);
    } else if (sortKey === "modified") {
      aValue = parseDate(a.modified).getTime();
      bValue = parseDate(b.modified).getTime();
    } else {
      aValue = (a[sortKey] || "").toString().toLowerCase();
      bValue = (b[sortKey] || "").toString().toLowerCase();
    }
    if (aValue === bValue) return 0;
    if (sortDirection === "asc") return aValue > bValue ? 1 : -1;
    else return aValue < bValue ? 1 : -1;
  });

  useEffect(() => {
    const cookie = document.cookie
      .split("; ")
      .find((row) => row.startsWith(`${SORT_COOKIE_KEY}=`));
    if (!cookie) return;
    try {
      const value = JSON.parse(decodeURIComponent(cookie.split("=")[1]));
      if (value.sortKey && value.sortDirection) {
        setSortKey(value.sortKey);
        setSortDirection(value.sortDirection);
      }
    } catch {
      console.error("Cookie corrupted");
    }
  }, []);

  useEffect(() => {
    const value = JSON.stringify({ sortKey, sortDirection });
    document.cookie = `${SORT_COOKIE_KEY}=${encodeURIComponent(value)}; path=/; max-age=31536000`;
  }, [sortKey, sortDirection]);

  useEffect(() => {
    if (selectedItems.length === 1) setSheetOpen(true);
    else setSheetOpen(false);
  }, [selectedItems.length]);

  return (
    <div className="border border-gray-200 rounded-2xl p-2 md:p-5 flex flex-col h-fit md:h-full text-base font-semibold">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">{header}</h2>
        <div className="flex justify-end items-center gap-0">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 hover:bg-muted rounded-md"
                  onClick={
                    layout == "flex"
                      ? () => setLayout("grid")
                      : () => setLayout("flex")
                  }>
                  {layout == "flex" ? (
                    <LayoutGrid className="w-5 h-5" />
                  ) : (
                    <Columns className="w-5 h-5" />
                  )}
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{layout == "flex" ? "Grid" : "Flex"} View</p>
              </TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 hover:bg-muted rounded-md"
                  aria-label="More actions"
                  title="More actions">
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

      {layout === "grid" ? (
        <section className="flex-1 min-h-0 overflow-y-auto p-4 rounded-xl bg-card">
          <SelectionActionBar
            count={selectedItems.length}
            onClear={clearSelection}
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4 touch-pan-y min-h-0">
            {sortedFiles.map((file) => (
              <FileGrid
                file={file}
                key={file.id}
                onDeleteClick={onDeleteClick}
                onOpen={onOpen}
                onRenameClick={onRenameClick}
              />
            ))}
          </div>
        </section>
      ) : (
        <div className="flex flex-col flex-1 min-h-0 rounded-2xl">
          <SelectionActionBar
            count={selectedItems.length}
            onClear={clearSelection}
          />

          {/* Desktop table */}
          <div className="hidden md:flex flex-col flex-1 min-h-0">
            <div className="overflow-hidden">
              <Table className="table-fixed min-w-[550px] w-full">
                <FileTableHeader
                  onSort={handleSort}
                  sortKey={sortKey}
                  sortDirection={sortDirection}
                />
              </Table>
            </div>
            <div className="flex-1 overflow-y-auto">
              <Table className="table-fixed min-w-[550px] w-full">
                <TableBody>
                  {sortedFiles.map((file) => (
                    <FileTableRow
                      key={file.id}
                      file={file}
                      onDeleteClick={onDeleteClick}
                      onOpen={onOpen}
                      onRenameClick={onRenameClick}
                      onRestoreClick={onRestoreClick}
                      isCollegeView={isCollegeView}
                    />
                  ))}
                </TableBody>
              </Table>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="py-4">
                  {loadingMore && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-xl bg-gray-100 h-28"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Mobile list */}
          <div className="flex md:hidden flex-col">
            <div className="flex items-center gap-4 px-4 py-3 border-b border-gray-100 overflow-x-auto no-scrollbar whitespace-nowrap bg-background/50 sticky top-0 z-10">
              {(["name", "author", "size", "modified"] as SortKeyType[]).map(
                (key) => (
                  <button
                    key={key}
                    onClick={() => handleSort(key)}
                    className={`text-sm font-semibold flex items-center gap-1 px-2 py-1 rounded-md transition-colors ${
                      sortKey === key
                        ? "text-[#050E3F] dark:text-[#0AFEF2] bg-muted"
                        : "text-muted-foreground"
                    }`}>
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                    {sortKey === key &&
                      (sortDirection === "asc" ? (
                        <ArrowUp className="w-3 h-3" />
                      ) : (
                        <ArrowDown className="w-3 h-3" />
                      ))}
                  </button>
                ),
              )}
            </div>
            <div className="flex-1 overflow-y-auto touch-pan-y min-h-0">
              <div className="divide-y divide-gray-50/10">
                {sortedFiles.map((file) => (
                  <MobileFileRow
                    key={file.id}
                    file={file}
                    onDeleteClick={onDeleteClick}
                    onOpen={onOpen}
                    onRenameClick={onRenameClick}
                    onRestoreClick={onRestoreClick}
                    isCollegeView={isCollegeView}
                  />
                ))}
              </div>
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="py-4">
                  {loadingMore && (
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 px-2">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-xl bg-gray-100 h-28"
                        />
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* File detail sheet */}
      {files.map(
        (file) =>
          selectedItems.includes(file.id) && (
            <Sheet
              open={sheetOpen}
              onOpenChange={setSheetOpen}
              key={file.id}>
              <SheetContent
                side="right"
                className="w-[80vw] max-w-90 sm:w-90 md:w-120 overflow-y-auto"
                aria-describedby="file-details-title">
                <VisuallyHidden>
                  <SheetTitle id="file-details-title">File details</SheetTitle>
                </VisuallyHidden>
                <div className="mt-6 flex flex-col items-center w-full px-4 sm:px-6">
                  <div className="w-[93%] max-w-56 flex flex-col border rounded-[15px] justify-center items-center mt-5 h-auto px-2">
                    <Fileicon
                      type={file.type}
                      isSheetPage={sheetOpen}
                    />
                    <p className="md:text-[24px] font-semibold text-center text-base mt-3 break-all">
                      {file.name}
                    </p>
                  </div>
                  <div className="mt-5 flex gap-4">
                    <button
                      aria-label="Download file"
                      title="Download file"
                      className="bg-[#D9D9D961] p-2 rounded-[3px] dark:bg-white">
                      <Download className="text-[#050E3F]" />
                    </button>
                    <button
                      aria-label="Star file"
                      title="Star file"
                      className="bg-[#D9D9D961] p-2 rounded-[3px] dark:bg-white">
                      <Star
                        className="text-[#050E3F]"
                        fill="#050E3F"
                      />
                    </button>
                    <button
                      aria-label="Delete file"
                      title="Delete file"
                      className="bg-[#D9D9D961] p-2 rounded-[3px] dark:bg-white"
                      onClick={() => onDeleteClick?.(file)}>
                      <Trash2
                        className="text-[#050E3F]"
                        fill="#050E3F"
                      />
                    </button>
                  </div>
                  <div className="w-full max-w-[320px] mt-6">
                    <h3 className="font-bold text-[20px] dark:text-white">
                      Description
                    </h3>
                    <p className="font-normal text-sm dark:text-[#FFFFFFB2]">
                      Lorem ipsum dolor sit amet consectetur adipisicing elit.
                      Voluptates nostrum tempora dicta maxime non id eos
                      exercitationem cumque minima. Eaque odio sunt voluptate
                      aspernatur eos!
                    </p>
                  </div>
                  <div className="w-full max-w-[320px] mt-6">
                    <h3 className="font-bold text-[20px]">Info</h3>
                    <div className="flex justify-between mb-5 flex-wrap">
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
                    <AuthorCell author={file.author} />
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          ),
      )}
    </div>
  );
}
