"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import * as mammoth from "mammoth";
import axios from "axios";

const PdfViewer = dynamic(() => import("@/app/components/PdfViewer"), {
  ssr: false,
});

interface FileViewerProps {
  url: string;
  fileType: string;
  fileName: string;
}

const FileViewer: React.FC<FileViewerProps> = ({ url, fileType, fileName }) => {
  const [content, setContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper function to get file extension
  const getFileExtension = (name: string): string => {
    return name.split(".").pop()?.toLowerCase() || "";
  };

  // Helper function to determine if file is a specific type
  const isFileType = (
    type: string,
    typeStartsWith: string,
    extensions?: string[]
  ): boolean => {
    const matches = type.toLowerCase().includes(typeStartsWith.toLowerCase());
    if (!matches && extensions) {
      const ext = getFileExtension(fileName);
      return extensions.includes(ext);
    }
    return matches;
  };

  // Determine actual file type (handles misclassified files)
  const getActualFileType = (): string => {
    const lowerType = fileType.toLowerCase();
    const ext = getFileExtension(fileName).toLowerCase();

    // PDF
    if (lowerType.includes("pdf") || ext === "pdf") return "pdf";

    // Images
    if (
      lowerType.includes("image") ||
      ["jpg", "jpeg", "png", "gif", "webp", "bmp", "svg"].includes(ext)
    )
      return "image";

    // Videos
    if (
      lowerType.includes("video") ||
      ["mp4", "avi", "mov", "wmv", "flv", "mkv", "webm"].includes(ext)
    )
      return "video";

    // Audio
    if (
      lowerType.includes("audio") ||
      ["mp3", "wav", "aac", "flac", "ogg", "m4a"].includes(ext)
    )
      return "audio";

    // Word documents
    if (
      lowerType.includes("word") ||
      lowerType.includes("officedocument") ||
      ["doc", "docx"].includes(ext)
    )
      return "word";

    // Text files
    if (
      lowerType.includes("text") ||
      lowerType.includes("plain") ||
      ["txt", "md", "log", "csv"].includes(ext)
    )
      return "text";

    return "unknown";
  };

  // Load file content for text-based files
  useEffect(() => {
    const loadContent = async () => {
      try {
        setLoading(true);
        setError(null);

        const actualType = getActualFileType();

        if (actualType === "text") {
          const response = await axios.get(url);
          setContent(response.data);
        } else if (actualType === "word") {
          const response = await axios.get(url, {
            responseType: "arraybuffer",
          });
          const result = await mammoth.extractRawText({
            arrayBuffer: response.data,
          });
          setContent(result.value);
        }

        setLoading(false);
      } catch (err) {
        console.error("Error loading file content:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load file content"
        );
        setLoading(false);
      }
    };

    loadContent();
  }, [url, fileType, fileName]);

  const actualType = getActualFileType();

  // Render different previews based on file type
  if (loading && (actualType === "text" || actualType === "word")) {
    return (
      <div className="p-4 text-center text-gray-500">Loading content...</div>
    );
  }

  if (error && (actualType === "text" || actualType === "word")) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }

  switch (actualType) {
    case "pdf":
      return <PdfViewer url={url} />;

    case "image":
      return (
        <div className="flex items-center justify-center w-full h-full">
          <img
            src={url}
            alt={fileName}
            className="max-w-full max-h-full object-contain"
          />
        </div>
      );

    case "video":
      return (
        <div className="flex items-center justify-center w-full h-full">
          <video controls className="max-w-full max-h-full">
            <source src={url} type={fileType} />
            Your browser does not support the video tag.
          </video>
        </div>
      );

    case "audio":
      return (
        <div className="flex flex-col items-center justify-center w-full h-full gap-4">
          <div className="text-gray-400">🎵 Audio File</div>
          <audio src={url} controls className="w-full max-w-md" />
        </div>
      );

    case "text":
      return content ? (
        <pre className="w-full h-full overflow-auto p-6 text-sm font-mono bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 whitespace-pre-wrap break-words">
          {content}
        </pre>
      ) : (
        <div className="p-4 text-center text-gray-500">No content to display</div>
      );

    case "word":
      return content ? (
        <div className="w-full h-full overflow-auto p-6 bg-white dark:bg-zinc-800 text-gray-800 dark:text-gray-200 prose prose-sm dark:prose-invert max-w-none">
          <pre className="text-sm font-mono whitespace-pre-wrap break-words">
            {content}
          </pre>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">No content to display</div>
      );

    default:
      return (
        <div className="p-4 text-center text-gray-400">
          <p>No preview available for this file type</p>
          <p className="text-xs mt-2">({fileType})</p>
        </div>
      );
  }
};

export default FileViewer;
