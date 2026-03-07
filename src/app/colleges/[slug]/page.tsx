"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { useParams, useRouter } from "next/navigation";
import { COLLEGE_META } from "@/lib/college";
import FileTable from "@/app/components/FileTable";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { FileItem } from "@/types/File";

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

const getFileIconType = (item: ApiItem) => {
  if (item.isFolder) return "folder";
  if (item.file?.mimeType) {
    const [type, subtype] = item.file.mimeType.split("/");
    if (type === "image") return "image";
    if (type === "video") return "video";
    if (type === "audio") return "audio";
    return subtype;
  }
  const ext = item.filename.split(".").pop()?.toLowerCase();
  if (!ext) return "file";
  if (["pdf"].includes(ext)) return "pdf";
  if (["doc", "docx"].includes(ext)) return "doc";
  if (["xls", "xlsx"].includes(ext)) return "sheet";
  if (["ppt", "pptx"].includes(ext)) return "ppt";
  if (["jpg", "jpeg", "png", "gif"].includes(ext)) return "image";
  if (["mp4", "mov", "avi"].includes(ext)) return "video";
  if (["mp3", "wav"].includes(ext)) return "audio";
  return "file";
};

const CollegeFiles = () => {
  const params = useParams();
  const router = useRouter();

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  const collegeId = Object.entries(COLLEGE_META).find(
    ([, meta]) => meta.slug === slug
  )?.[0];

  // Track which folder we're currently inside (null = root)
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [breadcrumbs, setBreadcrumbs] = useState<{ _id: string; filename: string }[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContents = async (folderId: string | null) => {
    if (!collegeId) return;
    setLoading(true);
    try {
      let data: ApiItem[];
      let crumbs: { _id: string; filename: string }[] = [];
      let name: string | null = null;

      if (folderId) {
        // Reuse the existing folder endpoint — same one "My Files" uses
        const res = await axios.get(`/api/file/folder/${folderId}`);
        data = res.data.contents;
        crumbs = res.data.breadcrumbs ?? [];
        name = res.data.folderName ?? null;
      } else {
        // Root of this college — fetch from the college tree endpoint
        const res = await axios.get(`/api/colleges/${collegeId}/tree`);
        // The tree endpoint returns nested nodes; we only want the top level
        // (children are fetched on demand via the folder endpoint above)
        data = res.data.tree;
        crumbs = [];
        name = null;
      }

      const mapped: FileItem[] = (data as ApiItem[]).map((item) => ({
        id: item._id,
        name: item.filename,
        type: getFileIconType(item),
        author:
          item.file?.uploadedBy?.name ??
          item.file?.uploadedBy?.email ??
          "—",
        size: item.file?.sizeBytes
          ? `${(item.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
          : "—",
        modified: item.file?.updatedAt
          ? new Date(item.file.updatedAt).toDateString()
          : "—",
        sharedUsers: [],
      }));

      setItems(mapped);
      setBreadcrumbs(crumbs);
      setFolderName(name);
    } catch (err) {
      console.error("Error fetching college files:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContents(currentFolderId);
  }, [currentFolderId, collegeId]);

  const handleFolderClick = (item: FileItem) => {
    setCurrentFolderId(item.id);
  };

  const handleFileClick = (item: FileItem) => {
    router.push(`/file/${item.id}`);
  };

  const collegeName =
    collegeId
      ? COLLEGE_META[collegeId as keyof typeof COLLEGE_META]?.label
      : slug;

  return (
    <div className="px-6 py-4 flex flex-col flex-1 min-h-0">
      {/* Breadcrumbs — show only when inside a subfolder */}
      {currentFolderId && breadcrumbs.length > 0 && (
        <Breadcrumbs folders={breadcrumbs} />
      )}

      {/* Back button when inside a subfolder */}
      {currentFolderId && (
        <button
          onClick={() => {
            // Go up one level using the breadcrumb trail
            const parent = breadcrumbs[breadcrumbs.length - 2];
            setCurrentFolderId(parent?._id ?? null);
          }}
          className="text-sm text-blue-600 hover:underline mb-2 self-start"
        >
          ← Back
        </button>
      )}

      <h1 className="font-bold text-xl mb-4">
        {folderName ?? `${collegeName} Files`}
      </h1>

      {loading ? (
        <div className="text-gray-500">Loading files...</div>
      ) : (
        <FileTable
          files={items}
          onOpen={(item) => {
            if (item.type === "folder") {
              setCurrentFolderId(item.id);
            } else {
              router.push(`/file/${item.id}`);
            }
          }}
          // Read-only — no delete or rename in the college view
          onDeleteClick={undefined}
          onRenameClick={undefined}
        />
      )}
    </div>
  );
};

export default CollegeFiles;