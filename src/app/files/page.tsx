'use client';

import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import Upload from '../components/Upload';
import Create from '../components/Create';
import FileTable from './FileTable';
import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const Files = () => {
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
          <div>
            <FileTable />
          </div>
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
          variant="outline"
          key={type}
          className="cursor-pointer">
          <span className="flex gap-2">
            <span className="pl-1">{type}</span>
            <span className="flex items-center">
              <ChevronDown className="h-6 w-6" />
            </span>
          </span>
        </Button>
      ))}
    </div>
  );
};
