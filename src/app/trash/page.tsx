'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import FileTable, { FileItem } from '../components/FileTable';
import useCurrentUser from '@/hooks/useCurrentUser';
import SortFilters from '../components/SortFilter';
import DeleteModal from '../components/DeleteModal'; // Assuming you saved the modal here

const Trash = () => {
  const [trashedFiles, setTrashedFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<FileItem | null>(null);

  const { user } = useCurrentUser();
  const userId = user?._id;

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

  useEffect(() => {
    const getTrashedFiles = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        // Update this endpoint to your actual trash endpoint
        // const res = await axios.get('/api/file/trash', {
        //   params: { ownerId: userId },
        // });

        // const files = res.data?.data ?? [];
        // const mapped: FileItem[] = files.map((f: any) => ({
        //   id: f._id,
        //   name: f.name,
        //   type: f.mimeType?.split('/')[0] || 'folder',
        //   author: f.folderName || 'General',
        //   size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
        //   modified: new Date(f.updatedAt).toDateString(),
        //   sharedUsers: [],
        // }));
        // setTrashedFiles(mapped);
      } catch (error) {
        console.error('Error fetching trashed files:', error);
      } finally {
        // MOCK DATA for design preview
        setTrashedFiles([
          {
            id: '1',
            name: 'Past Questions',
            type: 'folder',
            author: 'Sciences',
            size: '1.2GB',
            modified: 'Jun 12, 2025',
            sharedUsers: [],
          },
          {
            id: '2',
            name: 'C#/C++',
            type: 'folder',
            author: 'Engineering',
            size: '2.7GB',
            modified: 'Oct 12, 2025',
            sharedUsers: [],
          },
          {
            id: '3',
            name: 'MATLAB',
            type: 'folder',
            author: 'Sciences',
            size: '5.2GB',
            modified: 'Jan 12, 2026',
            sharedUsers: [],
          },
          {
            id: '4',
            name: 'Previous Work',
            type: 'pdf',
            author: 'Sciences',
            size: '1.0GB',
            modified: 'Nov 8, 2025',
            sharedUsers: [],
          },
          {
            id: '5',
            name: 'AutoCAD Workbook',
            type: 'pdf',
            author: 'Engineering',
            size: '320MB',
            modified: 'Yesterday',
            sharedUsers: [],
          },
        ]);
        setLoading(false);
      }
    };
    getTrashedFiles();
  }, [userId]);

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex justify-between items-center gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">Trash</h1>
        </div>

        <SortFilters />

        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="text-gray-500">Loading trash...</div>
          ) : (
            <div className="flex-1 sm:h-full">
              <FileTable
                files={trashedFiles}
                onDeleteClick={handleDeleteClick}
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
