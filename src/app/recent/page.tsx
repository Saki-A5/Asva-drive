"use client"

import { useEffect, useState } from "react"
import Loginnav from "../components/Loginnav"
import Sidenav from "../components/Sidenav"
import Cookies from "js-cookie"
import { DropdownMenu, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, ChevronDown, Grid, List } from "lucide-react"
import { DropdownMenuContent } from "@radix-ui/react-dropdown-menu"



type File =  {
  id: string
  name: string
  type: string
  size: string
  modified: Date
}

const Recent = ({files=[] }: {files: File[]}) => {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "modified" | "type" | "size">("modified")
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc")

  useEffect(() => {
    const savedView = Cookies.get("recentView") as "grid"|"list"
    const savedSort = Cookies.get("recentSort") as 
    | "name"
    | "modified"
    | "type"
    | "size"
    const savedOrder = Cookies.get("recentOrder") as "asc" | "desc"

    if (savedView) setView(savedView)
    if (savedSort) setSortBy(savedSort)
    if (savedOrder) setSortOrder(savedOrder)
  }, [])

  useEffect(() => {
    Cookies.set("recentView", view, {expires: 30})
    Cookies.set("recentSort", sortBy, {expires: 30})
    Cookies.set("recentOrder", sortOrder, {expires: 30})
  }, [view, sortBy, sortOrder])

  // sort files
  const sortedFiles  = [...files].sort((a, b) => {
    let result = 0
    switch (sortBy) {
      case "name":
        result = a.name.localeCompare(b.name)
        break
      case "type":
        result = a.name.localeCompare(b.type)
        break
      case "size":
        result = parseInt(a.size) - parseInt(b.size)
        break
      case "modified":
        default:
          result = b.modified.getTime() - a.modified.getTime()
    }
    return sortOrder === "asc" ? result : -result
  })

  const handleSort = (key: typeof sortBy) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }
  
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
        <div>recent</div>
        <div className="p-6">
            {/* view toggle */}
            <div className="flex justify-end mb-6 gap-2">
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


          {/* Files Display */}
          {view === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {sortedFiles.map((file) => (
                <div key={file.id} className="border p-4 rounded-lg shadow-sm hover:shadow-md transition">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.type}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="overflow-hidden border rounded-lg">
              <div className="grid grid-cols-4 bg-muted/40 p-3 font-medium text-sm">
              <Button variant="ghost" className="flex items-center gap-1" onClick={() => handleSort("name")}>Name{SortIcon("name")}</Button>
              <Button variant="ghost" className="flex items-center gap-1" onClick={() => handleSort("type")}>Type{SortIcon("type")}</Button>
              <Button variant="ghost" className="flex items-center gap-1" onClick={() => handleSort("size")}>Size{SortIcon("size")}</Button>
              <Button variant="ghost" className="flex items-center gap-1" onClick={() => handleSort("modified")}>Modified{SortIcon("modified")}</Button>
            </div>

            <div>
              {sortedFiles.map((file) => (
                <div key={file.id} className="p-3 hover:bg-muted/50 grid grid-cols-3 items-center">
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">{file.type}</p>
                  <p className="text-sm text-muted-foreground">{file.size} KB</p>
                  <span className="text-sm text-muted-foreground">
                    {file.modified.toLocaleDateString()} 
                  </span>
                </div>
              ))}
              </div>
            </div>
          )}
        </div>
    </Sidenav>
  )
}
export default Recent