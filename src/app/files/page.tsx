"use client"

import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";

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
        size: 2048 * 1024,
        modified: new Date("2025-10-10")
    },
    {
        id: "2",
        name: "asva logo.jpg",
        type: "Image",
        size: 1536 * 1024,
        modified: new Date("2025-10-15")
    },
    {
        id: "3",
        name: "presentation.pptx",
        type: "Text",
        size: 512 * 1024,
        modified: new Date("2025-09-10")
    },
]

const Files = () => {
   
    return (
        <Sidenav>
            <Loginnav />
            
        </Sidenav>
    )
}
export default Files