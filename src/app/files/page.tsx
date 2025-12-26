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

interface FileType {
  _id: string;
  name: string;
  size: number;
  mimetype: string;
  updatedAt: string;
}

const MyFiles = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useCurrentUser();

  const userId = user?._id;
  // console.log('User: ', user);

  useEffect(() => {
    const getFiles = async () => {
      if (!userId) return; // Don't fetch if no user ID

      try {
        setLoading(true);
        const res = await axios.get('/api/file', {
          params: { ownerId: userId },
        });

        console.log('Response Data: ', res.data);
        const files = res.data?.data ?? [];
        console.log('Files: ', files);

        const mapped: FileItem[] = files.map((f: FileType) => ({
          id: f._id,
          name: f.name,
          type: f.mimetype.split('/')[0],
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
        setLoading(false);
      }
    };
    getFiles();
  }, [userId]);

  // console.log('My file: ', MyFiles);

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">My Files</h1>

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

export default MyFiles;

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
