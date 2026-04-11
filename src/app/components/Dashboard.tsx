'use client';

import { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable from '../components/FileTable';
import { FileItem } from '@/types/File';
import axios from 'axios';
import Floating from '../components/Floating';
import Fileicon from '../components/Fileicon';
import useCurrentUser from '@/hooks/useCurrentUser';

const recentFiles: FileItem[] = [
  {
    id: '1',
    name: 'Python',
    size: '3.2GB',
    items: '12 items',
    type: 'folder',
    author: 'SMS',
    modified: '2024-06-01',
    sharedUsers: [],
  },
  {
    id: '2',
    name: 'AutoCAD Workbook',
    size: '320MB',
    items: 'PDF',
    type: 'pdf',
    author: 'Engineering',
    modified: '2024-05-30',
    sharedUsers: ['user1'],
  },
  {
    id: '3',
    name: 'AutoCAD Workbook',
    size: '320MB',
    items: 'PDF',
    type: 'pdf',
    author: 'Engineering',
    modified: '2024-05-29',
    sharedUsers: ['user2'],
  },
  {
    id: '4',
    name: 'AutoCAD Workbook',
    size: '320MB',
    items: 'PDF',
    type: 'pdf',
    author: 'SMS',
    modified: '2024-05-28',
    sharedUsers: [],
  },
];

const Dashboard = () => {
  const { user, loading } = useCurrentUser();
  const [starredFiles, setStarredFiles] = useState<FileItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`/api/file`, { withCredentials: true });
        const files: File[] = res.data.data;

        const data = files
          .filter((file: any) => file.starred)
          .map((file: any) => ({
            id: file._id ?? '',
            name: file.name ?? '',
            type: file.mimeType ? file.mimeType.split('/')[0] : '',
            size: file.size
              ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
              : '',
            items: '',
            author: 'SMS',
            modified: file.updatedAt
              ? new Date(file.updatedAt).toDateString()
              : '',
            sharedUsers: [],
          }));

        const limitedData = data.slice(0, 7);
        setStarredFiles(limitedData);
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        // setLoading(false);
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
            <Create onCreateFolderClick={handleCreateFolder} />
          </div>
          <Floating />
        </div>

        <div className="flex flex-col gap-8 flex-1 min-h-0">
          <section className="md:border pt-4 md:p-4 rounded-xl border-border/100 bg-card shrink-0">
            <h2 className="text-lg font-bold mb-3 md:px-2">Recent Files</h2>

            {recentFiles.length > 0 ? (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {recentFiles.map((file, index) => (
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
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Recent files show here
              </p>
            )}
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
    </Sidenav>
  );
};

export default Dashboard;
