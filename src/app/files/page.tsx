// 'use client';

// import { useEffect, useState } from 'react';
// import axios from 'axios';
// import Sidenav from '../components/Sidenav';
// import Loginnav from '../components/Loginnav';
// import Upload from '../components/Upload';
// import Create from '../components/Create';
// import FileTable from '../components/FileTable';
// import { Button } from '@/components/ui/button';
// import useCurrentUser from '@/hooks/useCurrentUser';
// import Floating from '../components/Floating';
// import SortFilters from '../components/SortFilter';
// import CreateFolder from '../components/CreateFolder';
// import { FileItem } from '@/types/File';

// interface Fileitem {
//   _id: string;
//   filename: string;
//   isFolder: boolean;
//   file?: {
//     size: number;
//     mimeType: string;
//     updatedAt: string;
//   };
// }

// interface MyFilesProps {
//   folderId: string;
// }

// const MyFiles = ({ folderId }: MyFilesProps) => {
//   const [myFiles, setMyFiles] = useState<FileItem[]>([]);
//   const [loading, setLoading] = useState(true);

//   const [showCreateFolder, setShowCreateFolder] = useState(false);
//   const [creating, setCreating] = useState(false);

//   const { user } = useCurrentUser();

//   const getFiles = async () => {
//     try {
//       setLoading(true);
//       const res = await axios.get('/api/file'); 
//       const items: Fileitem[] = res.data?.data ?? [];

//       const mapped: FileItem[] = items.map((item) => {
//         if (item.isFolder) {
//           return {
//             id: item._id,
//             name: item.filename,
//             type: 'folder',
//             author: 'SMS',
//             size: '—',
//             modified: '—',
//             sharedUsers: [],
//           };
//         }

//         return {
//           id: item._id,
//           name: item.filename,
//           type: item.file?.mimeType.split('/')[0] ?? 'file',
//           author: 'SMS',
//           size: `${((item.file?.size ?? 0) / (1024 * 1024)).toFixed(1)} MB`,
//           modified: item.file?.updatedAt
//             ? new Date(item.file.updatedAt).toDateString()
//             : '—',
//           sharedUsers: [],
//         };
//       });

//       setMyFiles(mapped);
//     } catch (error) {
//       console.error('Error fetching files:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     getFiles();
//   }, []);

//   // --------------- FOLDER CREATION ----------------

//   // Show input when user clicks "Create → Folder"
//   const handleCreateFolderClick = () => {
//     setShowCreateFolder(true);
//   };

//   // Call API to create folder
//   const handleCreateFolder = async (name: string) => {
//     if (!name || !user) return;

//     setCreating(true);

//     try {
//       const res = await axios.post('/api/file/folder', {
//         folderName: name,
//         parentFolderId: folderId || null,
//       });

//       console.log('Folder created:', res.data);

//       // Refresh file list
//       await getFiles();
//     } catch (err) {
//       console.error('Error creating folder:', err);
//     } finally {
//       setCreating(false);
//       setShowCreateFolder(false);
//     }
//   };

//   return (
//     <Sidenav>
//       <Loginnav />

//       <div className="px-6 flex flex-col flex-1 min-h-0">
//         <div className="flex-between gap-2">
//           <h1 className="font-bold text-xl whitespace-nowrap">My Files</h1>

//           <div className="hidden sm:flex space-x-2 gap-y-2">
//             {user?.role === 'admin' && <Upload />}
//             <Create
//               onCreateFolderClick={handleCreateFolderClick}
//               creating={creating}
//             />
//           </div>

//           <Floating />
//         </div>

//         <SortFilters />

//         {/* Show folder input if clicked */}
//         {showCreateFolder && (
//           <div className="mt-4">
//             <CreateFolder
//               parentFolderId={folderId || null}
//               onCreate={handleCreateFolder}
//               onCancel={() => setShowCreateFolder(false)}
//               creating={creating}
//             />
//           </div>
//         )}

//         {/* File Table */}
//         <div className="space-y-8 flex-1 min-h-0 mt-6">
//           {loading ? (
//             <div className="text-gray-500">Loading files...</div>
//           ) : (
//             <div className="flex-1 sm:h-full">
//               <FileTable files={myFiles} />
//             </div>
//           )}
//         </div>
//       </div>
//     </Sidenav>
//   );
// };

// export default MyFiles;

import FilesView from '@/app/components/FilesView';

export default function MyFilesPage() {
  return <FilesView />;
}
