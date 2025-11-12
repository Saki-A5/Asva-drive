"use client"

import { Button } from "@/components/ui/button"
import { UploadIcon } from "lucide-react"

const Upload = () => {

    return (
        <>
        <Button variant="outline" className="bg-black text-white">
            <span className="flex">
                <UploadIcon />
                <span className="pl-2">Upload</span>
            </span>
        </Button>
        </>
    )
}

export default Upload