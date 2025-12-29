import FileIcon from './Fileicon';

interface FileItemProps {
  file: {
    _id: string;
    name: string;
    mimeType?: string;
  };
}

const FileItem = ({ file }: FileItemProps) => {
  return (
    <div className="file-item flex flex-col items-center cursor-pointer">
      <FileIcon type={file.mimeType?.split('/')[0] || 'file'} isSheetPage={false} />
      <p className="mt-1 text-sm truncate">{file.name}</p>
    </div>
  );
};

export default FileItem;
