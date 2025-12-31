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

interface Fileitem {
  _id: string;
  filename: string;
  isFolder: boolean;
  file?: {
    size: number;
    mimeType: string;
    updatedAt: string;
  };
}


const MyFiles = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }

  const { user } = useCurrentUser();

  const userId = user?._id;

  useEffect(() => {
  const getFiles = async () => {
    try {
      setLoading(true);

      const res = await axios.get('/api/file'); 
      const items: Fileitem[] = res.data?.data ?? [];

      const mapped: FileItem[] = items.map((item) => {
        if (item.isFolder) {
          return {
            id: item._id,
            name: item.filename,
            type: 'folder',
            author: 'SMS',
            size: '—',
            modified: '—',
            sharedUsers: [],
          };
        }

        return {
          id: item._id,
          name: item.filename,
          type: item.file?.mimeType.split('/')[0] ?? 'file',
          author: 'SMS',
          size: `${((item.file?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB`,
          modified: item.file?.updatedAt
            ? new Date(item.file.updatedAt).toDateString()
            : '—',
          sharedUsers: [],
        };
      });

      setMyFiles(mapped);
    } catch (error) {
  console.error('Error fetching files:', error);
  // setMyFiles(dummyFiles);
}
finally {
  setLoading(false);
}
  };

  getFiles();
}, []);


  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 flex flex-col flex-1 min-h-0">
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">My Files</h1>

          <div className="hidden sm:flex space-x-2 gap-y-2">
            {user?.role === 'admin' && <Upload />}
            <Create onCreateFolderClick={handleCreateFolder}/>
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

