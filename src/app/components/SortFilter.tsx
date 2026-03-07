// 'use client';
// import { Button } from '@/components/ui/button';
// import { ChevronDown, Check } from 'lucide-react';
// import {
//   DropdownMenu,
//   DropdownMenuContent,
//   DropdownMenuItem,
//   DropdownMenuTrigger,
// } from '@/components/ui/dropdown-menu';
// import { COLLEGE_META } from '@/lib/college';

// // Define the filter state interface
// export interface FilterState {
//   type: string;
//   modified: string;
//   source: string;
//   customRange?: { from: Date; to: Date };
// }

// interface SortFiltersProps {
//   filters: FilterState;
//   setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
// }

// const SortFilters = ({ filters, setFilters }: SortFiltersProps) => {
//   const fileTypes = [
//     'All',
//     'Folder',
//     'Image',
//     'Video',
//     'PDF',
//     'Audio',
//     'Document',
//   ];
//   const dateOptions = ['All', 'Last 7 days', 'Last 14 days', 'Custom Range'];
//   const colleges = [
//     'All',
//     ...Object.values(COLLEGE_META).map((c) => c.slug.toUpperCase()),
//   ];

//   const updateFilter = (key: keyof FilterState, value: string) => {
//     setFilters((prev) => ({ ...prev, [key]: value }));
//   };

//   return (
//     <div className="my-6 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="outline"
//             className={`shrink-0 ${
//               filters.type !== 'All' ? 'border-primary bg-primary/5' : ''
//             }`}>
//             Type: {filters.type} <ChevronDown className="ml-2 h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent>
//           {fileTypes.map((t) => (
//             <DropdownMenuItem
//               key={t}
//               onClick={() => updateFilter('type', t)}>
//               {t} {filters.type === t && <Check className="ml-auto h-4 w-4" />}
//             </DropdownMenuItem>
//           ))}
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="outline"
//             className={`shrink-0 ${
//               filters.modified !== 'All' ? 'border-primary bg-primary/5' : ''
//             }`}>
//             Modified: {filters.modified}{' '}
//             <ChevronDown className="ml-2 h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent>
//           {dateOptions.map((d) => (
//             <DropdownMenuItem
//               key={d}
//               onClick={() => updateFilter('modified', d)}>
//               {d}{' '}
//               {filters.modified === d && <Check className="ml-auto h-4 w-4" />}
//             </DropdownMenuItem>
//           ))}
//         </DropdownMenuContent>
//       </DropdownMenu>

//       <DropdownMenu>
//         <DropdownMenuTrigger asChild>
//           <Button
//             variant="outline"
//             className={`shrink-0 ${
//               filters.source !== 'All' ? 'border-primary bg-primary/5' : ''
//             }`}>
//             Source: {filters.source} <ChevronDown className="ml-2 h-4 w-4" />
//           </Button>
//         </DropdownMenuTrigger>
//         <DropdownMenuContent className="max-h-64 overflow-y-auto">
//           {colleges.map((c) => (
//             <DropdownMenuItem
//               key={c}
//               onClick={() => updateFilter('source', c)}>
//               {c}{' '}
//               {filters.source === c && <Check className="ml-auto h-4 w-4" />}
//             </DropdownMenuItem>
//           ))}
//         </DropdownMenuContent>
//       </DropdownMenu>
//     </div>
//   );
// };

// export default SortFilters;

"use client";
import * as React from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Check, Calendar as CalendarIcon } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Calendar } from "@/components/ui/calendar";
import { COLLEGE_META } from "@/lib/college";
import { format } from "date-fns";

export interface FilterState {
  type: string;
  modified: string;
  source: string;
  customRange?: { from: Date; to: Date | undefined };
}

interface SortFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const SortFilters = ({ filters, setFilters }: SortFiltersProps) => {
  const fileTypes = [
    "All",
    "Folder",
    "Image",
    "Video",
    "PDF",
    "Audio",
    "Document",
  ];
  const dateOptions = ["All", "Last 7 days", "Last 14 days"];
  const colleges = [
    "All",
    ...Object.values(COLLEGE_META).map((c) => c.slug.toUpperCase()),
  ];

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const getModifiedLabel = () => {
    if (filters.modified === "Custom Range" && filters.customRange?.from) {
      const from = format(filters.customRange.from, "MMM dd");
      const to = filters.customRange.to
        ? format(filters.customRange.to, "MMM dd")
        : "...";
      return `${from} - ${to}`;
    }
    return filters.modified;
  };

  return (
    <div className="my-6 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
      {/* Type Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.type !== "All" ? "border-primary bg-primary/5" : ""
            }`}>
            Type: {filters.type} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {fileTypes.map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => updateFilter("type", t)}>
              {t} {filters.type === t && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Modified Filter (Integrated Calendar) */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.modified !== "All" ? "border-primary bg-primary/5" : ""
            }`}>
            Modified: {getModifiedLabel()}{" "}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="w-auto p-2">
          {dateOptions.map((d) => (
            <DropdownMenuItem
              key={d}
              onClick={() => {
                updateFilter("modified", d);
                updateFilter("customRange", undefined);
              }}>
              {d}{" "}
              {filters.modified === d && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}

          <DropdownMenuSeparator />

          <div className="p-2">
            <div
              className="flex items-center text-sm font-medium mb-2 cursor-pointer"
              onClick={() => updateFilter("modified", "Custom Range")}>
              <CalendarIcon className="mr-2 h-4 w-4" />
              Custom Range
              {filters.modified === "Custom Range" && (
                <Check className="ml-auto h-4 w-4" />
              )}
            </div>
            <Calendar
              initialFocus
              mode="range"
              selected={{
                from: filters.customRange?.from,
                to: filters.customRange?.to,
              }}
              onSelect={(range) => {
                updateFilter("modified", "Custom Range");
                updateFilter("customRange", range);
              }}
              numberOfMonths={1}
              className="rounded-md border shadow-sm"
            />
          </div>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Source Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.source !== "All" ? "border-primary bg-primary/5" : ""
            }`}>
            Source: {filters.source} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-64 overflow-y-auto">
          {colleges.map((c) => (
            <DropdownMenuItem
              key={c}
              onClick={() => updateFilter("source", c)}>
              {c}{" "}
              {filters.source === c && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortFilters;
