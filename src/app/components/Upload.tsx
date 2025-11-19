"use client"

import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"

const Upload = () => {

    return (
        <>
        <Button variant="outline" className="bg-[#001f3f] text-white hover:bg-[#001f3f] hover:text-white transition-none">
            <span className="flex items-center">
                <UploadIcon />
                <span className="pl-2">Upload</span>
            </span>
        </Button>
        </>
    )
}

export default Upload