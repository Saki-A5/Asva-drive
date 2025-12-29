"use client"
import Create from "./Create"
import Upload from "./Upload"
import useCurrentUser from "@/hooks/useCurrentUser"

const Floating = () => {
    const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }
    const {user} = useCurrentUser();

    return (
        <div className="fixed bottom-4 right-4 flex flex-col gap-4 z-50 sm:hidden">
            {user?.role === 'admin' && <Upload />}
            <Create onCreateFolderClick={handleCreateFolder} />
        </div>
    )
}

export default Floating