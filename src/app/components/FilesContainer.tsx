"use client";

import { useState, useMemo } from "react";
import FileSorting from "./FileSorting";
import FileTable from "./FileTable";

export default function FileContainer() {
  const [sortKey, setSortKey] = useState<"name" | "size" | "modified" | null>(
    null
  );
  const [ascending, setAscending] = useState(true);

  const initialFiles = [
    {
      id: "111222",
      name: "Past Questions",
      size: "1.2GB",
      modified: "Jun 12, 2025",
    },
    { id: "222333", name: "C#/C++", size: "2.7GB", modified: "Oct 12, 2025" },
    { id: "333444", name: "MATLAB", size: "5.2GB", modified: "Jan 12, 2026" },
    {
      id: "444555",
      name: "Previous Work",
      size: "1.0GB",
      modified: "Nov 8, 2025",
    },
    {
      id: "555666",
      name: "AutoCAD Workbook",
      size: "320MB",
      modified: "Yesterday",
    },
    { id: "666777", name: "Python", size: "1.2GB", modified: "Apr 27, 2025" },
  ];

  const parseSize = (val: string): number => {
    const num = parseFloat(val);
    if (val.includes("GB")) return num * 1024 * 1024 * 1024;
    if (val.includes("MB")) return num * 1024 * 1024;
    return num;
  };

  const parseModified = (val: string): number => {
    if (val === "Yesterday") return Date.now() - 24 * 60 * 60 * 1000;
    return new Date(val).getTime();
  };

  const sortedFiles = useMemo(() => {
    if (!sortKey) return initialFiles;

    return [...initialFiles].sort((a, b) => {
      let v1: any = a[sortKey];
      let v2: any = b[sortKey];

      if (sortKey === "size") {
        v1 = parseSize(v1);
        v2 = parseSize(v2);
      }

      if (sortKey === "modified") {
        v1 = parseModified(v1);
        v2 = parseModified(v2);
      }

      if (v1 < v2) return ascending ? -1 : 1;
      if (v1 > v2) return ascending ? 1 : -1;
      return 0;
    });
  }, [sortKey, ascending]);

  const handleSort = (key: "name" | "size" | "modified") => {
    if (sortKey === key) {
      setAscending((prev) => !prev);
    } else {
      setSortKey(key);
      setAscending(true);
    }
  };

  return (
    <div className="space-y-4">
      <FileSorting
        sortKey={sortKey}
        ascending={ascending}
        onRequestSort={handleSort}
      />

      <FileTable
        files={sortedFiles}
        sortKey={sortKey}
        ascending={ascending}
        onSortClick={handleSort}
      />
    </div>
  );
}
