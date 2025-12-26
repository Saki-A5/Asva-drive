interface PageProps {
  params: { folderId: string };
}

const FolderPage = ({ params }: PageProps) => {
  const folderId = params.folderId;
  // fetch folder contents here
}

export default FolderPage;