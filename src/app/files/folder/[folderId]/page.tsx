'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import CreateFolder from '@/app/components/CreateFolder';
import FolderItem from '@/app/components/FolderItem';
import axios from 'axios';
import FileItem from '@/app/components/FileItem';

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
  const { folderId } = params;

  const [folders, setFolders] = useState<Folder[]>([]);
  const [files, setFiles] = useState<File[]>([]);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch folders inside this folder
  const fetchFolderContents = async () => {
  try {
    setLoading(true);
    const res = await axios.get(`/api/file/folder/${folderId}`);
    const allContents = res.data.contents || [];
    setFolders(allContents.filter((c: any) => c.isFolder));
    setFiles(allContents.filter((c: any) => !c.isFolder));
  } catch (err) {
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    fetchFolderContents();
  }, [folderId]);

  // Create folder trigger
  const handleCreateFolder = async (name: string) => {
    if (!name) return;

    await axios.post('/api/file/folder', {
      name,
      parentFolderId: folderId,
    });

    setShowCreateFolder(false);
    fetchFolderContents();
  };

  return (
    <div className="p-6">
      {/* Toolbar */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowCreateFolder(true)}
          className="rounded bg-blue-600 px-3 py-1 text-white"
        >
          New Folder
        </button>
      </div>

      {/* Create Folder */}
      {showCreateFolder && (
        <CreateFolder
          parentFolderId={folderId}
          onCreate={handleCreateFolder}
          onCancel={() => setShowCreateFolder(false)}
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