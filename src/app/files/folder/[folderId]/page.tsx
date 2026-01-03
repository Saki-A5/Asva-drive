'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateFolder from '@/app/components/CreateFolder';
import FolderItem from '@/app/components/FolderItem';
import axios from 'axios';
import FileItem from '@/app/components/FileItem';
import Breadcrumbs from '@/app/components/Breadcrumbs';
import { Button } from '@/components/ui/button';
import Create from '@/app/components/Create';
import Upload from '@/app/components/Upload';


interface PageProps {
  params: { folderId: string };
}

interface Folder {
  _id: string;
  name: string;
  parentFolderId?: string;
}
interface File {
  _id: string;
  name: string;
}

const FolderPage = ({ params }: PageProps) => {
  const router = useRouter();
  const folderId = params.folderId;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [loading, setLoading] = useState(true);
  const [breadcrumbs, setBreadcrumbs] = useState<Folder[]>([]);
  const [creating, setCreating] = useState(false);

  // Fetch folders inside this folder
  const fetchFolderContents = async () => {
  try {
    setLoading(true);
    if (!folderId) return;
    const res = await axios.get(`/api/file/folder/${folderId}`);
    const allContents = res.data.contents || [];
    setFolders(allContents.filter((c: any) => c.isFolder));
    setFiles(allContents.filter((c: any) => !c.isFolder));
    setBreadcrumbs(res.data.breadcrumbs || []);
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    if (!folderId) return;
    fetchFolderContents();
  }, [folderId]);

  // Create folder trigger
  const handleCreateFolder = async (name: string) => {
  if (!name) return;

  try {
    setCreating(true);

    console.log("Creating folder:", {
      folderName: name,
      parentFolderId: folderId,
    });

    const res = await axios.post('/api/file/folder', {
      folderName: name,
      parentFolderId: folderId,
    });

    console.log("Create folder response:", res.data);

    setShowCreateFolder(false);
    fetchFolderContents();
  } catch (err: any) {
    console.error(
      "Create folder failed:",
      err.response?.data || err.message
    );
    alert(err.response?.data?.message || "Failed to create folder");
  } finally {
    setCreating(false);
  }
};


  return (
    <div className="p-6">
      <Breadcrumbs folders={breadcrumbs} />
      {/* Toolbar */}
      <div className="mb-4 flex gap-2">
        <Button onClick={() => setShowCreateFolder(true)} variant="default">
          New Folder
        </Button>

        <Upload folderId={folderId} /> 
      </div>

      {/* Create Folder */}
      <Create
        onCreateFolderClick={() => setShowCreateFolder(true)}
        creating={creating}
      />

      {showCreateFolder && (
        <CreateFolder
          parentFolderId={folderId}
          onCreate={handleCreateFolder}
          onCancel={() => setShowCreateFolder(false)}
          creating={creating}
        />
      )}


      {/* Folder Grid */}
      {/* Folder + File Grid */}
      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
    {folders.map((folder) => (
      <div
        key={folder._id}
        onClick={() => router.push(`/files/folder/${folder._id}`)}
      >
        <FolderItem folder={folder} />
      </div>
    ))}
    {files.map((file) => (
      <div key={file._id}>
        <FileItem file={file} />
      </div>
    ))}
  </div>
)}

    </div>
  );
};

export default FolderPage;