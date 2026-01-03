export type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file' | string;
  author: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};
