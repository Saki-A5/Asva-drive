"use client"

import { FileArchive, FileIcon, FileSpreadsheet, FileText, Folder } from "lucide-react"

type FileiconProps = {
    type: string
}   
const Fileicon = ({type}: FileiconProps) => {
    switch (type) {
        case "folder":
            return <Folder className="h-8 w-8 text-blue-800" fill="#001f3f"/>
        case "pdf":
            return <FileText className="h-8 w-8 text-red-600" fill="#ef4444"/>
        case "word":
            return <FileText className="h-8 w-8 text-blue-600" fill="#2563eb"/>
        case "excel":
            return <FileSpreadsheet className="h-8 w-8 text-green-600" fill="#16a34a"/>
        case "zip":
            return <FileArchive className="h-8 w-8 text-yellow-600" fill="#eab308"/>
        default:
            return <FileText className="h-8 w-8 text-gray-500" fill="#9ca3af"/>
    }
}

export default Fileicon