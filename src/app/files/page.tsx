"use client";
import { useState } from "react";
import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";
import Upload from "../components/Upload";
import Create from "../components/Create";
import FileTable from "../components/FileTable";
import FileSorting from "../components/FileSorting";
import { sortByName, sortByModified, sortBySize } from "@/lib/fileSorting";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";

const Files = () => {
  const initialFiles = [
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

  const [files, setFiles] = useState(initialFiles);
  const [sortKey, setSortKey] = useState<"name" | "size" | "modified" | null>(
    null
  );
  const [ascending, setAscending] = useState(true);

  const handleSort = (key: "name" | "size" | "modified") => {
    let nextAscending = true;
    if (sortKey === key) {
      nextAscending = !ascending;
      setAscending(nextAscending);
    } else {
      setSortKey(key);
      setAscending(true);
      nextAscending = true;
    }

    let sorted = files;
    if (key === "name") sorted = sortByName(files as any, nextAscending) as any;
    if (key === "size") sorted = sortBySize(files as any, nextAscending) as any;
    if (key === "modified")
      sorted = sortByModified(files as any, nextAscending) as any;

    setFiles(sorted);
  };

  return (
    <Sidenav>
      <Loginnav />
      <div>
        <div className="flex-between">
          <h1 className="px-6 font-bold text-xl">My Files</h1>
          <div className="flex space-x-2">
            <Upload />
            <Create />
          </div>
        </div>
        <div className="px-2 my-6">
          <FileSorting
            files={files}
            sortKey={sortKey}
            ascending={ascending}
            onRequestSort={handleSort}
          />
        </div>
        <SortFilters />
        <div className="px-6 space-y-8">
          <div>
            <FileTable
              files={files}
              onSortClick={handleSort}
              sortKey={sortKey}
              ascending={ascending}
            />
          </div>
        </div>
      </div>
    </Sidenav>
  );
};
export default Files;

const SortFilters = () => {
  const sortType: string[] = ["Type", "Modified", "Source", "Shared"];

  return (
    <div className="px-6 my-6 flex gap-2">
      {sortType.map((type) => (
        <Button variant="outline" key={type} className="cursor-pointer">
          <span className="flex gap-2">
            <span className="pl-1">{type}</span>
            <span className="flex items-center">
              <ChevronDown className="h-6 w-6" />
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
};
