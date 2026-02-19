"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Breadcrumbs from "@/app/components/Breadcrumbs";
import { FileItem } from "@/types/File";
import { Download, Star, Trash2 } from "lucide-react";
import AuthorCell from "@/app/components/AuthorCell";
import Fileicon from "@/app/components/Fileicon";
import { Button } from "@/components/ui/button";
import axios from "axios";
import * as mammoth from "mammoth";
import dynamic from "next/dynamic";
const PdfViewer = dynamic(() => import("@/app/components/PdfViewer"), {
  ssr: false,
});

const FilePage = () => {
  const { id } = useParams();
  const router = useRouter();

  const [fileData, setFileData] = useState<
    | (FileItem & {
        signedUrl: string;
        folderPath?: { _id: string; filename: string }[];
      })
    | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [fileContent, setFileContent] = useState<string | null>(null);

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

        // Load file contents for text/Word
        const type = fileItem.file.resourceType;

        if (type.startsWith("text")) {
          const raw = await axios.get(data.signedUrl);
          setFileContent(raw.data);
        } else if (type.includes("word") || type.includes("officedocument")) {
          // fetch arraybuffer for docx
          const resp = await axios.get(data.signedUrl, {
            responseType: "arraybuffer",
          });
          const result = await mammoth.extractRawText({
            arrayBuffer: resp.data,
          });
          setFileContent(result.value);
        }

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

  const renderPreview = () => {
    console.log("file type: ", type);
    console.log("Signed Url: ", signedUrl);
    if (type.startsWith("image")) {
      return (
        <img
          src={signedUrl}
          alt={name}
          className="w-full max-h-96 object-contain rounded-lg"
        />
      );
    }
    if (type.startsWith("video")) {
      return (
        <video controls className="w-full max-h-96 rounded-lg">
          <source src={signedUrl} type={type} />
          Your browser does not support the video tag.
        </video>
      );
    }
    if (type.startsWith("audio")) {
      return <audio src={signedUrl} controls className="w-full mt-2" />;
    }
    if (
      type.startsWith("text") ||
      type.includes("word") ||
      type.includes("officedocument")
    ) {
      return fileContent ? (
        <pre className="w-full max-h-96 overflow-auto rounded-lg bg-gray-50 p-4 text-sm font-mono">
          {fileContent}
        </pre>
      ) : (
        <div>Loading content...</div>
      );
    }
    if (
      type === "application/pdf" ||
      (type === "raw" && name?.toLowerCase().endsWith(".pdf"))
    ) {
      return <PdfViewer url={signedUrl} />;
    }
    return (
      <div className="p-4 text-muted-foreground text-center">
        No preview available for this file type
      </div>
    );
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
    // <div className="p-6 md:p-6 flex">
    //   <div className="lg:w-[30%]">
    //     {folderPath && folderPath.length > 0 && (
    //       <Breadcrumbs folders={folderPath} />
    //     )}

    //     {/* file header */}
    //     <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
    //       <div className="flex items-center gap-4">
    //         <Fileicon type={type} isSheetPage={false} />
    //         <h1 className="text-2xl truncate max-w-[300px] font-semibold">
    //           {name}
    //         </h1>
    //       </div>
    //       <div className="flex items-center gap-3 mt-4 md:mt-0">
    //         <Button
    //           onClick={() => window.open(signedUrl)}
    //           variant="outline"
    //           size="sm"
    //         >
    //           <Download className="mr-2 h-4 w-4" />
    //           Download
    //         </Button>
    //         <Button variant="outline" size="sm">
    //           <Star className="mr-2 h-4 w-4" />
    //           Favorite
    //         </Button>
    //         <Button
    //           variant="destructive"
    //           size="sm"
    //           onClick={async () => {
    //             try {
    //               await axios.delete(`/api/file/${id}`);
    //               router.push("/files");
    //             } catch (err: any) {
    //               console.error(err);
    //               alert(err.response?.data?.message || "Failed to delete file");
    //             }
    //           }}
    //         >
    //           <Trash2 className="mr-2 h-4 w-4" />
    //           Delete
    //         </Button>
    //       </div>
    //     </div>

    //     {/* file details */}
    //     <div className="flex flex-col md:flex-row gap-6 mt-3 text-sm text-muted-foreground">
    //       <div>
    //         <strong>Author:</strong> <AuthorCell author={author} />
    //       </div>
    //       <div>
    //         <strong>Size:</strong> {size}
    //       </div>
    //       <div>
    //         <strong>Last Modified:</strong> {modified}
    //       </div>
    //     </div>
    //   </div>

    //   <div className="lg:w-[70%]">
    //     {/* file preview */}
    //     <div className="mt-6">{renderPreview()}</div>
    //   </div>
    // </div>

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
                <Fileicon type={type} isSheetPage={false} className="w-8 h-8" />
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
              Download PDF
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
              {renderPreview()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilePage;
