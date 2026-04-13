import Link from "next/link";
import { MouseEvent, useState } from "react";

export type EventCardEvent = {
  id: string;
  title: string;
  description: string;
  dateLabel: string;
  collegeName: string;
  imageUrl?: string | null;
  flierMimeType?: string | null;
  canEdit?: boolean;
  canDelete?: boolean;
};

type EventCardProps = {
  event: EventCardEvent;
  onEdit?: (eventId: string) => void;
  onDelete?: (eventId: string) => void;
  deleting?: boolean;
};

const EventCard = ({
  event,
  onEdit,
  onDelete,
  deleting = false,
}: EventCardProps) => {
  const [imageFailed, setImageFailed] = useState(false);
  const canRenderImage = Boolean(event.imageUrl) && !imageFailed;
  const onActionClick =
    (handler?: (eventId: string) => void) =>
    (e: MouseEvent<HTMLButtonElement>) => {
      e.preventDefault();
      e.stopPropagation();
      handler?.(event.id);
    };

  return (
    <div className="rounded-lg border bg-background p-4 hover:shadow-sm transition">
      <Link href={`/events/${event.id}`} className="block">
        <div className="h-32 w-full rounded-md bg-muted mb-3 overflow-hidden relative flex items-center justify-center text-sm text-muted-foreground">
          {canRenderImage ? (
            <img
              src={event.imageUrl ?? undefined}
              alt=""
              className="w-full h-full object-cover"
              onError={() => setImageFailed(true)}
            />
          ) : (
            <span>{event.imageUrl ? "Flier attached" : "Event"}</span>
          )}
        </div>

        <h3 className="font-medium text-sm mb-1">{event.title}</h3>

        <div className="flex justify-between text-xs text-muted-foreground gap-2">
          <span className="truncate">{event.dateLabel}</span>
          <span className="truncate shrink-0">{event.collegeName}</span>
        </div>
      </Link>

      {(event.canEdit || event.canDelete) && (onEdit || onDelete) && (
        <div className="mt-3 flex justify-end">
          <details className="relative">
            <summary className="list-none cursor-pointer text-xs rounded-md border px-2 py-1 hover:bg-muted select-none">
              ...
            </summary>
            <div className="absolute right-0 mt-1 min-w-[110px] rounded-md border bg-background shadow-sm z-10 p-1">
              {event.canEdit && onEdit && (
                <button
                  type="button"
                  onClick={onActionClick(onEdit)}
                  className="w-full text-left text-xs rounded px-2 py-1 hover:bg-muted"
                >
                  Edit
                </button>
              )}
              {event.canDelete && onDelete && (
                <button
                  type="button"
                  onClick={onActionClick(onDelete)}
                  disabled={deleting}
                  className="w-full text-left text-xs rounded px-2 py-1 hover:bg-muted disabled:opacity-60"
                >
                  {deleting ? "Deleting..." : "Delete"}
                </button>
              )}
            </div>
          </details>
        </div>
      )}
    </div>
  );
};

export default EventCard;
