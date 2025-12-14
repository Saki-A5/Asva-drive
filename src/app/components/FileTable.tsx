// 

//

"use client";

import { useState, useEffect } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { MoreHorizontal, LayoutGrid, Columns, X } from "lucide-react";
import { SelectionProvider, useSelection } from "@/context/SelectionContext";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import FileTableRow from "./FileTableRow";
import FileTableHeader from "./FileTableHeader";
import FileGrid from "./FileGrid";

export type FileItem = {
  id: string;
  name: string;
  type: string;
  sharing: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

interface FileTableProps {
  files: FileItem[];
}

export default function FileTable({ files }: FileTableProps) {
  // useState to control the layout onClick
  const [layout, setLayout] = useState("flex");

  return (
    <SelectionProvider>
      <FileTableContent files={files} layout={layout} setLayout={setLayout} />
    </SelectionProvider>
  );
}

// New child component that can safely use the context
function FileTableContent({
  files,
  layout,
  setLayout,
}: {
  files: FileItem[];
  layout: string;
  setLayout: React.Dispatch<React.SetStateAction<string>>;
}) {
  const { selectedItems, clearSelection } = useSelection();

  const [sheetOpen, setSheetOpen] = useState(false);

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
                }
              >
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

      {/* conditional here */}
      {layout === "grid" ? (
        <section className="flex-1 min-h-0 overflow-y-auto p-4 rounded-xl bg-card">
          {selectedItems.length > 1 ? (
            <div className="w-full h-9 bg-[#0AFEF236] rounded-lg flex px-2 items-center mb-3 mt-3">
              <X
                className="text-[#00000080] w-5 h-5 cursor-pointer"
                onClick={() => clearSelection()}
              />
              <p>{selectedItems.length} selected</p>
            </div>
          ) : null}
          <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file) => (
              <FileGrid file={file} key={file.id} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {selectedItems.length > 1 ? (
            <div className="w-full h-9 bg-[#0AFEF236] rounded-lg flex px-2 items-center mb-3 mt-3">
              <X
                className="text-[#00000080] w-5 h-5 cursor-pointer"
                onClick={() => clearSelection()}
              />
              <p>{selectedItems.length} selected</p>
            </div>
          ) : null}
          <div className="relative flex flex-col flex-1 min-h-0">
            <Table>
              <FileTableHeader />
            </Table>
            {/* Scrollable body */}
            <div className="flex-1 min-h-0 overflow-y-auto">
              <Table>
                <TableBody>
                  {files.map((file) => (
                    <FileTableRow key={file.id} file={file} />
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}

      {files.map(
        (file) =>
          selectedItems.includes(file.id) && (
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen} key={file.id}>
              <SheetContent></SheetContent>
            </Sheet>
          )
      )}
    </div>
  );
}
