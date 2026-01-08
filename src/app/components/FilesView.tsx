'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';

import Sidenav from '@/app/components/Sidenav';
import Loginnav from '@/app/components/Loginnav';
import Upload from '@/app/components/Upload';
import Create from '@/app/components/Create';
import CreateFolder from '@/app/components/CreateFolder';
import FileTable from '@/app/components/FileTable';
import SortFilters from '@/app/components/SortFilter';
import Floating from '@/app/components/Floating';
import Breadcrumbs from '@/app/components/Breadcrumbs';

import useCurrentUser from '@/hooks/useCurrentUser';
import { FileItem } from '@/types/File';

interface FilesViewProps {
  folderId?: string;
}

interface ApiItem {
  _id: string;
  filename: string;
  isFolder: boolean;
  ownerId: string;
  file?: {
    sizeBytes: number;
    mimeType: string;
    updatedAt: string;
    uploadedBy?: { email?: string; name?: string };
  };
}

const FilesView = ({ folderId }: FilesViewProps) => {
  const router = useRouter();
  const { user } = useCurrentUser();
  const [items, setItems] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateFolder, setShowCreateFolder] = useState(false);
  const [breadcrumbs, setBreadcrumbs] = useState<any[]>([]);
  const [folderName, setFolderName] = useState<string | null>(null);

  // ---------------- FETCH FILES ----------------

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const url = folderId
        ? `/api/file/folder/${folderId}`
        : `/api/file`;

      const res = await axios.get(url);

      const data = folderId ? res.data.contents : res.data.data;
      const crumbs = res.data.breadcrumbs ?? [];
      const name = res.data.folderName ?? null;

      const mapped: FileItem[] = (data as ApiItem[]).map((item) => {
        // const author = item.ownerId?.name ?? item.ownerId?.email ?? 'SMS';
        if (item.isFolder) {
          return {
            id: item._id,
            name: item.filename,
            type: 'folder',
            author: '_',
            size: '—',
            modified: '—',
            sharedUsers: [],
          };
        }

        return {
          id: item._id,
          name: item.filename,
          type: item.file?.mimeType.split('/')[0] ?? 'file',
          author: item.file?.uploadedBy?.name ?? item.file?.uploadedBy?.email ?? 'SMS',
          size: item.file?.sizeBytes ? `${(item.file?.sizeBytes / (1024 * 1024)).toFixed(1)} MB` : '—',
          modified: item.file?.updatedAt
            ? new Date(item.file.updatedAt).toDateString()
            : '—',
          sharedUsers: [],
        };
      });

      setItems(mapped);
      setBreadcrumbs(crumbs);
      setFolderName(name);
    } catch (err) {
      console.error('Fetch files failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [folderId]);

  // ---------------- CREATE FOLDER ----------------

  const handleCreateFolder = async (name: string) => {
    if (!name || !user) return;

    try {
      setCreating(true);

      await axios.post('/api/file/folder', {
        folderName: name,
        parentFolderId: folderId ?? null,
      });

      setShowCreateFolder(false);
      fetchFiles();
    } catch (err) {
      console.error('Create folder failed:', err);
    } finally {
      setCreating(false);
    }
  };

  // ---------------- RENDER ----------------

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        {folderId && breadcrumbs.length > 0 && <Breadcrumbs folders={breadcrumbs} />}

        {/* Header */}
        <div className="flex-between gap-2 mt-2">
          <h1 className="font-bold text-xl whitespace-nowrap">
            {folderName ?? 'My Files'}
          </h1>

          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === 'admin' && (
              <Upload folderId={folderId} />
            )}

            <Create
              onCreateFolderClick={() => setShowCreateFolder(true)}
              creating={creating}
            />
          </div>

          <Floating />
        </div>

        <SortFilters />

        {/* Create Folder Input */}
        {showCreateFolder && (
          <div className="mt-4">
            <CreateFolder
              parentFolderId={folderId ?? null}
              onCreate={handleCreateFolder}
              onCancel={() => setShowCreateFolder(false)}
              creating={creating}
            />
          </div>
        )}

        {/* File Table */}
        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="text-gray-500">Loading files...</div>
          ) : (
            <FileTable
              files={items}
            //   onFolderClick={(id) => router.push(`/files/folder/${id}`)}
            />
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default FilesView;
