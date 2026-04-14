"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type CreateEventDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function CreateEventDialog({
  open,
  onOpenChange,
}: CreateEventDialogProps) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      setSubmitting(true);
      await axios.post("/api/events", fd);
      form.reset();
      onOpenChange(false);
      router.push("/events");
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to create event";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create event</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="dashboard-eventName">Event name</Label>
            <Input
              id="dashboard-eventName"
              name="eventName"
              required
              placeholder="e.g. Welcome week"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dashboard-eventDescription">Description</Label>
            <textarea
              id="dashboard-eventDescription"
              name="eventDescription"
              title="Event description"
              placeholder="What is this event about?"
              required
              rows={4}
              className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="dashboard-eventStartDate">Start</Label>
              <Input
                id="dashboard-eventStartDate"
                name="eventStartDate"
                type="datetime-local"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="dashboard-eventEndDate">End</Label>
              <Input
                id="dashboard-eventEndDate"
                name="eventEndDate"
                type="datetime-local"
                required
              />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="dashboard-eventFlier">Flier (optional)</Label>
            <Input
              id="dashboard-eventFlier"
              name="eventFlier"
              type="file"
              accept="image/*,.pdf"
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" disabled={submitting}>
            {submitting ? "Posting…" : "Post event"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
