'use client';
import { Button } from '@/components/ui/button';
import { ChevronDown, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { COLLEGE_META } from '@/lib/college';

// Define the filter state interface
export interface FilterState {
  type: string;
  modified: string;
  source: string;
  customRange?: { from: Date; to: Date };
}

interface SortFiltersProps {
  filters: FilterState;
  setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
}

const SortFilters = ({ filters, setFilters }: SortFiltersProps) => {
  const fileTypes = [
    'All',
    'Folder',
    'Image',
    'Video',
    'PDF',
    'Audio',
    'Document',
  ];
  const dateOptions = ['All', 'Last 7 days', 'Last 14 days', 'Custom Range'];
  const colleges = [
    'All',
    ...Object.values(COLLEGE_META).map((c) => c.slug.toUpperCase()),
  ];

  const updateFilter = (key: keyof FilterState, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="my-6 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.type !== 'All' ? 'border-primary bg-primary/5' : ''
            }`}>
            Type: {filters.type} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {fileTypes.map((t) => (
            <DropdownMenuItem
              key={t}
              onClick={() => updateFilter('type', t)}>
              {t} {filters.type === t && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.modified !== 'All' ? 'border-primary bg-primary/5' : ''
            }`}>
            Modified: {filters.modified}{' '}
            <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {dateOptions.map((d) => (
            <DropdownMenuItem
              key={d}
              onClick={() => updateFilter('modified', d)}>
              {d}{' '}
              {filters.modified === d && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            className={`shrink-0 ${
              filters.source !== 'All' ? 'border-primary bg-primary/5' : ''
            }`}>
            Source: {filters.source} <ChevronDown className="ml-2 h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="max-h-64 overflow-y-auto">
          {colleges.map((c) => (
            <DropdownMenuItem
              key={c}
              onClick={() => updateFilter('source', c)}>
              {c}{' '}
              {filters.source === c && <Check className="ml-auto h-4 w-4" />}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default SortFilters;
