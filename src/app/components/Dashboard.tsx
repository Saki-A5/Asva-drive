'use client';

import { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable from '../components/FileTable';
import { FileItem } from '../components/FileTable';
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

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const res = await axios.get(`/api/file`, {withCredentials: true});
        const files: File[] = res.data.data;

        const data = files
          .filter((file: any) => file.starred)
          .map((file: any) => ({
            id: file._id ?? '',
            name: file.name ?? '',
            type: file.mimetype ? file.mimetype.split('/')[0] : '',
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
        setStarredFiles([
          {
            id: '111222',
            name: 'Past Questions',
            type: 'folder',
            author: 'Sciences',
            size: '1.2GB',
            items: '10 items',
            modified: 'Jun 12, 2025',
            sharedUsers: [],
          },
          {
            id: '222333',
            name: 'C#/C++',
            type: 'folder',
            author: 'Sciences',
            size: '2.7GB',
            items: '8 items',
            modified: 'Oct 12, 2025',
            sharedUsers: [],
          },
          {
            id: '333444',
            name: 'MATLAB',
            type: 'folder',
            author: 'Sciences',
            size: '5.2GB',
            items: '15 items',
            modified: 'Jan 12, 2026',
            sharedUsers: [],
          },
          {
            id: '444555',
            name: 'Previous Work',
            type: 'pdf',
            author: 'Sciences',
            size: '1.0GB',
            items: 'PDF',
            modified: 'Nov 8, 2025',
            sharedUsers: [],
          },
          {
            id: '555666',
            name: 'AutoCAD Workbook',
            type: 'folder',
            author: 'Sciences',
            size: '320MB',
            items: '5 items',
            modified: 'Yesterday',
            sharedUsers: [],
          },
          {
            id: '666777',
            name: 'Python',
            type: 'folder',
            author: 'Engineering',
            size: '1.2GB',
            items: '12 items',
            modified: 'Apr 27, 2025',
            sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
          },
          {
            id: '777888',
            name: 'Past Questions',
            type: 'folder',
            author: 'Sciences',
            size: '1.2GB',
            items: '10 items',
            modified: 'Jun 12, 2025',
            sharedUsers: [],
          },
        ]);
      }
    };

    fetchFiles();
  }, []);

  if (loading) return null;

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">
            Welcome to the hub
          </h1>

          <div className="sm:flex space-x-2 px-2 lg:px-6 mb-6 hidden">
            {user?.role === 'admin' && <Upload />}
            <Create />
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
                  files={starredFiles}
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
