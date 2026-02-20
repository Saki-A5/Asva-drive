"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { isWithinInterval, subDays, startOfDay } from "date-fns";

import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";
import Upload from "../components/Upload";
import Create from "../components/Create";
import FileTable from "../components/FileTable";
import SortFilters, { FilterState } from "../components/SortFilter";

import { FileItem } from "@/types/File";
import useCurrentUser from "@/hooks/useCurrentUser";

interface ApiRecentFile {
  _id: string;
  filename: string;
  isFolder: boolean;
  file?: {
    sizeBytes: number;
    mimeType: string;
    updatedAt: string;
    uploadedBy?: { name?: string; email?: string };
  };
  createdAt: string;
}

const Recent = () => {
  const { user } = useCurrentUser();
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    modified: "All",
    source: "All",
  });

  const fetchRecentFiles = async () => {
    try {
      setLoading(true);
      const res = await axios.get("/api/recent");
      const files = res.data?.data ?? [];

      const mapped: FileItem[] = files.map((f: ApiRecentFile) => ({
        id: f._id,
        name: f.filename,
        type: f.isFolder ? "folder" : f.file?.mimeType?.split("/")[0] || "file",
        author:
          f.file?.uploadedBy?.name || f.file?.uploadedBy?.email || "SCIENCES",
        size: f.file?.sizeBytes
          ? `${(f.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : "—",
        modified: f.file?.updatedAt
          ? new Date(f.file.updatedAt).toDateString()
          : new Date(f.createdAt).toDateString(),
        sharedUsers: [],
      }));

      setItems(mapped);

      // const mockItems = Array(4)
      //   .fill(mapped)
      //   .flat()
      //   .map((item, index) => ({
      //     ...item,
      //     id: `${item.id}-${index}`, // Ensure each ID is unique so React doesn't complain
      //     name: index > 2 ? `Copy of ${item.name} (${index})` : item.name,
      //   }));
      // setItems(mockItems);
    } catch (error) {
      console.error("Error fetching recent files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecentFiles();
  }, []);

  const filteredItems = items
    .filter((file) => {
      if (filters.type !== "All") {
        const typeMatch =
          file.type.toLowerCase() === filters.type.toLowerCase();
        if (!typeMatch) return false;
      }

      if (filters.modified !== "All") {
        if (file.modified === "—") return false;
        const fileDate = new Date(file.modified);
        const now = new Date();

        if (filters.modified === "Last 7 days") {
          if (fileDate < subDays(now, 7)) return false;
        } else if (filters.modified === "Last 14 days") {
          if (fileDate < subDays(now, 14)) return false;
        } else if (
          filters.modified === "Custom Range" &&
          filters.customRange?.from
        ) {
          const start = startOfDay(filters.customRange.from);
          // If end isn't picked yet, use start as the end to show files for that day
          const end = filters.customRange.to ? filters.customRange.to : start;

          if (!isWithinInterval(fileDate, { start, end })) {
            return false;
          }
        }
      }

      if (filters.source !== "All") {
        if (file.author !== filters.source) return false;
      }

      return true;
    })
    .slice(0, 10);

  return (
    <Sidenav>
      <Loginnav />
      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2 mt-2">
          <h1 className="font-bold text-xl whitespace-nowrap">Recent</h1>
          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === "admin" && <Upload />}
            <Create onCreateFolderClick={() => {}} />
          </div>
        </div>

        <SortFilters
          filters={filters}
          setFilters={setFilters}
        />

        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="text-gray-500">Loading recent files...</div>
          ) : (
            <div className="flex-1">
              <FileTable
                files={filteredItems}
                onDeleteClick={() => fetchRecentFiles()} // Refresh after action
                onRenameClick={() => fetchRecentFiles()}
              />
            </div>
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default Recent;
