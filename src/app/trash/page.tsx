"use client"

import { useEffect, useState, useMemo } from "react"
import Sidenav from "../components/Sidenav"
import Loginnav from "../components/Loginnav"
import { Button } from "@/components/ui/button"
import { Filter, MoreVertical, Repeat, Trash2 } from "lucide-react"
import {DropdownMenu, DropdownMenuContent, DropdownMenuItem,  DropdownMenuTrigger,} from "@/components/ui/dropdown-menu"
import {Sheet, SheetTrigger, SheetContent} from "@/components/ui/sheet"
import { Input } from "@/components/ui/input"
import { DateRangePicker } from "../components/Daterange"
import { DateRange } from "react-day-picker"


type FileItem = {
    id: string
    name: string
    type: string
    sizeKB: number
    deletedAt: Date
    deletedBy: string
    originalLocation: string
    isTrashed?: boolean
}

const MOCK: FileItem[] = [
    {
        id: "f1",
        name: "Quarterly_Report.docx",
        type: "Document",
        sizeKB: 2048,
        deletedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
        deletedBy: "alice@gmail.com",
        originalLocation: "/Work/Reports/",
        isTrashed: true
    },
    {
        id: "f2",
        name: "Vacation_Photos.jpg",
        type: "Image",
        sizeKB: 5120,
        deletedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
        deletedBy: "bob@gmail.com",
        originalLocation: "/Personal/Photos/",
        isTrashed: true
    },
    {
        id: "f3",
        name: "Project_Plan.xlsx",
        type: "Spreadsheet",
        sizeKB: 512,
        deletedAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000), // 1 day ago
        deletedBy: "victor@gmail.com",
        originalLocation: "/Work/Projects/",
        isTrashed: true
    },
    {
        id: "f4",
        name: "big_presentation.mp4",
        type: "Video",
        sizeKB: 204800,
        deletedAt: new Date(), // today
        deletedBy: "charlie@example.com",
        originalLocation: "/Work/Presentations/",
        isTrashed: true
    }
]

// helpers
const formatFileSize = (size : number | string): string => {
      const bytes = typeof size === "string" ? parseFloat(size) : size
      if (isNaN(bytes)) return "0 KB"
      if (bytes < 1024) return `${bytes} KB`
      const mb = bytes / 1024
      if (mb < 1024 ) return `${mb.toFixed(2)} MB`
      const gb = mb / 1024
      if (gb < 1024 ) return `${gb.toFixed(2)} GB`
      const tb = gb / 1024
      return `${tb.toFixed(2)} TB`
    }

const daysBetween = (d1: Date, d2 = new Date()) => 
    Math.floor(Math.abs((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)))

