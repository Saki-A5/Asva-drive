"use client";

import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { MoreHorizontal, LayoutGrid, Columns } from "lucide-react";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import FileTableRow from "./FileTableRow";
import FileTableHeader from "./FileTableHeader";
import Fileicon from "./Fileicon";

// type File = {
//   id: string;
//   name: string;
//   type: string;
//   size: number | string;
//   modified: Date;
// };

// const mockFiles: File[] = [
//   {
//     id: '1',
//     name: 'report.pdf',
//     type: 'PDF',
//     size: 2048 * 1024,
//     modified: new Date('2025-10-10'),
//   },
//   {
//     id: '2',
//     name: 'asva logo.jpg',
//     type: 'Image',
//     size: 1536 * 1024,
//     modified: new Date('2025-10-15'),
//   },
//   {
//     id: '3',
//     name: 'presentation.pptx',
//     type: 'Text',
//     size: 512 * 1024,
//     modified: new Date('2025-09-10'),
//   },
// ];
type FileItem = {
  id: string;
  name: string;
  type: string;
  sharing: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};

export default function FileTable() {
  const files: FileItem[] = [
    {
      id: "111222",
      name: "Past Questions",
      type: "folder",
      sharing: "Public",
      size: "1.2GB",
      modified: "Jun 12, 2025",
      sharedUsers: [],
    },
    {
      id: "222333",
      name: "C#/C++",
      type: "folder",
      sharing: "Public",
      size: "2.7GB",
      modified: "Oct 12, 2025",
      sharedUsers: [],
    },
    {
      id: "333444",
      name: "MATLAB",
      type: "folder",
      sharing: "Public",
      size: "5.2GB",
      modified: "Jan 12, 2026",
      sharedUsers: [],
    },
    {
      id: "444555",
      name: "Previous Work",
      type: "pdf",
      sharing: "Public",
      size: "1.0GB",
      modified: "Nov 8, 2025",
      sharedUsers: [],
    },

    {
      id: "555666",
      name: "AutoCAD Workbook",
      type: "folder",
      sharing: "Public",
      size: "320MB",
      modified: "Yesterday",
      sharedUsers: [],
    },
    {
      id: "666777",
      name: "Python",
      type: "folder",
      sharing: "Shared",
      size: "1.2GB",
      modified: "Apr 27, 2025",
      sharedUsers: ["/avatars/user1.png", "/avatars/user2.png"],
    },
  ];

  function capitalizeFirstLetter(str: string): string {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  const [layout, setLayout] = useState("flex");

  return (
    <div className="border border-gray-200 rounded-2xl p-2 md:p-5 h-auto text-base font-semibold">
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
      {layout == "grid" ? (
        <section className="p-4 rounded-xl bg-card">
          {files.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex flex-col items-start p-4  rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition h-[200px] gap-3  w-full"
                >
                  <div className="w-full bg-black/10 h-[80%] flex justify-center items-center rounded-md relative">
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <button className="p-2 rounded-md absolute top-0 right-2 cursor-pointer">
                            <MoreHorizontal className="w-5 h-5" />
                          </button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>File actions menu</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                    <div className="flex flex-col items-center text-sm font-bold">
                      <Fileicon type={file.type} />
                      {capitalizeFirstLetter(file.type)}
                    </div>
                  </div>
                  <div className="flex gap-3 items-center flex-wrap justify-center">
                    <div className="">
                      <h3 className="font-semibold text-sm truncate w-full">
                        {file.name}
                      </h3>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {file.size}
                        <span className="">.</span>
                        {capitalizeFirstLetter(file.type)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Recent files show here
            </p>
          )}
        </section>
      ) : (
        <Table>
          <FileTableHeader />
          <TableBody>
            {files.map((file) => (
              <FileTableRow key={file.id} file={file} />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
