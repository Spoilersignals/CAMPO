import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMyEvents, getMyInterestedEvents } from "@/actions/events";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

const categoryColors: Record<string, string> = {
  PARTY: "bg-pink-100 text-pink-800",
  CLUB: "bg-purple-100 text-purple-800",
  ACADEMIC: "bg-blue-100 text-blue-800",
  SPORTS: "bg-green-100 text-green-800",
  CAREER: "bg-orange-100 text-orange-800",
  OTHER: "bg-gray-100 text-gray-800",
};

const statusVariant: Record<string, "success" | "default" | "warning" | "error"> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "error",
  CANCELLED: "error",
};

const statusLabels: Record<string, string> = {
  APPROVED: "Approved",
  PENDING: "Pending Review",
  REJECTED: "Rejected",
  CANCELLED: "Cancelled",
};

type Event = {
  id: string;
  title: string;
  location: string;
  startTime: Date;
  category: string;
  imageUrl: string | null;
  ticketPrice: number | null;
  status: string;
  _count: {
    interested: number;
  };
  user?: {
    id: string;
    name: string | null;
    image: string | null;
  };
};

function MyEventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex">
          <div className="relative h-32 w-32 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-8 w-8 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-4">
            <div>
              <div className="mb-2 flex flex-wrap gap-2">
                <Badge className={categoryColors[event.category] || categoryColors.OTHER}>
                  {event.category}
                </Badge>
                <Badge variant={statusVariant[event.status] || "default"}>
                  {statusLabels[event.status] || event.status}
                </Badge>
              </div>
              <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-blue-600">
                {event.title}
              </h3>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(event.startTime), "MMM d, h:mm a")}
              </span>
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                <span className="line-clamp-1">{event.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                {event._count.interested}
              </span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

function InterestedEventCard({ event }: { event: Event }) {
  return (
    <Link href={`/events/${event.id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-lg">
        <div className="flex">
          <div className="relative h-28 w-28 flex-shrink-0 bg-gradient-to-br from-blue-500 to-purple-600">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-6 w-6 text-white/50" />
              </div>
            )}
          </div>
          <div className="flex flex-1 flex-col justify-between p-3">
            <div>
              <Badge
                className={`mb-1 ${categoryColors[event.category] || categoryColors.OTHER}`}
              >
                {event.category}
              </Badge>
              <h3 className="line-clamp-1 font-semibold text-gray-900 group-hover:text-blue-600">
                {event.title}
              </h3>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="h-4 w-4" />
              {format(new Date(event.startTime), "MMM d, h:mm a")}
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}

export default async function MyEventsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/events/my-events");
  }

  const [myEventsResult, interestedEventsResult] = await Promise.all([
    getMyEvents(),
    getMyInterestedEvents(),
  ]);

  const myEvents = (myEventsResult.data || []) as Event[];
  const interestedEvents = (interestedEventsResult.data || []) as Event[];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Events</h1>
          <p className="text-gray-600">Manage your events and see what you&apos;re interested in</p>
        </div>
        <Link href="/events/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Event
          </Button>
        </Link>
      </div>

      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Events I Created ({myEvents.length})
          </h2>
          {myEvents.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <Calendar className="mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-4 text-gray-500">You haven&apos;t created any events yet</p>
              <Link href="/events/new">
                <Button>Create Your First Event</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-3">
              {myEvents.map((event) => (
                <MyEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            Events I&apos;m Interested In ({interestedEvents.length})
          </h2>
          {interestedEvents.length === 0 ? (
            <Card className="flex flex-col items-center justify-center py-12">
              <Users className="mb-4 h-12 w-12 text-gray-300" />
              <p className="mb-4 text-gray-500">
                You haven&apos;t marked interest in any events yet
              </p>
              <Link href="/events">
                <Button variant="outline">Browse Events</Button>
              </Link>
            </Card>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {interestedEvents.map((event) => (
                <InterestedEventCard key={event.id} event={event} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
