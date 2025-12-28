import React from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';

const getInitials = (name: string | null | undefined) => {
  if (!name) return 'U'; // Default initials
  const names = name.trim().split(' ');
  if (names.length === 1) return names[0][0].toUpperCase();
  return (names[0][0] + names[names.length - 1][0]).toUpperCase();
};

export default function AuthorCell({ author }: { author: string }) {
  const initials = getInitials(author);

  return (
    <div className="flex items-center gap-2">
      <Avatar className="w-8 h-8">
        <AvatarFallback className="bg-primary text-primary-foreground text-xs font-semibold">
          {initials}
        </AvatarFallback>
      </Avatar>
      <span className="text-muted-foreground text-sm">{author}</span>
    </div>
  );
}
