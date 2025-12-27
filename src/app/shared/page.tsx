'use client';

import { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable from '../components/FileTable';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';
import { FileItem } from '../components/FileTable';
import useCurrentUser from '@/hooks/useCurrentUser';

interface FileType {
  _id: string;
  name: string;
  url: string;
  size: number;
  mimetype: string;
  updatedAt: string;
}

const Shared = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const { user} = useCurrentUser();

  const userId = '67a93bc9f92a5b14e25c5123'; // replace later

  useEffect(() => {
    const getFiles = async () => {
      try {
        const res = await fetch(`/api/files?ownerId=${userId}`);
        const data = await res.json();

        if (data?.data) {
          const mapped: FileItem[] = data.data.map((f: FileType) => ({
            id: f._id,
            name: f.name,
            type: f.mimetype.split('/')[0], // "image", "pdf", "video"
            author: 'SMS',
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            modified: new Date(f.updatedAt).toDateString(),
            sharedUsers: [],
          }));

          setMyFiles(mapped);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        // Change this when the cloudhinary from Daniel data has been resolved
        setMyFiles([
          {
            id: '111222',
            name: 'Past Questions',
            type: 'folder',
            author: 'Sciences',
            size: '1.2GB',
            modified: 'Jun 12, 2025',
            sharedUsers: [],
          },
          {
            id: '222333',
            name: 'C#/C++',
            type: 'folder',
            author: 'Sciences',
            size: '2.7GB',
            modified: 'Oct 12, 2025',
            sharedUsers: [],
          },
          {
            id: '333444',
            name: 'MATLAB',
            type: 'folder',
            author: 'Sciences',
            size: '5.2GB',
            modified: 'Jan 12, 2026',
            sharedUsers: [],
          },
          {
            id: '444555',
            name: 'Previous Work',
            type: 'pdf',
            author: 'Sciences',
            size: '1.0GB',
            modified: 'Nov 8, 2025',
            sharedUsers: [],
          },
          {
            id: '555666',
            name: 'AutoCAD Workbook',
            type: 'folder',
            author: 'Sciences',
            size: '320MB',
            modified: 'Yesterday',
            sharedUsers: [],
          },
          {
            id: '666777',
            name: 'Python',
            type: 'folder',
            author: 'Engineering',
            size: '1.2GB',
            modified: 'Apr 27, 2025',
            sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
          },
          {
            id: '777888',
            name: 'Past Questions',
            type: 'folder',
            author: 'Sciences',
            size: '1.2GB',
            modified: 'Jun 12, 2025',
            sharedUsers: [],
          },
          {
            id: '888999',
            name: 'C#/C++',
            type: 'folder',
            author: 'Sciences',
            size: '2.7GB',
            modified: 'Oct 12, 2025',
            sharedUsers: [],
          },
          {
            id: '999000',
            name: 'MATLAB',
            type: 'folder',
            author: 'Sciences',
            size: '5.2GB',
            modified: 'Jan 12, 2026',
            sharedUsers: [],
          },
          {
            id: '112233',
            name: 'Previous Work',
            type: 'pdf',
            author: 'Sciences',
            size: '1.0GB',
            modified: 'Nov 8, 2025',
            sharedUsers: [],
          },
          {
            id: '223344',
            name: 'AutoCAD Workbook',
            type: 'folder',
            author: 'Sciences',
            size: '320MB',
            modified: 'Yesterday',
            sharedUsers: [],
          },
          {
            id: '445566',
            name: 'Python',
            type: 'folder',
            author: 'Engineering',
            size: '1.2GB',
            modified: 'Apr 27, 2025',
            sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
          },
          {
            id: '1122330',
            name: 'Previous Work',
            type: 'pdf',
            author: 'Sciences',
            size: '1.0GB',
            modified: 'Nov 8, 2025',
            sharedUsers: [],
          },
          {
            id: '2233440',
            name: 'AutoCAD Workbook2',
            type: 'folder',
            author: 'Sciences',
            size: '320MB',
            modified: 'Yesterday',
            sharedUsers: [],
          },
          {
            id: '4455660',
            name: 'Python',
            type: 'folder',
            author: 'Engineering',
            size: '1.2GB',
            modified: 'Apr 27, 2025',
            sharedUsers: ['/avatars/user1.png', '/avatars/user2.png'],
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
          <h1 className="font-bold text-xl whitespace-nowrap">Shared</h1>

          <div className="flex space-x-2 gap-y-2">
            {user?.role === 'admin' && <Upload />}
            <Create />
          </div>
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

export default Shared;

const SortFilters = () => {
  const sortType: string[] = ['Type', 'Modified', 'Source', 'Shared'];

  return (
    <div className="my-6 flex flex-wrap gap-x-2 gap-y-3">
      {sortType.map((type) => (
        <Button
          key={type}
          variant="outline"
          className="cursor-pointer">
          <span className="flex gap-2 items-center">
            <span>{type}</span>
            <ChevronDown className="h-5 w-5" />
          </span>
        </Button>
      ))}
    </div>
  );
};
