"use client";

import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { useState, useEffect } from "react";
import React from "react";
import { on } from "events";

pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.js", import.meta.url).toString();

interface PdfViewerProps {
  url: string;
}

const PdfViewer: React.FC<PdfViewerProps> = ({ url }) => {
  const [numPages, setNumPages] = useState(0);
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

    useEffect(() => {
    if (!url) return;

    let isMounted = true;
    let blobUrl: string | null = null;

    const fetchPdf = async () => {
      try {
        setLoading(true)
        setError(null)

        const res = await fetch(url, {
          credentials: 'same-origin',
        });

        if (!res.ok) throw new Error('Failed to fetch PDF');

        const contentType = res.headers.get('Content-Type');
        console.log('Content-Type:', contentType);

        const blob = await res.blob();
        console.log('Blob size:', blob.size, 'Blob type:', blob.type);

        // ensure blob is a PDF
        const pdfBlob = new Blob([blob], { type: 'application/pdf' });
        blobUrl = URL.createObjectURL(pdfBlob);

        if (isMounted) {
          setPdfBlobUrl(blobUrl)
          setLoading(false)
        };
      } catch (err) {
        console.error("PDF fetch error:", err);
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load PDF');
          setLoading(false)
        }
      }
    };

    fetchPdf();

    return () => {
      isMounted = false;
      if (blobUrl) URL.revokeObjectURL(blobUrl);
    };
  }, [url]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    console.log("PDF loaded successfully. number of pages:", numPages);
    setNumPages(numPages);
    setError(null)
  }

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF.js load error:", error);
    setError(`Failed to render PDF: ${error.message}`);
  }

  if (loading) return <div className="p-4 text-center">Loading PDF...</div>;

  if (error) {return (
    <div className="p-4 text-center text-red-500">
      <p>Error loading PDF: {error}</p>
      <p className="text-sm mt-2">URL: {url}</p>
    </div>
  );}

  if (!pdfBlobUrl) return <div className="p-4 text-center">No PDF data available</div>;

  return (
    <div className="w-full overflow-auto">
      <Document
        file={pdfBlobUrl}
        onLoadSuccess={onDocumentLoadSuccess}
        onLoadError={onDocumentLoadError}
        loading={<div className="p-4 text-center">Loading document...</div>}
        error={<div className="p-4 text-center text-red-500">Failed to load document</div>}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            width={900}
            className="mb-6"
            loading={<div className="p-4">Loading page {i + 1}...</div>}
          />
        ))}
      </Document>
    </div>
  );
}

export default PdfViewer;
