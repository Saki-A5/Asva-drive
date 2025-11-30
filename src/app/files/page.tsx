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

interface FileType {
  _id: string;
  name: string;
  url: string;
  size: number;
  mimetype: string;
  updatedAt: string;
}

const Files = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);

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
            sharing: 'Private',
            size: `${(f.size / (1024 * 1024)).toFixed(1)} MB`,
            modified: new Date(f.updatedAt).toDateString(),
            sharedUsers: [],
          }));

          setMyFiles(mapped);
        }
      } catch (error) {
        console.error('Error fetching files:', error);
      } finally {
        setLoading(false);
      }
    };

    getFiles();
  }, [userId]);

  return (
    <Sidenav>
      <Loginnav />
      <div>
        <div className="flex-between">
          <h1 className="px-6 font-bold text-xl">My Files</h1>

          <div className="flex space-x-2">
            <Upload />
            <Create />
          </div>
        </div>

        <SortFilters />

        <div className="px-6 space-y-8">
          {loading ? (
            <div className="text-gray-500">Loading files...</div>
          ) : (
            <FileTable files={myFiles} />
          )}
        </div>
      </div>
    </Sidenav>
  );
};

export default Files;

const SortFilters = () => {
  const sortType: string[] = ['Type', 'Modified', 'Source', 'Shared'];

  return (
    <div className="px-6 my-6 flex gap-2">
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
