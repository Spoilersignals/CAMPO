import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, Ticket, ExternalLink, Mail, Edit, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getEventById, toggleEventInterest, isUserInterestedInEvent, cancelEvent } from "@/actions/events";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

interface EventDetailPageProps {
  params: Promise<{ id: string }>;
}

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

export default async function EventDetailPage({ params }: EventDetailPageProps) {
  const { id } = await params;
  const [eventResult, session] = await Promise.all([
    getEventById(id),
    auth(),
  ]);

  if (!eventResult.success || !eventResult.data) {
    notFound();
  }

  const event = eventResult.data as {
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
    userId: string;
    user: {
      id: string;
      name: string | null;
      image: string | null;
    };
    _count: {
      interested: number;
    };
  };

  const isOwner = session?.user?.id === event.userId;
  
  const interestResult = await isUserInterestedInEvent(id);
  const isInterested = interestResult.data?.interested || false;

  const handleToggleInterest = async () => {
    "use server";
    await toggleEventInterest(id);
  };

  const handleCancelEvent = async () => {
    "use server";
    await cancelEvent(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="relative mb-6 aspect-video overflow-hidden rounded-xl bg-gradient-to-br from-blue-500 to-purple-600">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center">
                <Calendar className="h-20 w-20 text-white/30" />
              </div>
            )}
            <div className="absolute left-4 top-4 flex flex-wrap gap-2">
              <Badge className={categoryColors[event.category] || categoryColors.OTHER}>
                {event.category}
              </Badge>
              {event.status !== "APPROVED" && (
                <Badge variant={statusVariant[event.status] || "default"}>
                  {event.status}
                </Badge>
              )}
            </div>
          </div>

          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{event.title}</h1>
              <span className="whitespace-nowrap text-xl font-bold text-blue-600">
                {event.ticketPrice && event.ticketPrice > 0
                  ? `$${event.ticketPrice}`
                  : "FREE"}
              </span>
            </div>

            <div className="mb-6 flex flex-wrap gap-4 text-gray-600">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">
                    {format(new Date(event.startTime), "EEEE, MMMM d, yyyy")}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(event.startTime), "h:mm a")}
                    {event.endTime && ` - ${format(new Date(event.endTime), "h:mm a")}`}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="h-5 w-5 text-blue-500" />
                <span>{event.location}</span>
              </div>
            </div>

            {event.description && (
              <div className="mb-6">
                <h2 className="mb-2 text-lg font-semibold text-gray-900">About this event</h2>
                <p className="whitespace-pre-wrap text-gray-700">{event.description}</p>
              </div>
            )}

            {event.contactInfo && (
              <div className="flex items-center gap-2 rounded-lg bg-gray-50 p-4 text-gray-600">
                <Mail className="h-5 w-5" />
                <span>{event.contactInfo}</span>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Users className="h-5 w-5" />
              <span>{event._count.interested} interested</span>
            </div>

            {session?.user && event.status === "APPROVED" && (
              <form action={handleToggleInterest} className="mb-4">
                <Button
                  type="submit"
                  variant={isInterested ? "outline" : "default"}
                  className="w-full"
                >
                  {isInterested ? "Not Interested" : "I'm Interested"}
                </Button>
              </form>
            )}

            {event.ticketLink && (
              <a
                href={event.ticketLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block"
              >
                <Button className="w-full bg-green-600 hover:bg-green-700">
                  <Ticket className="mr-2 h-4 w-4" />
                  Get Tickets
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            )}

            {!session?.user && (
              <p className="text-center text-sm text-gray-500">
                <Link href="/login" className="text-blue-600 hover:underline">
                  Sign in
                </Link>{" "}
                to mark interest
              </p>
            )}
          </Card>

          {isOwner && (
            <Card className="p-6">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">
                Manage Event
              </h2>
              <div className="space-y-3">
                <Link href={`/events/${event.id}/edit`} className="block">
                  <Button variant="outline" className="w-full">
                    <Edit className="mr-2 h-4 w-4" />
                    Edit Event
                  </Button>
                </Link>
                {event.status !== "CANCELLED" && (
                  <form action={handleCancelEvent}>
                    <Button variant="destructive" className="w-full" type="submit">
                      <XCircle className="mr-2 h-4 w-4" />
                      Cancel Event
                    </Button>
                  </form>
                )}
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Organizer</h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                {event.user.image ? (
                  <img
                    src={event.user.image}
                    alt={event.user.name || ""}
                    className="h-full w-full rounded-full object-cover"
                  />
                ) : (
                  event.user.name?.[0]?.toUpperCase() || "?"
                )}
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {event.user.name || "Anonymous"}
                </p>
                <p className="text-sm text-gray-500">Event Organizer</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
