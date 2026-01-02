'use client';

import { AlertTriangle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogOverlay, // Import Overlay
  DialogPortal,
} from '@/components/ui/dialog';

interface DeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName?: string;
}

const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  itemName,
}: DeleteModalProps) => {
  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}>
      <DialogPortal>
        {/* The Overlay must be present to handle click-outside properly */}
        <DialogOverlay className="fixed inset-0 z-50 bg-black/80" />
        <DialogContent
          className="fixed left-[50%] top-[50%] z-50 w-[95vw] max-w-md translate-x-[-50%] translate-y-[-50%] rounded-2xl border-none bg-[#1A1E26] p-8 text-white shadow-lg duration-200"
          // This prevents the "blocked" feel if the modal closes weirdly
          onInteractOutside={onClose}
          onEscapeKeyDown={onClose}>
          {/* Custom Close Button */}
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 transition-opacity hover:opacity-100 focus:outline-none disabled:pointer-events-none">
            <X className="h-5 w-5 text-gray-400" />
            <span className="sr-only">Close</span>
          </button>

          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border border-gray-600">
              <AlertTriangle className="h-8 w-8 text-white" />
            </div>

            <DialogHeader>
              <DialogTitle className="text-center text-2xl font-bold text-white">
                Permanently Delete Item
              </DialogTitle>
            </DialogHeader>

            <p className="text-center text-gray-400">
              Are you sure you want to delete {itemName || 'items'}?
            </p>

            <div className="flex w-full gap-4 pt-4">
              <Button
                variant="outline"
                onClick={onClose}
                className="flex-1 rounded-lg border-none bg-white py-6 font-semibold text-black hover:bg-gray-200">
                No, I&apos;ll Keep It
              </Button>
              <Button
                onClick={() => {
                  onConfirm();
                }}
                className="flex-1 rounded-lg bg-[#E11D48] py-6 font-semibold text-white hover:bg-[#BE123C]">
                Yes, I&apos;m Sure
              </Button>
            </div>
          </div>
        </DialogContent>
      </DialogPortal>
    </Dialog>
  );
};

export default DeleteModal;
