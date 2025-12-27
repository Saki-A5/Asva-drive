import { useRouter } from "next/navigation";
import Fileicon from './Fileicon';


interface FolderItemProps {
  folder: { _id: string; name: string };
  isSheetPage?: boolean;
}

const FolderItem = ({ folder, isSheetPage = false }: FolderItemProps) => {
  return (
    <div className="folder-item flex flex-col items-center cursor-pointer">
      <Fileicon type="folder" isSheetPage={isSheetPage} />
      <p className="mt-1 text-sm">{folder.name}</p>
    </div>
  );
}

export default FolderItem;

