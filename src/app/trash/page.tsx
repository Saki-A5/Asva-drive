'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import FileTable from '../components/FileTable';
import { FileItem } from '@/types/File';
import useCurrentUser from '@/hooks/useCurrentUser';
import SortFilters, { FilterState } from '../components/SortFilter';
import DeleteModal from '../components/DeleteModal';
import { useRouter } from 'next/navigation';

const Trash = () => {
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
      type: 'All',
      modified: 'All',
      source: 'All',
    });
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  const { user, loading: userLoading } = useCurrentUser();
  const router = useRouter();

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      router.replace('/files');
      return;
    }
    if (user.role !== 'admin') router.replace('/files');
  }, [user, router]);

  // Function to trigger the modal from the table
  const handleDeleteClick = (item: FileItem) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const confirmPermanentDelete = async () => {
    if (!selectedItem) return;
    try {
      console.log('Permanently deleting:', selectedItem.id);
      // await axios.delete(`/api/file/${selectedItem.id}/permanent`);
      // Refresh list after delete
      setTrashedFiles((prev) => prev.filter((f) => f.id !== selectedItem.id));
    } catch (error) {
      console.error('Error deleting file:', error);
    } finally {
      setIsDeleteModalOpen(false);
    }
  };

  const handleRestoreClick = async (item: FileItem) => {
    try {
      await axios.post('/api/file/restore', { fileItemId: item.id });
      setTrashedFiles((prev) => prev.filter((f) => f.id !== item.id));
    } catch (error) {
      console.error('Error restoring item:', error);
      alert('Failed to restore item');
    }
  };

  useEffect(() => {
    const getTrashedFiles = async () => {
      try {
        setLoading(true);
        const res = await axios.get('/api/file/trash');
        const files = res.data?.data ?? [];
        const mapped: FileItem[] = files.map((f: any) => {
          if (f.isFolder) {
            return {
              id: f._id,
              name: f.filename,
              type: 'folder',
              author: '_',
              size: '—',
              modified: f.updatedAt ? new Date(f.updatedAt).toDateString() : '—',
              sharedUsers: [],
            };
          }

          const mimeType = f.file?.mimeType ?? '';
          const sizeBytes = f.file?.sizeBytes ?? 0;
          const uploadedBy = f.file?.uploadedBy;

          return {
            id: f._id,
            name: f.filename,
            type: mimeType ? mimeType.split('/')[0] : 'file',
            author: uploadedBy?.name ?? uploadedBy?.email ?? 'SMS',
            size: sizeBytes
              ? `${(sizeBytes / (1024 * 1024)).toFixed(1)} MB`
              : '—',
            modified: f.file?.updatedAt
              ? new Date(f.file.updatedAt).toDateString()
              : '—',
            sharedUsers: [],
          };
        });
        setTrashedFiles(mapped);
      } catch (error) {
        console.error('Error fetching trashed files:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (user.role !== 'admin') {
      setLoading(false);
      return;
    }

    getTrashedFiles();
  }, [user, userLoading]);

  const filteredItems = trashedFiles.filter((file) => {
    // 🔎 SEARCH FILTER
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = file.name.toLowerCase().includes(q);
      const matchesAuthor = file.author.toLowerCase().includes(q);

      if (!matchesName && !matchesAuthor) return false;
    }

    // 📂 TYPE FILTER
    if (filters.type !== 'All') {
      const typeMatch =
        file.type.toLowerCase() === filters.type.toLowerCase();
      if (!typeMatch) return false;
    }

    // 👤 SOURCE FILTER
    if (filters.source !== 'All') {
      if (file.author !== filters.source) return false;
    }

    return true;
  });

  return (
    <Sidenav>
      <Loginnav searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredItems={filteredItems.length} />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-center gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">Trash</h1>
        </div>

        <SortFilters 
        filters={filters}
        setFilters={setFilters}/>

        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="text-gray-500">Loading trash...</div>
          ) : (
            <div className="flex-1 sm:h-full">
              <FileTable
                files={filteredItems}
                onDeleteClick={handleDeleteClick}
                onRestoreClick={handleRestoreClick}
              />
            </div>
          )}
        </div>
      </div>

      <DeleteModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={confirmPermanentDelete}
        itemName={selectedItem?.name}
      />
    </Sidenav>
  );
};

export default Trash;
