"use client"

import { useState } from "react"
import Loginnav from "../components/Loginnav"
import Sidenav from "../components/Sidenav"


type File =  {
  id: string
  name: string
  type: string
  size: string
  modified: Date
}

const Recent = ({files}: {files: File[]}) => {
  const [view, setView] = useState<"grid" | "list">("grid")
  const [sortBy, setSortBy] = useState<"name" | "modified" | "type" | "size">("modified")

  // sort files
  const sortedFiles  = [...files].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.name.localeCompare(b.name)
      case "type":
        return a.name.localeCompare(b.type)
      case "size":
        return parseInt(a.size) - parseInt(b.size)
    }
  })
  
  return (
    <Sidenav>
        <Loginnav />
        <div>recent</div>
    </Sidenav>
  )
}
export default Recent