'use client';

import Sidenav from '../components/Sidenav';
import Loginnav from '../components/Loginnav';
import EventCard from '../components/EventCard';

const mockEvents = [
  {
    id: 1,
    title: 'Community Cleanup',
    description: 'Join us to clean up the community environment.',
    date: 'Aug 20, 2025',
    author: 'Admin',
  },
  {
    id: 2,
    title: 'Tech Meetup',
    description: 'A meetup for developers and designers.',
    date: 'Sep 5, 2025',
    author: 'ASVA Team',
  },
  {
    id: 3,
    title: 'Recycling Workshop',
    description: 'Learn how to recycle waste properly.',
    date: 'Sep 12, 2025',
    author: 'Eco Group',
  },
  {
    id: 4,
    title: 'Startup Pitch Night',
    description: 'Founders pitch ideas to investors and mentors.',
    date: 'Sep 18, 2025',
    author: 'Innovation Hub',
  },
  {
    id: 5,
    title: 'UI/UX Design Talk',
    description: 'A discussion on modern UI/UX best practices.',
    date: 'Sep 22, 2025',
    author: 'Design Circle',
  },
  {
    id: 6,
    title: 'Web Development Bootcamp',
    description: 'Hands-on training on modern web technologies.',
    date: 'Sep 28, 2025',
    author: 'ASVA Academy',
  },
  {
    id: 7,
    title: 'AI & Machine Learning Seminar',
    description: 'Introduction to AI concepts and real-world use cases.',
    date: 'Oct 3, 2025',
    author: 'Tech Research Group',
  },
  {
    id: 8,
    title: 'Product Management Workshop',
    description: 'Learn how to build and manage successful products.',
    date: 'Oct 8, 2025',
    author: 'Product Guild',
  },
  {
    id: 9,
    title: 'Career Growth Session',
    description: 'Tips on career growth and personal development.',
    date: 'Oct 12, 2025',
    author: 'HR Network',
  },
  {
    id: 10,
    title: 'Open Source Contribution Day',
    description: 'Collaborate and contribute to open source projects.',
    date: 'Oct 18, 2025',
    author: 'OSS Community',
  },
  {
    id: 11,
    title: 'Digital Marketing Webinar',
    description: 'Learn strategies for effective online marketing.',
    date: 'Oct 22, 2025',
    author: 'Marketing Pros',
  },
  {
    id: 12,
    title: 'Sustainability & Tech Forum',
    description: 'Exploring how technology can drive sustainability.',
    date: 'Oct 30, 2025',
    author: 'Green Future',
  },
];

const EventsPage = () => {
  return (
    <Sidenav>
      <Loginnav />

      <div className="px-6 py-4">
        <div className="mb-6">
          <h1 className="font-bold text-xl whitespace-nowrap">Events</h1>
          <p className="text-sm text-muted-foreground">
            Discover upcoming events
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-8">
          {mockEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
            />
          ))}
        </div>
      </div>
    </Sidenav>
  );
};

export default EventsPage;