const trashPage = () => {
    const [files, setFiles] = useState<FileItem[]>(MOCK)

    // remove files older than 30 days 
    useEffect(() => {
        const now = new Date();
        setFiles((prev) => prev.filter((f) => !f.isTrashed || daysBetween(f.deletedAt, now) <= 30))
    }, [])

    // ui state
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [sheetOpen, setSheetOpen] = useState(false);


  // filters
  const [presetRange, setPresetRange] = useState<"all" | "today" | "7" | "30">("all");
  const [customStart, setCustomStart] = useState<string>(""); // yyyy-mm-dd
  const [customEnd, setCustomEnd] = useState<string>("");
  const [deletedByFilter, setDeletedByFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<Record<string, boolean>>({});
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [otherRange, setOtherRange] = useState("all")
  

  // derived types list for filter UI
  const typesAvailable = useMemo(() => {
    const set = new Set<string>();
    files.forEach((f) => set.add(f.type));
    return Array.from(set);
  }, [files]);

//  trashed files
  const trashed = useMemo(() => files.filter((f) => f.isTrashed), [files]);

  const filtered = useMemo(() => {
    const now = new Date();

    return trashed.filter((f) => {
      // date range
      if (presetRange === "today") {
        if (daysBetween(f.deletedAt, now) !== 0) return false;
      } else if (presetRange === "7") {
        if (daysBetween(f.deletedAt, now) > 7) return false;
      } else if (presetRange === "30") {
        if (daysBetween(f.deletedAt, now) > 30) return false;
      } else if (presetRange === "all") {
        // no-op
      }

      // custom
      if (customStart) {
        const s = new Date(customStart);
        if (f.deletedAt < s) return false;
      }
      if (customEnd) {
        const e = new Date(customEnd);
        // include end date (set end to end of day)
        e.setHours(23, 59, 59, 999);
        if (f.deletedAt > e) return false;
      }

      // deletedBy
      if (deletedByFilter && !f.deletedBy.toLowerCase().includes(deletedByFilter.toLowerCase()))
        return false;

      // type filter (if any selected)
      const activeTypes = Object.entries(typeFilter)
        .filter(([, v]) => v)
        .map(([k]) => k);
      if (activeTypes.length > 0 && !activeTypes.includes(f.type)) return false;

      return true;
    });
  }, [trashed, presetRange, customStart, customEnd, deletedByFilter, typeFilter]);

  /* ---------- Selection helpers ---------- */
  const toggleRow = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  /* ---------- Actions ---------- */
  const restoreFile = (id: string) => {
    setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, isTrashed: false, deletedAt: new Date() } : f)));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  const deletePermanently = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
    setSelectedIds((s) => {
      const next = new Set(s);
      next.delete(id);
      return next;
    });
  };

  const bulkRestore = () => {
    setFiles((prev) => prev.map((f) => (selectedIds.has(f.id) ? { ...f, isTrashed: false, deletedAt: new Date() } : f)));
    clearSelection();
  };

  const bulkDelete = () => {
    setFiles((prev) => prev.filter((f) => !selectedIds.has(f.id)));
    clearSelection();
  };

  /* ---------- UI ---------- */
  return (
    <Sidenav>
      <Loginnav />
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Trash</h2>

          <div className="flex items-center gap-2 hidden lg:block">
            {/* Filter trigger: opens side panel on md+, acts as dropdown on small screens */}
            <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex items-center gap-2">
                  <Filter className="w-4 h-4" />
                  Filter
                </Button>
              </SheetTrigger>

              <SheetContent side="right" className="w-[min(420px,90vw)]">
                <div className="p-4 space-y-4">
                  <h3 className="text-lg font-semibold">Filters</h3>

                  {/* Date presets */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Date range</p>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={presetRange === "all" ? "default" : "outline"}
                        size="sm"
                        onClick={() => {
                          setPresetRange("all");
                          setCustomStart("");
                          setCustomEnd("");
                        }}
                      >
                        All
                      </Button>
                      <Button variant={presetRange === "today" ? "default" : "outline"} size="sm" onClick={() => setPresetRange("today")}>
                        Today
                      </Button>
                      <Button variant={presetRange === "7" ? "default" : "outline"} size="sm" onClick={() => setPresetRange("7")}>
                        Last 7 days
                      </Button>
                      <Button variant={presetRange === "30" ? "default" : "outline"} size="sm" onClick={() => setPresetRange("30")}>
                        Last 30 days
                      </Button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <Input
                        type="date"
                        value={customStart}
                        onChange={(e) => {
                          setCustomStart(e.target.value);
                          setPresetRange("all");
                        }}
                        aria-label="Start date"
                      />
                      <Input
                        type="date"
                        value={customEnd}
                        onChange={(e) => {
                          setCustomEnd(e.target.value);
                          setPresetRange("all");
                        }}
                        aria-label="End date"
                      />
                    </div>
                  </div>

                  {/* Deleted by */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Deleted by</p>
                    <Input
                      placeholder="Search by user email..."
                      value={deletedByFilter}
                      onChange={(e) => setDeletedByFilter(e.target.value)}
                    />
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Type</p>
                    <div className="flex flex-col gap-2 max-h-40 overflow-auto">
                      {typesAvailable.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No types</p>
                      ) : (
                        typesAvailable.map((t) => (
                          <label key={t} className="flex items-center gap-2">
                            <input
                              type="checkbox"
                              checked={!!typeFilter[t]}
                              onChange={(e) => setTypeFilter((prev) => ({ ...prev, [t]: e.target.checked }))}
                              className="w-4 h-4"
                            />
                            <span className="text-sm">{t}</span>
                          </label>
                        ))
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => {
                      setPresetRange("all");
                      setCustomStart("");
                      setCustomEnd("");
                      setDeletedByFilter("");
                      setTypeFilter({});
                    }}>
                      Reset
                    </Button>
                    <Button onClick={() => setSheetOpen(false)}>Apply</Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>

          {/* for small screens */}
        <div className="block lg:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className = 'w-4 h-4 mr-2'/>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-92">
              
               <div className="w-9/10 justify-center item-center mx-auto">
                 <h3 className="text-lg font-semibold">Filters</h3>
                    <p className="text-sm text-muted-foreground mt-2 mb-2">Date range</p>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: "all", label: "All" },
                        { key: "today", label: "Today" },
                        { key: "7", label: "Last 7 days" },
                        { key: "30", label: "Last 30 days" },
                      ].map(({ key, label }) => (
                        <DropdownMenuItem
                        key={key}
                        onClick={() => {
                        setPresetRange(key as "all" | "today" | "7" | "30");
                        if (key === "all") {
                        setCustomStart("");
                        setCustomEnd("");
                        }
                      }}
                      className={`cursor-pointer ${
                      presetRange === key
                        ? "bg-primary text-primary-foreground font-medium"
                          : "hover:bg-muted"
                      }`}
                      >
                        {label}
                      </DropdownMenuItem>
                      ))}
                    </div>

                    <div className="mt-3 flex items-center gap-2">
                      <DateRangePicker
                        dateRange={dateRange}
                        setDateRange={setDateRange}
                        setPresetRange={setOtherRange}
                      />
                    </div>

                  {/* Deleted by */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 mt-4">Deleted by</p>
                    <Input
                      placeholder="Search by user email..."
                      value={deletedByFilter}
                      onChange={(e) => setDeletedByFilter(e.target.value)}
                      />
                  </div>

                  {/* Type */}
                  <div>
                    <p className="text-sm text-muted-foreground mb-2 mt-4">Type</p>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-full justify-between">
                          {Object.keys(typeFilter).some((f) => typeFilter[f]) ? Object.keys(typeFilter).find((f) => typeFilter[f]) : "All types"}
                        </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-full">
                          <DropdownMenuItem onClick={() => setTypeFilter({})} className={`cursor-pointer`}>
                            All types
                          </DropdownMenuItem>

                          {typesAvailable.map((t) => (
                            <DropdownMenuItem
                              key={t}
                              onClick={() => setTypeFilter({[t]: true})} className={`cursor-pointer`}>
                              {t}
                            </DropdownMenuItem>
                          ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex justify-center gap-2 mt-4 mb-2">
                    <Button variant="outline" onClick={() => {
                      setPresetRange("all");
                      setCustomStart("");
                      setCustomEnd("");
                      setDeletedByFilter("");
                      setTypeFilter({});
                    }}>
                      Reset
                    </Button>
                    <Button onClick={() => setSheetOpen(false)}>Apply</Button>
                  </div>
          </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        </div>
        

        {/* selection action bar */}
        {selectedIds.size > 0 && (
          <div className="mb-4 flex items-center justify-between bg-muted/20 p-3 rounded-md">
            <div className="flex items-center gap-3">
              <span className="font-semibold">{selectedIds.size} selected</span>
              <Button variant="ghost" size="sm" onClick={clearSelection}>
                Clear
              </Button>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" className="flex items-center gap-2" onClick={bulkRestore}>
                <Repeat className="w-4 h-4" /> Restore
              </Button>
              <Button variant="destructive" className="flex items-center gap-2" onClick={bulkDelete}>
                <Trash2 className="w-4 h-4" /> Delete permanently
              </Button>
            </div>
          </div>
        )}

        {/* Table header */}
        <div className="overflow-hidden border rounded-lg">
          <div className="grid grid-cols-5 bg-muted/40 p-3 text-sm font-medium text-center">
            <div className="col-span-2">Name</div>
            <div>Size</div>
            <div>Date trashed</div>
            <div>Original location</div>
          </div>

          {/* Rows */}
          <div>
            {filtered.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">No trashed files match your filters.</div>
            ) : (
              filtered.map((file) => {
                const selected = selectedIds.has(file.id);
                return (
                  <div
                    key={file.id}
                    className={`grid grid-cols-5 items-center gap-2 p-3 border-t text-sm text-center transition cursor-pointer ${
                      selected ? "bg-indigo-50" : "hover:bg-muted/50"
                    }`}
                    onClick={() => toggleRow(file.id)}
                    role="row"
                    aria-selected={selected}
                  >
                    {/* Name (col-span 2) */}
                    <div className="col-span-2 px-2">
                      <div
                        className="truncate text-left"
                        title={file.name}
                        onClick={(e) => e.stopPropagation()} // avoid toggling when clicking internal controls
                      >
                        {file.name}
                      </div>
                      <div className="text-xs text-muted-foreground text-left">{file.type}</div>
                      <div className="text-xs text-muted-foreground text-left">Deleted by: {file.deletedBy}</div>
                    </div>

                    {/* Size */}
                    <div>{formatFileSize(file.sizeKB)}</div>

                    {/* Date trashed */}
                    <div>{file.deletedAt.toLocaleDateString()}</div>

                    {/* Original location + overflow menu */}
                    <div className="flex items-center justify-center gap-2">
                      <div className="truncate text-left max-w-[16rem]" title={file.originalLocation}>
                        {file.originalLocation}
                      </div>

                      {/* three-dots menu */}
                      <div onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="p-1">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onSelect={() => {
                                restoreFile(file.id);
                              }}
                            >
                              Restore
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onSelect={() => {
                                // confirm? simple immediate deletion for demo
                                if (confirm(`Delete ${file.name} permanently?`)) deletePermanently(file.id);
                              }}
                              className="text-red-600"
                            >
                              Delete permanently
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </Sidenav>
  );
}
export default trashPage
