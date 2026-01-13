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
import SortFilters, { FilterState } from '@/app/components/SortFilter';
import Floating from '@/app/components/Floating';
import Breadcrumbs from '@/app/components/Breadcrumbs';

import useCurrentUser from '@/hooks/useCurrentUser';
import { FileItem } from '@/types/File';

import { isWithinInterval, subDays, startOfDay } from 'date-fns';

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

  const [filters, setFilters] = useState<FilterState>({
    type: 'All',
    modified: 'All',
    source: 'All',
  });

  // ---------------- FETCH FILES ----------------

  const fetchFiles = async () => {
    try {
      setLoading(true);

      const url = folderId ? `/api/file/folder/${folderId}` : `/api/file`;

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
          author:
            item.file?.uploadedBy?.name ??
            item.file?.uploadedBy?.email ??
            'SMS',
          size: item.file?.sizeBytes
            ? `${(item.file?.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
            : '—',
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

  const handleDelete = async (item: FileItem) => {
    const confirmDelete = confirm(
      `Are you sure you want to delete ${item.name}?`
    );
    if (!confirmDelete) return;

    setItems((prev) => prev.filter((file) => file.id !== item.id));

    try {
      await axios.delete(`/api/file/${item.id}`);
      // Refresh the list after deletion
      await fetchFiles();
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file');
    }
  };

  const handleRename = async (item: FileItem) => {
    const newName = prompt('Enter new name:', item.name);
    if (!newName || newName === item.name) return;

    try {
      await axios.post(`/api/file/${item.id}/rename`, { filename: newName });
      // Refresh the list after rename
      await fetchFiles();
    } catch (error) {
      console.error('Error renaming file:', error);
      alert('Failed to rename file');
    }
  };

  const filteredItems = items.filter((file) => {
    if (filters.type !== 'All') {
      const typeMatch = file.type.toLowerCase() === filters.type.toLowerCase();
      if (!typeMatch) return false;
    }

    if (filters.modified !== 'All') {
      if (file.modified === '—') return false;
      const fileDate = new Date(file.modified);
      const now = new Date();

      if (filters.modified === 'Last 7 days') {
        if (fileDate < subDays(now, 7)) return false;
      } else if (filters.modified === 'Last 14 days') {
        if (fileDate < subDays(now, 14)) return false;
      }
    }

    if (filters.source !== 'All') {
      if (file.author !== filters.source) return false;
    }

    return true;
  });

  // ---------------- RENDER ----------------

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        {folderId && breadcrumbs.length > 0 && (
          <Breadcrumbs folders={breadcrumbs} />
        )}

        {/* Header */}
        <div className="flex-between gap-2 mt-2">
          <h1 className="font-bold text-xl whitespace-nowrap">
            {folderName ?? 'My Files'}
          </h1>

          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === 'admin' && <Upload folderId={folderId} onUploadComplete={fetchFiles}/>}

            <Create
              onCreateFolderClick={() => setShowCreateFolder(true)}
              creating={creating}
            />
          </div>

          <Floating />
        </div>

        <SortFilters
          filters={filters}
          setFilters={setFilters}
        />

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
              files={filteredItems}
              onDeleteClick={handleDelete}
              onRenameClick={handleRename}
              //   onFolderClick={(id) => router.push(`/files/folder/${id}`)}
            />
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default FilesView;
