'use client';

import { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import CreateEventDialog from '../components/CreateEventDialog';
import FileTable from '../components/FileTable';
import { FileItem } from '@/types/File';
import axios from 'axios';
import Floating from '../components/Floating';
import Fileicon from '../components/Fileicon';
import useCurrentUser from '@/hooks/useCurrentUser';

const Dashboard = () => {
  const { user, loading } = useCurrentUser();
  const [recentFiles, setRecentFiles] = useState<FileItem[]>([]);
  const [starredFiles, setStarredFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [createEventOpen, setCreateEventOpen] = useState(false);
  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        // Fetch starred files (max 8, most recent first)
        const starredRes = await axios.get(`/api/starred`, { withCredentials: true });
        const starredFileItems = starredRes.data.data || [];

        const starredData = starredFileItems
          .slice(0, 8)
          .map((fileItem: any) => ({
            id: fileItem._id ?? '',
            name: fileItem.filename ?? '',
            type: fileItem.isFolder ? 'folder' : (fileItem.file?.mimeType ? fileItem.file.mimeType.split('/')[0] : ''),
            size: fileItem.file?.sizeBytes
              ? `${(fileItem.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
              : '',
            items: '',
            author: 'SMS',
            modified: fileItem.updatedAt
              ? new Date(fileItem.updatedAt).toDateString()
              : '',
            sharedUsers: [],
          }));

        setStarredFiles(starredData);

        // Fetch recently opened/modified files
        const recentRes = await axios.get(`/api/recent`, { withCredentials: true });
        const recentFileItems = recentRes.data.data || [];

        const recentData = recentFileItems
          .slice(0, 4)
          .map((fileItem: any) => ({
            id: fileItem._id ?? '',
            name: fileItem.filename ?? '',
            type: fileItem.isFolder ? 'folder' : (fileItem.file?.mimeType ? fileItem.file.mimeType.split('/')[0] : ''),
            size: fileItem.file?.sizeBytes
              ? `${(fileItem.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
              : '',
            items: '',
            author: 'SMS',
            modified: fileItem.updatedAt
              ? new Date(fileItem.updatedAt).toDateString()
              : '',
            sharedUsers: [],
          }));

        setRecentFiles(recentData);
      } catch (error) {
        console.error('Error fetching files:', error);
      }
    };

    fetchFiles();
  }, []);

  if (loading) return null;

  const filteredItems = starredFiles.filter((file) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesName = file.name.toLowerCase().includes(q);
      const matchesAuthor = file.author.toLowerCase().includes(q);
      if (!matchesName && !matchesAuthor) return false;
    }
    return true;
  });

  return (
    <Sidenav>
      <Loginnav searchQuery={searchQuery} setSearchQuery={setSearchQuery} filteredItems={filteredItems.length} />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">
            Welcome to the hub
          </h1>

          <div className="sm:flex space-x-2 px-2 lg:px-6 mb-6 hidden">
            {user?.role === 'admin' && <Upload />}
            <Create
              onCreateFolderClick={handleCreateFolder}
              onCreateEventClick={
                user?.role === "admin"
                  ? () => setCreateEventOpen(true)
                  : undefined
              }
            />
          </div>
          <Floating />
        </div>

        <div className="flex flex-col gap-8 flex-1 min-h-0">
          <section className="md:border pt-4 md:p-4 rounded-xl border-border/100 bg-card shrink-0">
            <h2 className="text-lg font-bold mb-3 md:px-2">Recent Files</h2>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {recentFiles.length > 0 ? (
                recentFiles.map((file, index) => (
                  <div
                    key={index}
                    className="flex flex-col items-start p-4 border rounded-xl bg-white dark:bg-neutral-900 shadow-sm hover:shadow-md transition">
                    <Fileicon
                      type={file.type}
                      isSheetPage={false}
                    />
                    <h3 className="font-semibold text-sm truncate w-full">
                      {file.name}
                    </h3>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {file.size}
                      <span className="mx-1">.</span>
                      {file.items}
                    </p>
                  </div>
                ))
              ) : (
                <>
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={`placeholder-${index}`}
                      className="flex flex-col items-start p-4 border border-dashed rounded-xl bg-gray-50 dark:bg-neutral-800 border-gray-300 dark:border-neutral-600 min-h-[120px] justify-center items-center">
                      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
                        {index === 0 ? 'Open files to see them here' : ''}
                      </p>
                    </div>
                  ))}
                </>
              )}
            </div>
          </section>

          <div className="flex flex-col flex-1 min-h-0">
            {loading ? (
              <div className="text-gray-500">Loading files...</div>
            ) : (
              <div className="flex-1 sm:h-full">
                <FileTable
                  files={filteredItems}
                  header="Starred"
                />
              </div>
            )}
          </div>
        </div>
      </div>
      <CreateEventDialog
        open={createEventOpen}
        onOpenChange={setCreateEventOpen}
      />
    </Sidenav>
  );
};

export default Dashboard;
