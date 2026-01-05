import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface CreateFolderProps {
  parentFolderId: string | null;
  onCreate: (name: string) => void | Promise<void>;
  onCancel: () => void;
  creating?: boolean;
}

const CreateFolder = ({
  parentFolderId,
  onCreate,
  onCancel,
  creating = false,
}: CreateFolderProps) => {
  const [name, setName] = useState("New Folder");

  return (
    <div className="create-folder">
      <Input
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="folder-input"
      />

      <div className="actions flex gap-2 mt-2">
        <Button
          className="px-3 py-1 rounded bg-gray-200 hover:bg-gray-300"
          onClick={onCancel}
          disabled={creating}
        >
          Cancel
        </Button>
        <Button
          className="px-3 py-1 rounded bg-blue-600 text-white hover:bg-blue-700"
          onClick={() => onCreate(name.trim())}
          disabled={!name.trim() || creating}
        >
          {creating ? "Creating..." : "Create"}
        </Button>
      </div>
    </div>
  );
};

export default CreateFolder;
