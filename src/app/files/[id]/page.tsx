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
          fileItem.file.resourceType === "application/pdf"
          ? `/api/file/${id}/pdf`
          : data.signedUrl,
          folderPath: fileItem.folderPath || [],
        });
        console.log("fileItem.file: ", fileItem.file)

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
    console.log("file type: ", type)
    console.log("Signed Url: ", signedUrl)
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
        <video
          controls
          className="w-full max-h-96 rounded-lg">
          <source
            src={signedUrl}
            type={type}
          />
          Your browser does not support the video tag.
        </video>
      );
    }
    if (type.startsWith("audio")) {
      return (
        <audio
          src={signedUrl}
          controls
          className="w-full mt-2"
        />
      );
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
    if (type === "application/pdf" || type==="raw" && name?.toLowerCase().endsWith(".pdf")) {
      return <PdfViewer url={signedUrl} />;
    }
    return (
      <div className="p-4 text-muted-foreground text-center text-gray-500">
        No preview available for this file type
      </div>
    );
  };

  return (
    <div className="p-6 md:p-6">
      {folderPath && folderPath.length > 0 && (
        <Breadcrumbs folders={folderPath} />
      )}

      {/* file header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mt-4">
        <div className="flex items-center gap-4">
          <Fileicon
            type={type}
            isSheetPage={false}
          />
          <h1 className="text-2xl truncate max-w-[300px] font-semibold">
            {name}
          </h1>
        </div>
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <Button
            onClick={() => window.open(signedUrl)}
            variant="outline"
            size="sm">
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button
            variant="outline"
            size="sm">
            <Star className="mr-2 h-4 w-4" />
            Favorite
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={async () => {
              try {
                await axios.delete(`/api/file/${id}`);
                router.push("/files");
              } catch (err: any) {
                console.error(err);
                alert(err.response?.data?.message || "Failed to delete file");
              }
            }}>
            <Trash2 className="mr-2 h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>

      {/* file details */}
      <div className="flex flex-col md:flex-row gap-6 mt-3 text-sm text-muted-foreground">
        <div>
          <strong>Author:</strong> <AuthorCell author={author} />
        </div>
        <div>
          <strong>Size:</strong> {size}
        </div>
        <div>
          <strong>Last Modified:</strong> {modified}
        </div>
      </div>

      {/* file preview */}
      <div className="mt-6">{renderPreview()}</div>
    </div>
  );
};

export default FilePage;
