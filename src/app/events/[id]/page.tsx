"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useParams } from "next/navigation";
import Sidenav from "@/app/components/Sidenav";
import Loginnav from "@/app/components/Loginnav";
import { Button } from "@/components/ui/button";
import { collegeIdToName } from "@/lib/collegeLabels";

export default function EventDetailPage() {
  const params = useParams();
  const id = params?.id as string | undefined;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [collegeName, setCollegeName] = useState("");
  const [start, setStart] = useState("");
  const [end, setEnd] = useState("");
  const [flierUrl, setFlierUrl] = useState<string | null>(null);
  const [showFlierAsImage, setShowFlierAsImage] = useState(true);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const { data } = await axios.get(`/api/events/${id}`);
        const ev = data.event;
        if (!ev) {
          setError("Event not found");
          return;
        }
        setName(ev.name);
        setDescription(ev.description ?? "");
        setCollegeName(collegeIdToName(ev.collegeId));
        setStart(
          ev.eventStart
            ? new Date(ev.eventStart).toLocaleString()
            : "",
        );
        setEnd(ev.eventEnd ? new Date(ev.eventEnd).toLocaleString() : "");
        setFlierUrl(data.url ?? null);
        setShowFlierAsImage(true);
      } catch (e: unknown) {
        setError("Could not load this event.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <Sidenav>
      <Loginnav />
      <div className="px-6 py-4 max-w-3xl">
        <Button
          variant="ghost"
          className="mb-4 -ml-2"
          asChild>
          <Link href="/events">← Back to events</Link>
        </Button>

        {loading && <p className="text-muted-foreground">Loading…</p>}
        {error && <p className="text-destructive">{error}</p>}
        {!loading && !error && (
          <>
            <h1 className="text-2xl font-bold mb-2">{name}</h1>
            <p className="text-sm text-muted-foreground mb-6">{collegeName}</p>
            <p className="text-sm mb-6 whitespace-pre-wrap">
              {description || "No description provided for this event."}
            </p>
            <div className="space-y-2 text-sm mb-6">
              <p>
                <span className="font-medium">Starts:</span> {start}
              </p>
              <p>
                <span className="font-medium">Ends:</span> {end}
              </p>
            </div>
            {flierUrl && showFlierAsImage && (
              <div className="rounded-lg border overflow-hidden bg-muted">
                <img
                  src={flierUrl}
                  alt="Event flier"
                  className="w-full max-h-[70vh] object-contain"
                  onError={() => setShowFlierAsImage(false)}
                />
              </div>
            )}
            {flierUrl && !showFlierAsImage && (
              <Button asChild variant="outline">
                <a href={flierUrl} target="_blank" rel="noreferrer">
                  Open flier
                </a>
              </Button>
            )}
          </>
        )}
      </div>
    </Sidenav>
  );
}
