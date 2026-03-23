"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { FileItem } from "@/types/File";
import { Download, Star, Trash2, Pencil } from "lucide-react";
import AuthorCell from "@/app/components/AuthorCell";
import Fileicon from "@/app/components/Fileicon";
import { Button } from "@/components/ui/button";
import axios from "axios";
import useCurrentUser from "@/hooks/useCurrentUser";
import FileViewer from "@/app/components/FileViewer";

const FilePage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useCurrentUser();

  const [fileData, setFileData] = useState<
    | (FileItem & {
        signedUrl: string;
        folderPath?: { _id: string; filename: string }[];
      })
    | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFile = async () => {
      try {
        const { data } = await axios.get(`/api/file/${id}`);
        if (!data || !data.fileItem) {
          setError(data.message || "File not found");
          setLoading(false);
          return;
        }
        const fileItem = data.fileItem;
        setFileData({
          id: fileItem._id,
          name: fileItem.file.filename,
          type: fileItem.file.resourceType,
          author: fileItem.file.author,
          size: fileItem.file.size,
          modified: fileItem.file.modified,
          sharedUsers: [],
          signedUrl:
            fileItem.file.resourceType === "raw" &&
            fileItem.file.filename?.toLowerCase().endsWith(".pdf")
              ? `/api/file/${id}/pdf`
              : data.signedUrl,
          folderPath: fileItem.folderPath || [],
        });
        console.log("fileItem.file: ", fileItem.file);
        setLoading(false);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || "Failed to fetch file");
        setLoading(false);
      }
    };

    if (id) fetchFile();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="p-4 text-red-600">{error}</div>;
  if (!fileData) return <div className="p-4">File not found</div>;

  const { signedUrl, name, author, size, modified, folderPath, type } =
    fileData;

  const handleRename = async () => {
    if (!fileData) return;

    const newName = prompt("Enter new name:", fileData.name);
    if (!newName || newName === fileData.name) return;

    try {
      await axios.post(`/api/file/${id}/rename`, { filename: newName });
      // Update the file data with the new name
      setFileData((prev) => (prev ? { ...prev, name: newName } : null));
    } catch (err: any) {
      console.error(err);
      alert(
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Failed to rename file"
      );
    }
  };

  function DetailItem({
    label,
    value,
  }: {
    label: string;
    value: React.ReactNode;
  }) {
    return (
      <div className="flex items-center justify-between py-1 border-b border-gray-50 dark:border-zinc-900/50 last:border-0">
        <span className="text-sm font-medium text-gray-400 dark:text-zinc-500">
          {label}
        </span>
        <span className="text-sm font-semibold text-gray-700 dark:text-zinc-300">
          {value}
        </span>
      </div>
    );
  }

  return (
    <div className="flex w-full items-center justify-center h-screen lg:p-20">
      <div className="flex flex-col md:flex-row h-[85vh] w-full mx-auto overflow-hidden bg-[#E5E7EB] dark:bg-zinc-900 rounded-xl shadow-2xl border border-gray-300 dark:border-zinc-800 transition-colors duration-300">
        {/* LEFT PANEL: File Info (35%) */}
        <div className="w-full md:w-[35%] bg-white dark:bg-zinc-950 p-8 flex flex-col justify-between border-r border-gray-200 dark:border-zinc-800">
          <div>
            {/* Breadcrumbs */}
            {folderPath && folderPath.length > 0 && (
              <div className="mb-6 opacity-60 hover:opacity-100 dark:text-zinc-400 transition-opacity">
                <Breadcrumbs folders={folderPath} />
              </div>
            )}

            {/* Header with Icon and Name */}
            <div className="flex items-center gap-4 mb-10">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-2xl shadow-sm">
                <Fileicon
                  type={type}
                  isSheetPage={false}
                  className="w-8 h-8"
                />
              </div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-zinc-100 truncate tracking-tight">
                {name}
              </h1>
            </div>

            {/* File Details List */}
            <div className="space-y-6">
              <h3 className="text-xs font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-widest">
                File Information
              </h3>

              <div className="space-y-4">
                <DetailItem
                  label="Author"
                  value={<AuthorCell author={author} />}
                />
                <DetailItem label="Size" value={size} />
                <DetailItem label="Modified" value={modified} />
              </div>
            </div>
          </div>

          {/* Action Buttons at the bottom */}
          <div className="mt-8 space-y-3">
            <Button
              onClick={() => window.open(signedUrl)}
              className="w-full py-6 text-base font-semibold bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-xl shadow-md transition-all active:scale-95"
            >
              <Download className="mr-2 h-5 w-5" />
              Download File
            </Button>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1 py-5 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
              >
                <Star className="mr-2 h-4 w-4" />
                Favorite
              </Button>
              {user?.role === "admin" && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 py-5 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400 hover:bg-gray-50 dark:hover:bg-zinc-900"
                    onClick={handleRename}
                  >
                    <Pencil className="mr-2 h-4 w-4" />
                    Rename
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="px-4 py-5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600"
                    onClick={async () => {
                      if (confirm("Are you sure you want to delete this?")) {
                        try {
                          await axios.delete(`/api/file/${id}`);
                          router.push("/files");
                        } catch (err: any) {
                          console.error(err);
                        }
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Preview (65%) */}
        <div className="w-full md:w-[65%] bg-[#F3F4F6] dark:bg-zinc-900 p-8 flex items-center justify-center overflow-y-auto relative">
          <div className="absolute top-4 right-6 text-[10px] font-bold text-gray-400 dark:text-zinc-600 uppercase tracking-widest">
            Preview Mode
          </div>

          <div className="w-full max-w-[90%] transition-transform hover:scale-[1.01]">
            {/* The container for the actual PDF/Content */}
            <div className="bg-white dark:bg-zinc-800 shadow-[0_20px_50px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.4)] rounded-sm overflow-hidden">
              <FileViewer url={signedUrl} fileType={type} fileName={name} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePage;