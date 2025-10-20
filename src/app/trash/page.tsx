"use client"

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
