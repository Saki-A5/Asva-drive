import { Breadcrumb, BreadcrumbItem } from "@/components/ui/breadcrumb";
import { ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

interface Folder {
  _id: string;
  name: string;
}

interface BreadcrumbsProps {
  folders: Folder[];
}

const Breadcrumbs = ({ folders }: BreadcrumbsProps) => {
  const router = useRouter();

  return (
    <Breadcrumb>
  <BreadcrumbItem onClick={() => router.push("/files")}>My Files</BreadcrumbItem>
  {folders.map((f) => (
    <BreadcrumbItem
      key={f._id}
      onClick={() => router.push(`/files/folder/${f._id}`)}
    >
      {f.name}
    </BreadcrumbItem>
  ))}
</Breadcrumb>
  );
};

export default Breadcrumbs;
