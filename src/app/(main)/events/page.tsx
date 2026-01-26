import Link from "next/link";
import { Plus, Calendar, MapPin, Users, Ticket, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getApprovedEvents, getFeaturedEvents } from "@/actions/events";
import { format } from "date-fns";

interface EventsPageProps {
  searchParams: Promise<{
    category?: string;
    range?: string;
  }>;
}

const CATEGORIES = ["ALL", "PARTY", "CLUB", "ACADEMIC", "SPORTS", "CAREER", "OTHER"];
const DATE_RANGES = [
  { value: "upcoming", label: "Upcoming" },
  { value: "week", label: "This Week" },
  { value: "month", label: "This Month" },
];

const categoryColors: Record<string, string> = {
  PARTY: "bg-pink-100 text-pink-800",
  CLUB: "bg-purple-100 text-purple-800",
  ACADEMIC: "bg-blue-100 text-blue-800",
  SPORTS: "bg-green-100 text-green-800",
  CAREER: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
};

type Event = {
  id: string;
  title: string;
  description: string | null;
  location: string;
  startTime: Date;
  endTime: Date | null;
  category: string;
  imageUrl: string | null;
  ticketPrice: number | null;
  ticketLink: string | null;
  contactInfo: string | null;
  status: string;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  _count: {
    interested: number;
  };
};

function EventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group h-full overflow-hidden transition-shadow hover:shadow-lg">
        <div className="relative aspect-[16/9] bg-gradient-to-br from-blue-500 to-purple-600">
          {event.imageUrl ? (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Calendar className="h-12 w-12 text-white/50" />
            </div>
          )}
          <Badge
            className={`absolute left-3 top-3 ${categoryColors[event.category] || categoryColors.OTHER}`}
          >
            {event.category}
          </Badge>
        </div>
        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 font-semibold text-gray-900 group-hover:text-blue-600">
            {event.title}
          </h3>
          <div className="mb-3 space-y-1.5 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.startTime), "EEE, MMM d · h:mm a")}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              <span className="line-clamp-1">{event.location}</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-sm text-gray-500">
              <Users className="h-4 w-4" />
              <span>{event._count.interested} interested</span>
            </div>
            <span className="font-semibold text-blue-600">
              {event.ticketPrice && event.ticketPrice > 0
                ? `$${event.ticketPrice}`
                : "FREE"}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function FeaturedEventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group relative h-64 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600">
          {event.imageUrl && (
            <img
              src={event.imageUrl}
              alt={event.title}
              className="h-full w-full object-cover opacity-80"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        </div>
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge className="bg-yellow-500 text-white">
            <Star className="mr-1 h-3 w-3" />
            Featured
          </Badge>
          <Badge className={categoryColors[event.category] || categoryColors.OTHER}>
            {event.category}
          </Badge>
        </div>
        <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold group-hover:underline">
            {event.title}
          </h3>
          <div className="flex flex-wrap items-center gap-3 text-sm text-white/80">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.startTime), "EEE, MMM d · h:mm a")}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {event._count.interested} interested
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function EventsPage({ searchParams }: EventsPageProps) {
  const params = await searchParams;
  const activeCategory = params.category || "ALL";
  const activeRange = params.range || "upcoming";

  const now = new Date();
  let fromDate = now;
  let toDate: Date | undefined;

  if (activeRange === "week") {
    toDate = new Date(now);
    toDate.setDate(toDate.getDate() + 7);
  } else if (activeRange === "month") {
    toDate = new Date(now);
    toDate.setMonth(toDate.getMonth() + 1);
  }

  const [eventsResult, featuredResult] = await Promise.all([
    getApprovedEvents({
      category: activeCategory === "ALL" ? undefined : activeCategory,
      fromDate,
      toDate,
    }),
    getFeaturedEvents(),
  ]);

  const events = (eventsResult.data || []) as Event[];
  const featuredEvents = (featuredResult.data || []) as Event[];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Events</h1>
          <p className="text-gray-600">Discover and join events happening on campus</p>
        </div>
        <div className="flex gap-2">
          <Link href="/events/my-events">
            <Button variant="outline">My Events</Button>
          </Link>
          <Link href="/events/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </Link>
        </div>
      </div>

      {featuredEvents.length > 0 && (
        <div className="mb-8">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Featured Events</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {featuredEvents.map((event) => (
              <FeaturedEventCard key={event.id} event={event} />
            ))}
          </div>
        </div>
      )}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2 rounded-lg border border-gray-200 p-1">
          {CATEGORIES.map((category) => (
            <Link
              key={category}
              href={`/events?category=${category}${activeRange !== "upcoming" ? `&range=${activeRange}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeCategory === category
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {category}
            </Link>
          ))}
        </div>

        <div className="flex gap-2 rounded-lg border border-gray-200 p-1">
          {DATE_RANGES.map((range) => (
            <Link
              key={range.value}
              href={`/events?range=${range.value}${activeCategory !== "ALL" ? `&category=${activeCategory}` : ""}`}
              className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                activeRange === range.value
                  ? "bg-blue-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {range.label}
            </Link>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Calendar className="mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-lg text-gray-500">No events found</p>
          <Link href="/events/new">
            <Button>Create an Event</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
