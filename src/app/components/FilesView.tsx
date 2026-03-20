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

const FilesView = ({ folderId }: FilesViewProps) => {
  const { user } = useCurrentUser();

  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true); // initial load
  const [loadingMore, setLoadingMore] = useState(false); // subsequent pages
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

  // Sentinel div at the bottom — IntersectionObserver triggers loadMore
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // ── Fetch a single page ────────────────────────────────────────────────────

  const fetchPage = useCallback(
    async (pageNum: number, replace: boolean) => {
      try {
        if (replace) setLoading(true);
        else setLoadingMore(true);

        // Folder contents don't use the paginated root route
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

        // Only the root file list is paginated
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

  // ── Initial load / folder change ───────────────────────────────────────────

  useEffect(() => {
    setItems([]);
    setPage(1);
    setHasMore(false);
    fetchPage(1, true);
  }, [folderId]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load more (triggered by page state change, not page 1) ────────────────

  useEffect(() => {
    if (page === 1) return; // initial load handled above
    fetchPage(page, false);
  }, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── IntersectionObserver — auto-load when sentinel scrolls into view ───────

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          setPage((p) => p + 1);
        }
      },
      { rootMargin: "200px" }, // start loading 200px before reaching bottom
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore]);

  // ── Create folder ──────────────────────────────────────────────────────────

  const handleCreateFolder = async (name: string) => {
    if (!name || !user) return;
    try {
      setCreating(true);
      await axios.post("/api/file/folder", {
        folderName: name,
        parentFolderId: folderId ?? null,
      });
      setShowCreateFolder(false);
      // Reset and reload from page 1
      setItems([]);
      setPage(1);
      fetchPage(1, true);
    } catch (err) {
      console.error("Create folder failed:", err);
    } finally {
      setCreating(false);
    }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────

  const handleDelete = async (item: FileItem) => {
    if (!confirm(`Are you sure you want to delete ${item.name}?`)) return;

    // Optimistic remove
    setItems((prev) => prev.filter((f) => f.id !== item.id));

    try {
      await axios.delete(`/api/file/${item.id}`);
    } catch (error) {
      console.error("Error deleting file:", error);
      alert("Failed to delete file");
      // Reload to restore correct state
      fetchPage(1, true);
    }
  };

  // ── Rename ─────────────────────────────────────────────────────────────────

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

  // ── Filter (client-side on already-loaded items) ───────────────────────────

  const filteredItems = items.filter((file) => {
    if (filters.type !== "All") {
      const typeMatch = file.type.toLowerCase() === filters.type.toLowerCase();
      if (!typeMatch) return false;
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

  // ── Render ─────────────────────────────────────────────────────────────────

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
            {folderName ?? "My Files"}
          </h1>

          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === "admin" && <Upload folderId={folderId} onUploadComplete={() => fetchPage(1, true)}/>}
            <Create
              onCreateFolderClick={() => setShowCreateFolder(true)}
              creating={creating}
            />
          </div>

          <Floating />
        </div>

        <SortFilters
          filters={filters}
          setFilters={setFilters}
        />

        {/* Create Folder Input */}
        {showCreateFolder && (
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
            // ── Initial skeleton ──────────────────────────────────────────────
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
                onDeleteClick={handleDelete}
                onRenameClick={user?.role === "admin" ? handleRename : undefined}
              />

              {/* ── Load-more area ─────────────────────────────────────────── */}
              {hasMore && (
                <div
                  ref={sentinelRef}
                  className="flex flex-col items-center gap-3 py-4">
                  {loadingMore ? (
                    // Loading more skeleton — 16 items to match next page size
                    <div className="w-full grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
                      {Array.from({ length: 16 }).map((_, i) => (
                        <div
                          key={i}
                          className="animate-pulse rounded-xl bg-gray-100 h-28"
                        />
                      ))}
                    </div>
                  ) : (
                    // Fallback manual button (shown briefly before observer fires)
                    <button
                      onClick={() => setPage((p) => p + 1)}
                      className="px-6 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors">
                      Load more files
                    </button>
                  )}
                </div>
              )}

              {/* End-of-list message */}
              {!hasMore && items.length > 0 && (
                <p className="text-center text-xs text-gray-400 py-4">
                  All {items.length} file{items.length !== 1 ? "s" : ""} loaded
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default FilesView;