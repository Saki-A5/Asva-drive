"use client"

import Cookies from "js-cookie";
import { useEffect, useState } from "react";
import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";
import { Button } from "@/components/ui/button";
import { Grid, List, ArrowUpDown } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type File = {
    id: string;
    name: string;
    type: string;
    size: number | string;
    modified: Date;
}

const mocckFiles: File[] = [
    {
        id: "1",
        name: "report.pdf",
        type: "PDF",
        size: 2048,
        modified: new Date("2025-10-10")
    },
    {
        id: "2",
        name: "asva logo.jpg",
        type: "Image",
        size: 1536,
        modified: new Date("2025-10-15")
    },
    {
        id: "3",
        name: "presentation.pptx",
        type: "Text",
        size: 512,
        modified: new Date("2025-09-10")
    },
]

const Files = () => {
    const [files, setFiles] = useState<File[]>(mocckFiles)
    const [view, setView] = useState<"grid" | "list">("grid")
    const [sortBy, setSortBy] = useState<keyof File>("name")
    const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc")


    // load preferences
    useEffect(() => {
        const savedView = Cookies.get("filesView") as "grid"|"list"
        const savedSortBy = Cookies.get("filesSortBy") as keyof File
        const savedSortOrder = Cookies.get("filesSortOrder") as "asc"|"desc"

        if (savedView) setView(savedView)
        if (savedSortBy) setSortBy(savedSortBy)
        if (savedSortOrder) setSortOrder(savedSortOrder)
    }, [])

    // persist preferences
    useEffect(() => {
        Cookies.set("filesView", view, { expires: 30 })
        Cookies.set("filesSortBy", sortBy, { expires: 30 })
        Cookies.set("filesSortOrder", sortOrder, { expires: 30 })
    }, [view, sortBy, sortOrder])

    // format file size dynamically
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

    // sorting logic
    const handleSort = (key: keyof File) => {
        if (key === sortBy) {
            // toggle ascending and descending
            setSortOrder(sortOrder === "asc" ? "desc" : "asc")
        } else {
            setSortBy(key)
            setSortOrder("asc")
        }
    }

    const sortedFiles = [...files].sort((a, b) => {
        const aSize = typeof a.size === "string" ? parseFloat(a.size) : a.size
        const bSize = typeof b.size === "string" ? parseFloat(b.size) : b.size
       
        switch(sortBy) {
          case "name":
            return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
          case "type":
            return sortOrder === "asc"
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type)
          case "size":
            return sortOrder === 'asc' ? aSize - bSize : bSize - aSize
          case "modified":
          default:
            return sortOrder === "asc"
            ? a.modified.getTime() - b.modified.getTime()
            : b.modified.getTime() - a.modified.getTime()
        }
    })

    const SortIcon = (key: typeof sortBy) => {
      if (sortBy === key) {
        return <ArrowUpDown className="w-4 h-4" />
        return sortOrder === "asc" ? (
          <ArrowUpDown className="w-4 h-4" />
        ) : (
          <ArrowUpDown className="w-4 h-4" />
        )
      }
    }

    return (
        <Sidenav>
            <Loginnav />
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-semibold">My Files</h2>

                    <div className="flex gap-2">
                        <Button
                        variant={view === "grid" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setView("grid")}>
                            <Grid className="w-4 h-4"/>
                        </Button>
                        <Button
                        variant={view === "list" ? "default" : "outline"}
                        size="icon"
                        onClick={() => setView("list")}>
                            <List className="w-4 h-4"/>
                        </Button>
                    </div>
                </div>

                {/* Files Dispplay */}
                {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedFiles.map((file) => (
                <div key={file.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.type}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                </div>
              ))}
            </div>
            ) : (
            <div className="overflow-hidden border rounded-lg">
              <div className="grid grid-cols-4 bg-muted/40 p-3 font-medium text-center text-sm">
              <Button variant="ghost" className="flex items-center justify-center text-center gap-1" onClick={() => handleSort("name")}>Name {SortIcon("name")}</Button>
              <Button variant="ghost" className="flex items-center gap-1 justify-center text-center" onClick={() => handleSort("type")}>Type {SortIcon("type")}</Button>
              <Button variant="ghost" className="flex items-center gap-1 justify-center text-center" onClick={() => handleSort("size")}>Size {SortIcon("size")}</Button>
              <Button variant="ghost" className="flex items-center gap-1 justify-center text-center" onClick={() => handleSort("modified")}>Modified {SortIcon("modified")}</Button>
            </div>
            
            {sortedFiles.map((file) => (
                <div key={file.id} className="p-3 hover:bg-muted/50 grid grid-cols-4 items-center text-center">
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <p className="font-medium truncate overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer">{file.name}</p>
                      </TooltipTrigger>
                      <TooltipContent>
                        {file.name}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                  <p className="text-sm text-muted-foreground">{file.type}</p>
                  <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
                  <span className="text-sm text-muted-foreground">
                    {file.modified.toLocaleDateString()} 
                  </span>
                </div>
              ))}
              </div>
            )}
            </div>
        </Sidenav>
    )
}
export default Files