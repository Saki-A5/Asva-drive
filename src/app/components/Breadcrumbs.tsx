import { Breadcrumb, BreadcrumbItem, BreadcrumbList, BreadcrumbSeparator, BreadcrumbLink, BreadcrumbPage } from "@/components/ui/breadcrumb";
import { useRouter } from "next/navigation";

interface Folder {
  _id: string;
  filename: string;
}

interface BreadcrumbsProps {
  folders: Folder[];
}

const Breadcrumbs = ({ folders }: BreadcrumbsProps) => {
  const router = useRouter();

  if (!folders || folders.length === 0) return null;
  const fullPath = [{ _id: 'root', filename: 'My Files' }, ...folders.filter(folder => folder.filename !== '/')];
  return (
    <Breadcrumb >
    <BreadcrumbList className="flex items-center gap-1">
    {fullPath.map((folder, index) => {
      const isLast = index === fullPath.length - 1

      return (
        <span key={folder._id} className="flex items-center gap-1">
          <BreadcrumbItem>{isLast ? (
            <BreadcrumbPage className="font-semibold">
              {folder.filename}
              </BreadcrumbPage>
              ) : (
            <BreadcrumbLink
              onClick={() => {
                if (folder._id === 'root') {
              router.push('/files')
            } else {
              router.push(`/files/folder/${folder._id}`)
            }
              }}>
              {folder.filename}
              </BreadcrumbLink>
          )}
          </BreadcrumbItem>
          {!isLast && (<BreadcrumbSeparator><span className="mx-1">{'>'}</span></BreadcrumbSeparator>)}
        </span>
      );
    })}
    </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
