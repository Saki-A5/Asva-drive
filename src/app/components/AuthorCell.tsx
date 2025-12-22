// import React from 'react';
// import { Avatar, AvatarImage } from '@/components/ui/avatar';

// export default function SharingCell({
//   sharing,
//   sharedUsers,
// }: {
//   sharing: string;
//   sharedUsers: string[];
// }) {
//   if (sharedUsers.length === 0) {
//     return <span className="text-muted-foreground">{sharing}</span>;
//   }

//   return (
//     <div className="flex -space-x-2">
//       {sharedUsers.map((img, i) => (
//         <Avatar
//           key={i}
//           className="w-9.5 h-9.5 bg-[#D9D9D9]">
//           <AvatarImage
//             src={img}
//             alt="user"
//           />
//         </Avatar>
//       ))}
//     </div>
//   );
// }

import React from 'react';

export default function AuthorCell({ author }: { author: string }) {
  return <span className="text-muted-foreground">{author}</span>;
}
