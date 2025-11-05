"use client"
import { useState, useMemo } from "react"
import { ArrowUpDown } from "lucide-react"
import { parseSizeToBytes } from "@/utils/Filesize"

export type SortOrder = "asc" | "desc"

export interface FileItem {
  id: string
  name: string
  type: string
  size: number | string
  modified: Date
}

export function useFileSorting<File extends FileItem>(files: File[]) {
  const [sortBy, setSortBy] = useState<keyof File>("name")
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc")

  const handleSort = (key: keyof File) => {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(key)
      setSortOrder("asc")
    }
  }

  const sortedFiles = useMemo(() => {
    return [...files].sort((a, b) => {
      const aSize = typeof a.size === "string" ? parseFloat(a.size) : a.size
      const bSize = typeof b.size === "string" ? parseFloat(b.size) : b.size

      switch (sortBy) {
        case "name":
          return sortOrder === "asc"
            ? a.name.localeCompare(b.name)
            : b.name.localeCompare(a.name)
        case "type":
          return sortOrder === "asc"
            ? a.type.localeCompare(b.type)
            : b.type.localeCompare(a.type)
        case "sizeKB":
          {
            const aBytes = parseSizeToBytes(a.size)    // returns bytes
            const bBytes = parseSizeToBytes(b.size)
            return sortOrder === "asc" ? aBytes - bBytes : bBytes - aBytes
          }
        case "modified":
        default:
            return sortOrder === "asc"
            ? a.modified.getTime() - b.modified.getTime()
            : b.modified.getTime() - a.modified.getTime()
      }
    })
  }, [files, sortBy, sortOrder])

  const SortIcon = (key: keyof File) => {
    const active = sortBy === key
    return (
      <ArrowUpDown
        className={`w-4 h-4 inline ml-1 transition-opacity ${
          active ? "opacity-100" : "opacity-40"
        }`}
      />
    )
  }

  return { sortBy, sortOrder, handleSort, sortedFiles, SortIcon }
}
