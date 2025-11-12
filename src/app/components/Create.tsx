"use client"
import { Button } from "@/components/ui/button"
import { ArrowBigDownIcon } from "lucide-react"

const Create = () => {

    return (
        <>
        <Button variant="outline">
            <span className="flex">
                <span >Create</span>
                <ArrowBigDownIcon className="ml-2"/>
            </span>
        </Button>
        </>
    )
}
export default Create