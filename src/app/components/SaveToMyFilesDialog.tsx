"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Folder,
  FolderPlus,
  ChevronRight,
  Loader2,
  BookmarkPlus,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FolderOption {
  _id: string;
  filename: string;
}

interface SaveToMyFilesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceFileItemId: string;
  sourceFileName: string;
}

type DialogStep = "pick" | "new-folder" | "saving" | "done" | "error";

export function SaveToMyFilesDialog({
  open,
  onOpenChange,
  sourceFileItemId,
  sourceFileName,
}: SaveToMyFilesDialogProps) {
  const [step, setStep] = useState<DialogStep>("pick");
  const [folders, setFolders] = useState<FolderOption[]>([]);
  const [loadingFolders, setLoadingFolders] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // New folder creation state
  const [newFolderName, setNewFolderName] = useState("");
  const [creatingFolder, setCreatingFolder] = useState(false);
  const [folderError, setFolderError] = useState("");

  // Save state
  const [errorMessage, setErrorMessage] = useState("");

  // Load user's folders whenever the dialog opens─
  useEffect(() => {
    if (!open) return;

    // Reset to initial state every time dialog opens
    setStep("pick");
    setSelectedFolderId(null);
    setNewFolderName("");
    setFolderError("");
    setErrorMessage("");

    const fetchFolders = async () => {
      setLoadingFolders(true);
      try {
        // Reuses the existing GET /api/file endpoint but we only want folders.
        // If you have a dedicated /api/file/folders endpoint, swap this out.
        const res = await axios.get("/api/file/folder");
        setFolders(res.data.data ?? []);
      } catch {
        // Non-fatal: user can still save to root
        setFolders([]);
      } finally {
        setLoadingFolders(false);
      }
    };

    fetchFolders();
  }, [open]);

  // Create a new folder then auto-select it─
  const handleCreateFolder = async () => {
    if (!newFolderName.trim()) {
      setFolderError("Please enter a folder name.");
      return;
    }
    setCreatingFolder(true);
    setFolderError("");
    try {
      const res = await axios.post("/api/file/folder", {
        folderName: newFolderName.trim(),
        parentFolderId: null, // create in root
      });
      const created: FolderOption = {
        _id: res.data.data.folderId,
        filename: newFolderName.trim(),
      };
      setFolders((prev) => [...prev, created]);
      setSelectedFolderId(created._id);
      setStep("pick");
      setNewFolderName("");
    } catch (e: any) {
      setFolderError(
        e?.response?.data?.message ?? "Failed to create folder. Try again.",
      );
    } finally {
      setCreatingFolder(false);
    }
  };

  // Save the file reference─
  const handleSave = async () => {
    setStep("saving");
    try {
      await axios.post("/api/file/bookmark", {
        sourceFileItemId,
        targetFolderId: selectedFolderId ?? undefined,
      });
      setStep("done");
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? "Something went wrong. Please try again.";
      setErrorMessage(msg);
      setStep("error");
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  // Render
  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-[420px]"
        onCloseAutoFocus={(e) => {
          // Prevent Radix returning focus to the dropdown trigger button,
          // which sits inside an aria-hidden ancestor while the dialog is
          // still tearing down — that causes the aria-hidden/focus warning.
          e.preventDefault();
          (document.activeElement as HTMLElement)?.blur();
        }}>
        {/* Pick / select folder step */}
        {(step === "pick" || step === "saving") && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <BookmarkPlus className="w-5 h-5 text-primary" />
                Save to My Files
              </DialogTitle>
              <p className="text-sm text-muted-foreground pt-1">
                Choose where to save{" "}
                <span className="font-medium text-foreground truncate">
                  &ldquo;{sourceFileName}&rdquo;
                </span>
              </p>
            </DialogHeader>

            <div className="flex flex-col gap-1 max-h-[240px] overflow-y-auto pr-1 my-2">
              {/* Root / My Files option */}
              <FolderRow
                id={null}
                name="My Files (root)"
                selected={selectedFolderId === null}
                onSelect={() => setSelectedFolderId(null)}
              />

              {loadingFolders ? (
                <div className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Loading folders...
                </div>
              ) : (
                folders.map((f) => (
                  <FolderRow
                    key={f._id}
                    id={f._id}
                    name={f.filename}
                    selected={selectedFolderId === f._id}
                    onSelect={() => setSelectedFolderId(f._id)}
                  />
                ))
              )}
            </div>

            {/* New folder button */}
            <button
              onClick={() => setStep("new-folder")}
              className="flex items-center gap-2 text-sm text-primary hover:text-primary-foreground self-start cursor-pointer">
              <FolderPlus className="w-4 h-4" />
              Create new folder
            </button>

            <DialogFooter className="mt-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                disabled={step === "saving"}>
                Cancel
              </Button>
              <Button
                className="cursor-pointer"
                onClick={handleSave}
                disabled={step === "saving"}>
                {step === "saving" ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  "Save here"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* New folder step */}
        {step === "new-folder" && (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <FolderPlus className="w-5 h-5 text-primary" />
                New Folder
              </DialogTitle>
              <p className="text-sm text-muted-foreground pt-1">
                This folder will be created in the root of your My Files.
              </p>
            </DialogHeader>

            <div className="my-3 flex flex-col gap-2">
              <Input
                placeholder="Folder name"
                value={newFolderName}
                onChange={(e) => {
                  setNewFolderName(e.target.value);
                  setFolderError("");
                }}
                onKeyDown={(e) => e.key === "Enter" && handleCreateFolder()}
                autoFocus
              />
              {folderError && (
                <p className="text-xs text-red-500">{folderError}</p>
              )}
            </div>

            <DialogFooter>
              <Button
                className="cursor-pointer"
                variant="ghost"
                onClick={() => setStep("pick")}
                disabled={creatingFolder}>
                Back
              </Button>
              <Button
                className="cursor-pointer"
                onClick={handleCreateFolder}
                disabled={creatingFolder}>
                {creatingFolder ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  "Create folder"
                )}
              </Button>
            </DialogFooter>
          </>
        )}

        {/* Success step */}
        {step === "done" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Check className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="font-semibold text-base">Saved to My Files</p>
              <p className="text-sm text-muted-foreground mt-1">
                You can find it in{" "}
                {selectedFolderId
                  ? `"${folders.find((f) => f._id === selectedFolderId)?.filename ?? "your folder"}"`
                  : "the root of My Files"}
                .
              </p>
            </div>
            <Button
              onClick={handleClose}
              className="mt-2 w-full max-w-[200px] cursor-pointer">
              Done
            </Button>
          </div>
        )}

        {/* Error step */}
        {step === "error" && (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <p className="text-sm text-red-500">{errorMessage}</p>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                onClick={handleClose}
                className="cursor-pointer">
                Close
              </Button>
              <Button
                onClick={() => setStep("pick")}
                className="cursor-pointer">
                Try again
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

// Small helper sub-component
function FolderRow({
  id,
  name,
  selected,
  onSelect,
}: {
  id: string | null;
  name: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm transition-colors text-left cursor-pointer",
        selected
          ? "bg-primary/10 text-primary font-medium"
          : "hover:bg-muted text-foreground",
      )}>
      <Folder
        className={cn(
          "w-4 h-4 flex-shrink-0",
          selected ? "text-primary" : "text-muted-foreground",
        )}
      />
      <span className="flex-1 truncate">{name}</span>
      {selected && <Check className="w-4 h-4 text-primary flex-shrink-0" />}
    </button>
  );
}
