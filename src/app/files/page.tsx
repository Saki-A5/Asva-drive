'use client';

import { useEffect, useState } from 'react';
import axios from 'axios';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable, { FileItem } from '../components/FileTable';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import useCurrentUser from '@/hooks/useCurrentUser';
import Floating from '../components/Floating';
import SortFilters from '../components/SortFilter';

interface FileType {
  _id: string;
  name: string;
  size: number;
  mimeType: string;
  updatedAt: string;
}

const MyFiles = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useCurrentUser();

  const userId = user?._id;

  useEffect(() => {
    const getFiles = async () => {
      if (!userId) return; // Don't fetch if no user ID

      try {
        setLoading(true);
        const res = await axios.get('/api/file', {
          params: { ownerId: userId },
        });

        const files = res.data?.data ?? [];

        const mapped: FileItem[] = files
          .filter((f: FileType | null | undefined) => f && f.mimeType)
          .map((f: FileType) => ({
            id: f._id,
            name: f.name,
            type: f.mimeType.split('/')[0],
            author: 'SMS',
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            modified: new Date(f.updatedAt).toDateString(),
            sharedUsers: [],
          }));
        setMyFiles(mapped);
      } catch (error) {
        console.error('Error fetching files:', error);
        // Optionally show error to user
      } finally {
        setMyFiles([
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

        setLoading(false);
      }
    };
    getFiles();
  }, [userId]);

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">My Files</h1>

          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === 'admin' && <Upload />}
            <Create />
          </div>
          <Floating />
        </div>

        <SortFilters />

        <div className="space-y-8 flex-1 min-h-0 mt-6">
          {loading ? (
            <div className="text-gray-500">Loading files...</div>
          ) : (
            <div className="flex-1 sm:h-full">
              <FileTable files={myFiles} />
            </div>
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default MyFiles;
