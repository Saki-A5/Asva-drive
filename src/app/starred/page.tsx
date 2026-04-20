'use client';

import { useEffect, useState } from 'react';
import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable from '../components/FileTable';
import { FileItem } from '@/types/File';
import SortFilters, {FilterState} from '../components/SortFilter';
import axios from 'axios';

const Starred = () => {
  const [myFiles, setMyFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<FilterState>({
      type: 'All',
      modified: 'All',
      source: 'All',
    });
  const handleCreateFolder = () => {
    console.log('Create folder clicked');
  }

  const userId = '67a93bc9f92a5b14e25c5123'; // replace later

  useEffect(() => {
    const getFiles = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`/api/starred`, { withCredentials: true });
        const starredFileItems = res.data?.data ?? [];

        const mapped: FileItem[] = starredFileItems.map((f: any) => ({
          id: f._id,
          name: f.filename,
          type: f.isFolder ? 'folder' : (f.file?.mimeType ? f.file.mimeType.split('/')[0] : 'file'),
          author: f.file?.uploadedBy?.name || f.file?.uploadedBy?.email || 'SCIENCES',
          size: f.file?.sizeBytes
            ? `${(f.file.sizeBytes / (1024 * 1024)).toFixed(1)} MB`
            : '—',
          modified: f.updatedAt
            ? new Date(f.updatedAt).toDateString()
            : '',
          sharedUsers: [],
        }));

        setMyFiles(mapped);
      } catch (error) {
        console.error('Error fetching starred files:', error);
        setMyFiles([]);
      } finally {
        setLoading(false);
      }
    };

    getFiles();
  }, []);

  const filteredItems = myFiles.filter((file) => {
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
        <div className="flex-between gap-2">
          <h1 className="font-bold text-xl whitespace-nowrap">Starred</h1>

          <div className="flex space-x-2 gap-y-2">
            <Upload />
            <Create onCreateFolderClick={handleCreateFolder}/>
          </div>
        </div>

        <SortFilters 
        filters={filters}
          setFilters={setFilters}/>

        <div className="space-y-8 flex-1 min-h-0 mt-6">
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
    </Sidenav>
  );
};

export default Starred;
