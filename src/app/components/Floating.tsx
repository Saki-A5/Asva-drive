"use client"
import { useState } from "react"
import Create from "./Create"
import Upload from "./Upload"
import CreateEventDialog from "./CreateEventDialog"
import useCurrentUser from "@/hooks/useCurrentUser"

const Floating = () => {
    const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }
    const {user} = useCurrentUser();
    const [createEventOpen, setCreateEventOpen] = useState(false);

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50 sm:hidden">
            {user?.role === 'admin' && <Upload />}
            <Create
              onCreateFolderClick={handleCreateFolder}
              onCreateEventClick={
                user?.role === "admin"
                  ? () => setCreateEventOpen(true)
                  : undefined
              }
            />
            <CreateEventDialog
              open={createEventOpen}
              onOpenChange={setCreateEventOpen}
            />
        </div>
    )
}

export default Floating