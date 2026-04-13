"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import Sidenav from "../components/Sidenav";
import Loginnav from "../components/Loginnav";
import EventCard, { EventCardEvent } from "../components/EventCard";
import useCurrentUser from "@/hooks/useCurrentUser";
import { listCollegesForSelect } from "@/lib/collegeLabels";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type ApiEvent = {
  _id: string;
  name: string;
  description: string;
  collegeName: string;
  collegeId: string;
  eventStart: string;
  eventEnd: string;
  flierPreviewUrl?: string | null;
  flierMimeType?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
};

const formatRange = (start: string, end: string) => {
  const a = new Date(start);
  const b = new Date(end);
  if (Number.isNaN(a.getTime()) || Number.isNaN(b.getTime())) return "";
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
  };
  return `${a.toLocaleDateString(undefined, opts)} – ${b.toLocaleDateString(undefined, opts)}`;
};

const EventsPage = () => {
  const { user, loading: userLoading } = useCurrentUser();
  const [events, setEvents] = useState<EventCardEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [collegeFilter, setCollegeFilter] = useState<string>("all");
  const collegeDefaulted = useRef(false);
  const [sortBy, setSortBy] = useState<"eventStart" | "eventEnd" | "name">(
    "eventStart",
  );
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [createSubmitting, setCreateSubmitting] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletingEventId, setDeletingEventId] = useState<string | null>(null);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const colleges = [
    { id: "all", name: "All colleges" },
    ...listCollegesForSelect(),
  ];

  const fetchEvents = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const params: Record<string, string> = {
        sortBy,
        order,
        collegeId: collegeFilter === "all" ? "all" : collegeFilter,
      };
      const res = await axios.get("/api/events", { params });
      const raw: ApiEvent[] = res.data?.events ?? [];
      const mapped: EventCardEvent[] = raw.map((e) => ({
        id: e._id,
        title: e.name,
        description: e.description || `Runs ${formatRange(e.eventStart, e.eventEnd)}`,
        dateLabel: formatRange(e.eventStart, e.eventEnd),
        collegeName: e.collegeName,
        imageUrl: e.flierPreviewUrl,
        flierMimeType: e.flierMimeType,
        canEdit: Boolean(e.canEdit),
        canDelete: Boolean(e.canDelete),
      }));
      setEvents(mapped);
    } catch (err: unknown) {
      console.error(err);
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, [user, collegeFilter, sortBy, order]);

  useEffect(() => {
    if (userLoading) return;
    if (!user) {
      setLoading(false);
      return;
    }
    if (!collegeDefaulted.current) {
      setCollegeFilter(
        user.role === "admin"
          ? "all"
          : String(user.collegeId ?? "all"),
      );
      collegeDefaulted.current = true;
      return;
    }
    fetchEvents();
  }, [user, userLoading, collegeFilter, sortBy, order, fetchEvents]);

  const onCreateEvent = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setCreateError(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    try {
      setCreateSubmitting(true);
      await axios.post("/api/events", fd);
      form.reset();
      await fetchEvents();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to create event";
      setCreateError(msg);
    } finally {
      setCreateSubmitting(false);
    }
  };

  const onDeleteEvent = async (eventId: string) => {
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    try {
      setDeletingEventId(eventId);
      await axios.delete(`/api/events/${eventId}`);
      await fetchEvents();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to delete event";
      window.alert(msg);
    } finally {
      setDeletingEventId(null);
    }
  };

  const onEditEvent = async (eventId: string) => {
    const current = events.find((e) => e.id === eventId);
    if (!current) return;
    setEditingEventId(eventId);
    setEditName(current.title);
    setEditDescription(current.description ?? "");
    setEditOpen(true);
  };

  const onSubmitEdit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingEventId) return;
    const fd = new FormData();
    fd.append("eventName", editName.trim());
    fd.append("eventDescription", editDescription.trim());
    try {
      setEditSubmitting(true);
      await axios.patch(`/api/events/${editingEventId}`, fd);
      setEditOpen(false);
      setEditingEventId(null);
      await fetchEvents();
    } catch (err: unknown) {
      const msg =
        axios.isAxiosError(err) && err.response?.data?.error
          ? String(err.response.data.error)
          : "Failed to update event";
      window.alert(msg);
    } finally {
      setEditSubmitting(false);
    }
  };

  if (userLoading) {
    return (
      <Sidenav>
        <Loginnav />
        <div className="px-6 py-4 text-muted-foreground">Loading…</div>
      </Sidenav>
    );
  }

  if (!user) {
    return (
      <Sidenav>
        <Loginnav />
        <div className="px-6 py-4">
          <h1 className="font-bold text-xl">Events</h1>
          <p className="text-sm text-muted-foreground mt-2">
            Sign in to view and filter events.
          </p>
        </div>
      </Sidenav>
    );
  }

  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 py-4">
        <div className="mb-6">
          <h1 className="font-bold text-xl whitespace-nowrap">Events</h1>
          <p className="text-sm text-muted-foreground">
            Discover upcoming events. Filter by college and sort by date or
            name.
          </p>
        </div>

        {user.role === "admin" && (
          <section className="mb-8 rounded-xl border border-border p-4 md:p-6 bg-card/50">
            <h2 className="font-semibold text-lg mb-4">Create event</h2>
            <form
              onSubmit={onCreateEvent}
              className="grid gap-4 max-w-xl">
              <div className="grid gap-2">
                <Label htmlFor="eventName">Event name</Label>
                <Input
                  id="eventName"
                  name="eventName"
                  required
                  placeholder="e.g. Welcome week"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventDescription">Description</Label>
                <textarea
                  id="eventDescription"
                  name="eventDescription"
                  required
                  rows={4}
                  className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
                  placeholder="What is this event about?"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="eventStartDate">Start</Label>
                  <Input
                    id="eventStartDate"
                    name="eventStartDate"
                    type="datetime-local"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="eventEndDate">End</Label>
                  <Input
                    id="eventEndDate"
                    name="eventEndDate"
                    type="datetime-local"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="eventFlier">Flier (optional)</Label>
                <Input
                  id="eventFlier"
                  name="eventFlier"
                  type="file"
                  accept="image/*,.pdf"
                />
              </div>
              {createError && (
                <p className="text-sm text-destructive">{createError}</p>
              )}
              <Button
                type="submit"
                disabled={createSubmitting}>
                {createSubmitting ? "Posting…" : "Post event"}
              </Button>
            </form>
          </section>
        )}

        <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6">
          <div className="flex flex-col gap-1 min-w-[200px]">
            <Label htmlFor="collegeFilter">College</Label>
            <select
              id="collegeFilter"
              aria-label="Filter by college"
              title="Filter by college"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={collegeFilter}
              onChange={(e) => setCollegeFilter(e.target.value)}>
              {colleges.map((c) => (
                <option
                  key={c.id}
                  value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[160px]">
            <Label htmlFor="sortBy">Sort by</Label>
            <select
              id="sortBy"
              aria-label="Sort events by"
              title="Sort events by"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={sortBy}
              onChange={(e) =>
                setSortBy(e.target.value as "eventStart" | "eventEnd" | "name")
              }>
              <option value="eventStart">Start date</option>
              <option value="eventEnd">End date</option>
              <option value="name">Name</option>
            </select>
          </div>
          <div className="flex flex-col gap-1 min-w-[140px]">
            <Label htmlFor="order">Order</Label>
            <select
              id="order"
              aria-label="Sort order"
              title="Sort order"
              className="h-10 rounded-md border border-input bg-background px-3 text-sm"
              value={order}
              onChange={(e) => setOrder(e.target.value as "asc" | "desc")}>
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="text-muted-foreground">Loading events…</div>
        ) : events.length === 0 ? (
          <p className="text-sm text-muted-foreground">No events to show.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
            {events.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onEdit={onEditEvent}
                onDelete={onDeleteEvent}
                deleting={deletingEventId === event.id}
              />
            ))}
          </div>
        )}
      </div>
      <Dialog
        open={editOpen}
        onOpenChange={(open) => {
          setEditOpen(open);
          if (!open) {
            setEditingEventId(null);
          }
        }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit event</DialogTitle>
          </DialogHeader>
          <form onSubmit={onSubmitEdit} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="editEventName">Event name</Label>
              <Input
                id="editEventName"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="editEventDescription">Description</Label>
              <textarea
                id="editEventDescription"
                title="Edit event description"
                placeholder="Update event description"
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                required
                rows={4}
                className="min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
            <Button type="submit" disabled={editSubmitting}>
              {editSubmitting ? "Saving..." : "Save changes"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </Sidenav>
  );
};

export default EventsPage;
