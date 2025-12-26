import { useState } from "react";

interface CreateFolderProps {
  parentFolderId: string | null;
  onCreate: (name: string) => void;
  onCancel: () => void;
}

const CreateFolder = ({
  parentFolderId,
  onCreate,
  onCancel
}: CreateFolderProps) => {
  const [name, setName] = useState("New Folder");

  return (
    <div className="create-folder">
      <input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="folder-input"
      />

      <div className="actions">
        <button onClick={onCancel}>Cancel</button>
        <button
          onClick={() => onCreate(name.trim())}
          disabled={!name.trim()}
        >
          Create
        </button>
      </div>
    </div>
  );
}

export default CreateFolder;