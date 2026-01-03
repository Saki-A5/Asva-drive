import Link from 'next/link';

type Event = {
  title: string;
  description: string;
  date: string;
  author: string;
};

const EventCard = ({ event }: { event: Event }) => {
  return (
    <Link
      href={`event/${event.title}`}
      className="rounded-lg border bg-background p-4 hover:shadow-sm transition">
      {/* Image Placeholder */}
      <div className="h-32 w-full rounded-md bg-muted mb-3 flex items-center justify-center text-sm text-muted-foreground">
        Event Image
      </div>

      <h3 className="font-medium text-sm mb-1">{event.title}</h3>

      <p className="text-xs text-muted-foreground mb-3 line-clamp-2">
        {event.description}
      </p>

      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{event.date}</span>
        <span>{event.author}</span>
      </div>
    </Link>
  );
};

export default EventCard;
