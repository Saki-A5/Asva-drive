import React from "react";
import type { FileModel } from "@/lib/fileSorting";

type SortKey = "name" | "modified" | "size" | null;

interface FileSortingProps {
  files: FileModel[];
  sortKey?: SortKey;
  ascending?: boolean;
  /**
   * Called when user requests a sort (e.g. clicks a sort button).
   * Parent is responsible for performing the sort and updating `files`.
   */
  onRequestSort: (key: Exclude<SortKey, null>) => void;
}

const FileSorting: React.FC<FileSortingProps> = ({
  sortKey = null,
  ascending = true,
  onRequestSort,
}) => {
  const renderArrow = (key: SortKey) => {
    if (sortKey !== key) return "";
    return ascending ? " ▲" : " ▼";
  };

  return (
    <div className="flex items-center gap-2">
      <button className="btn" onClick={() => onRequestSort("name")}>
        Name{renderArrow("name")}
      </button>
      <button className="btn" onClick={() => onRequestSort("modified")}>
        Modified{renderArrow("modified")}
      </button>
      <button className="btn" onClick={() => onRequestSort("size")}>
        Size{renderArrow("size")}
      </button>
    </div>
  );
};

export default FileSorting;
