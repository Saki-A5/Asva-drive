import FilesView from '@/app/components/FilesView';
import { use } from 'react';

interface PageProps {
  params: Promise<{ folderId: string }>;
}
export default function FolderPage({ params }: PageProps) {
  const { folderId } = use(params);

  return <FilesView folderId={folderId} />;
}
