import React from "react";
import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown } from "lucide-react";

type SortKey = "name" | "size" | "modified" | null;

export default function FileTableHeader({
  onSortClick,
  sortKey,
  ascending,
}: {
  onSortClick?: (key: Exclude<SortKey, null>) => void;
  sortKey?: SortKey;
  ascending?: boolean;
}) {
  const renderArrow = (key: SortKey) => {
    if (sortKey !== key) return null;
    return <span className="ml-2">{ascending ? "▲" : "▼"}</span>;
  };

  const handleClick = (k: Exclude<SortKey, null>) => {
    if (onSortClick) onSortClick(k);
  };

  return (
    <TableHeader>
      <TableRow className="border-gray-200 hover:bg-transparent text-white opacity-45">
        <TableHead
          className="w-[40%] flex items-center cursor-pointer"
          onClick={() => handleClick("name")}
        >
          <span>Name</span>
          {renderArrow("name")}
        </TableHead>
        <TableHead>Sharing</TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleClick("size")}
        >
          Size {renderArrow("size")}
        </TableHead>
        <TableHead
          className="cursor-pointer"
          onClick={() => handleClick("modified")}
        >
          Modified {renderArrow("modified")}
        </TableHead>
        <TableHead className="text-right"></TableHead>
      </TableRow>
      {/* added for extra space before the body */}
      <div className="h-12"></div>
    </TableHeader>
  );
}
