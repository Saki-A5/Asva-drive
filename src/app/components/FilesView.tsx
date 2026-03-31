"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

import Sidenav from "@/app/components/Sidenav";
import Loginnav from "@/app/components/Loginnav";
import Upload from "@/app/components/Upload";
import Create from "@/app/components/Create";
import CreateFolder from "@/app/components/CreateFolder";
import FileTable from "@/app/components/FileTable";
import SortFilters, { FilterState } from "@/app/components/SortFilter";
import Floating from "@/app/components/Floating";
import Breadcrumbs from "@/app/components/Breadcrumbs";

import useCurrentUser from "@/hooks/useCurrentUser";
import { FileItem } from "@/types/File";
import { subDays } from "date-fns";

interface FilesViewProps {
  folderId?: string;
  /**
   * Set to true when this view is reached from a college route.
   * Hides upload/create/delete/rename and shows "Save to My Files" instead.
   */
  isCollegeView?: boolean;
}

interface ApiItem {
  _id: string;
  filename: string;
  isFolder: boolean;
  ownerId: string;
  file?: {
    sizeBytes: number;
    mimeType: string;
    updatedAt: string;
    uploadedBy?: { email?: string; name?: string };
  };
}

function mapApiItem(item: ApiItem): FileItem {
  if (item.isFolder) {
    return {
      id: item._id,
      name: item.filename,
      type: "folder",
      author: "_",
      size: "—",
      modified: "—",
      sharedUsers: [],
    };
  }
  return {
    id: item._id,
    name: item.filename,
    type: item.file?.mimeType.split("/")[0] ?? "file",
    author:
      item.file?.uploadedBy?.name ?? item.file?.uploadedBy?.email ?? "SMS",
    size: item.file?.sizeBytes
      ? `${(item.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
      : "—",
    modified: item.file?.updatedAt
      ? new Date(item.file.updatedAt).toDateString()
      : "—",
    sharedUsers: [],
  };
}

const FilesView = ({ folderId, isCollegeView = false }: FilesViewProps) => {
  const router = useRouter();
  const { user } = useCurrentUser();

  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [page, setPage] = useState(1);

  const [creating, setCreating] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);

  const [filters, setFilters] = useState<FilterState>({
    type: "All",
    modified: "All",
    source: "All",
  });

  const handleLoadMore = useCallback(() => {
    if (hasMore && !loadingMore) setPage((p) => p + 1);
  }, [hasMore, loadingMore]);

  //  Fetch a single page

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);

        const url = folderId
          ? `/api/file/folder/${folderId}`
          : `/api/file?page=${pageNum}`;

        const res = await axios.get(url);

        const rawData: ApiItem[] = folderId ? res.data.contents : res.data.data;

        const crumbs = res.data.breadcrumbs ?? [];
        const name = res.data.folderName ?? null;
        const pagination = res.data.pagination;

        const mapped = rawData.map(mapApiItem);

        setItems((prev) => (replace ? mapped : [...prev, ...mapped]));
        setBreadcrumbs(crumbs);
        setFolderName(name);
        setHasMore(!folderId && (pagination?.hasMore ?? false));
      } catch (err) {
        console.error("Fetch files failed:", err);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    [folderId],
  );

  //  Initial load / folder change ─

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    fetchPage(1, true);
  }, [folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  //  Load more ─

  useEffect(() => {
    if (page === 1) return;
    fetchPage(page, false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  //  Create folder ─

  const handleCreateFolder = async (name: string) => {
    if (!name || !user) return;
    try {
      setCreating(true);
      await axios.post("/api/file/folder", {
        folderName: name,
        parentFolderId: folderId ?? null,
      });
      setShowCreateFolder(false);
      setItems([]);
      setPage(1);
      fetchPage(1, true);
    } catch (err) {
      console.error("Create folder failed:", err);
    } finally {
      setCreating(false);
    }
  };

  //  Delete

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;
    setItems((prev) => prev.filter((f) => f.id !== item.id));
    try {
      await axios.delete(`/api/file/${item.id}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
      fetchPage(1, true);
    }
  };

  //  Rename

  const handleRename = async (item: FileItem) => {
    const newName = prompt("Enter new name:", item.name);
    if (!newName || newName === item.name) return;
    try {
      await axios.post(`/api/file/${item.id}/rename`, { filename: newName });
      setItems((prev) =>
        prev.map((f) => (f.id === item.id ? { ...f, name: newName } : f)),
      );
    } catch (error) {
      console.error("Error renaming file:", error);
      alert("Failed to rename file");
    }
  };

  //  Filter

  const filteredItems = items.filter((file) => {
    if (filters.type !== "All") {
      if (file.type.toLowerCase() !== filters.type.toLowerCase()) return false;
    }
    if (filters.modified !== "All") {
      if (file.modified === "—") return false;
      const fileDate = new Date(file.modified);
      const now = new Date();
      if (filters.modified === "Last 7 days" && fileDate < subDays(now, 7))
        return false;
      if (filters.modified === "Last 14 days" && fileDate < subDays(now, 14))
        return false;
    }
    if (filters.source !== "All") {
      if (file.author !== filters.source) return false;
    }
    return true;
  });

  // const handleOpen = (item: FileItem) => {
  //   if (item.type === "folder") {
  //     router.push(`/files/${item.id}`);
  //   } else {
  //     // open preview, download, etc.
  //   }
  // };

  //  Render

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        {folderId && breadcrumbs.length > 0 && (
          <Breadcrumbs folders={breadcrumbs} />
        )}

        {/* Header */}
        <div className="flex-between gap-2 mt-2">
          <h1 className="font-bold text-xl whitespace-nowrap">
            {folderName ?? (isCollegeView ? "College Files" : "My Files")}
          </h1>

          {/* Upload / Create — hidden in college view */}
          {!isCollegeView && (
            <div className="hidden sm:flex space-x-2 gap-y-2">
              {user?.role === "admin" && (
                <Upload
                  folderId={folderId}
                  onUploadComplete={() => fetchPage(1, true)}
                />
              )}
              <Create
                onCreateFolderClick={() => setShowCreateFolder(true)}
                creating={creating}
              />
            </div>
          )}

          {!isCollegeView && <Floating />}
        </div>

        <SortFilters
          filters={filters}
          setFilters={setFilters}
        />

        {/* Create Folder Input — hidden in college view */}
        {!isCollegeView && showCreateFolder && (
          <div className="mt-4">
            <CreateFolder
              parentFolderId={folderId ?? null}
              onCreate={handleCreateFolder}
              onCancel={() => setShowCreateFolder(false)}
              creating={creating}
            />
          </div>
        )}

        {/* File Table */}
        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {Array.from({ length: 24 }).map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse rounded-xl bg-gray-100 h-28"
                />
              ))}
            </div>
          ) : (
            <>
              <FileTable
                files={filteredItems}
                // In college view: no delete/rename, but show "Save to My Files"
                onDeleteClick={isCollegeView ? undefined : handleDelete}
                onRenameClick={
                  !isCollegeView && user?.role === "admin"
                    ? handleRename
                    : undefined
                }
                isCollegeView={isCollegeView}
                hasMore={hasMore}
                loadingMore={loadingMore}
                onLoadMore={handleLoadMore}
              />
            </>
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default FilesView;
