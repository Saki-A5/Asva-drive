"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useEffect } from "react";
import React from "react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState(0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);

    useEffect(() => {
    if (!url) return;

    let isMounted = true;
    let blobUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error('Failed to fetch PDF');
        const blob = await res.blob();
        blobUrl = URL.createObjectURL(blob);
        if (isMounted) setPdfBlobUrl(blobUrl);
      } catch (err) {
        console.error(err);
      }
    };

    fetchPdf();

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);
  if (!pdfBlobUrl) return <div>Loading PDF...</div>;

  return (
    <div className="w-full overflow-auto">
      <Document
        file={pdfBlobUrl}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={900}
            className="mb-6"
          />
        ))}
      </Document>
    </div>
  );
}

export default PdfViewer;
