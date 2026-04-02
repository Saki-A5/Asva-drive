import FilesView from "@/app/components/FilesView";
import { use } from "react";

interface PageProps {
  params: Promise<{ folderId: string }>;
  searchParams: Promise<{ collegeView?: string }>;
}

export default function FolderPage({ params, searchParams }: PageProps) {
  const { folderId } = use(params);
  const { collegeView } = use(searchParams);

  return (
    <FilesView
      folderId={folderId}
      isCollegeView={collegeView === "1"}
    />
  );
}
