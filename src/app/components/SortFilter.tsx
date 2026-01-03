import { Button } from '@/components/ui/button';
import { ChevronDown } from 'lucide-react';

const SortFilters = () => {
  const sortType: string[] = ['Type', 'Modified', 'Source', 'Shared'];

  return (
    <div className="my-6 flex flex-nowrap gap-2 overflow-x-auto scrollbar-hide whitespace-nowrap">
      {sortType.map((type) => (
        <Button
          key={type}
          variant="outline"
          className="shrink-0 cursor-pointer">
          <span className="flex gap-2 items-center">
            <span>{type}</span>
            <ChevronDown className="h-5 w-5" />
          </span>
        </Button>
      ))}
    </div>
  );
};

export default SortFilters;
