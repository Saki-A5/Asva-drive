export type FileItem = {
  id: string;
  name: string;
  type: 'folder' | 'file' | string;
  items?: string;
  author: string;
  size: string;
  modified: string;
  sharedUsers: string[];
};
