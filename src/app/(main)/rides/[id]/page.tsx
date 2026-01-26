import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Users, DollarSign, Car, Phone, MessageCircle, ArrowRight, Clock, Check, X, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getRideById, updateRideStatus, deleteRide } from "@/actions/rides";
import { auth } from "@/lib/auth";
import { format } from "date-fns";
import { redirect } from "next/navigation";

interface RideDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "success" | "default" | "warning" | "error"> = {
  ACTIVE: "success",
  FULL: "warning",
  COMPLETED: "default",
  CANCELLED: "error",
};

export default async function RideDetailPage({ params }: RideDetailPageProps) {
  const { id } = await params;
  const [result, session] = await Promise.all([
    getRideById(id),
    auth(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const ride = result.data;
  const isOwner = session?.user?.id === ride.userId;

  const handleMarkFull = async () => {
    "use server";
    await updateRideStatus(id, "FULL");
  };

  const handleMarkActive = async () => {
    "use server";
    await updateRideStatus(id, "ACTIVE");
  };

  const handleMarkCompleted = async () => {
    "use server";
    await updateRideStatus(id, "COMPLETED");
  };

  const handleCancel = async () => {
    "use server";
    await updateRideStatus(id, "CANCELLED");
  };

  const handleDelete = async () => {
    "use server";
    await deleteRide(id);
    redirect("/rides");
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/rides"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Rides
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Card className="p-6">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  className={
                    ride.type === "OFFERING"
                      ? "bg-green-100 text-green-800"
                      : "bg-purple-100 text-purple-800"
                  }
                >
                  {ride.type === "OFFERING" ? (
                    <>
                      <Car className="mr-1 h-3 w-3" />
                      Offering Ride
                    </>
                  ) : (
                    <>
                      <Users className="mr-1 h-3 w-3" />
                      Looking for Ride
                    </>
                  )}
                </Badge>
                <Badge variant={statusVariant[ride.status] || "default"}>
                  {ride.status}
                </Badge>
              </div>

              {isOwner && ride.status !== "CANCELLED" && (
                <div className="flex flex-wrap gap-2">
                  {ride.status === "ACTIVE" && ride.type === "OFFERING" && (
                    <form action={handleMarkFull}>
                      <Button variant="outline" size="sm" type="submit">
                        Mark Full
                      </Button>
                    </form>
                  )}
                  {ride.status === "FULL" && (
                    <form action={handleMarkActive}>
                      <Button variant="outline" size="sm" type="submit">
                        Mark Active
                      </Button>
                    </form>
                  )}
                  {(ride.status === "ACTIVE" || ride.status === "FULL") && (
                    <form action={handleMarkCompleted}>
                      <Button variant="outline" size="sm" type="submit">
                        <Check className="mr-1 h-4 w-4" />
                        Complete
                      </Button>
                    </form>
                  )}
                  {ride.status === "ACTIVE" && (
                    <form action={handleCancel}>
                      <Button variant="outline" size="sm" type="submit">
                        <X className="mr-1 h-4 w-4" />
                        Cancel
                      </Button>
                    </form>
                  )}
                  <form action={handleDelete}>
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-3 text-xl font-bold text-gray-900">
                <MapPin className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span>{ride.origin}</span>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-gray-400" />
                <span>{ride.destination}</span>
              </div>
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div className="flex items-center gap-3 text-gray-600">
                <Calendar className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {format(new Date(ride.departureDate), "EEEE, MMMM d, yyyy")}
                  </p>
                  {ride.departureTime && (
                    <p className="text-sm">{ride.departureTime}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 text-gray-600">
                <Users className="h-5 w-5 text-gray-400" />
                <div>
                  <p className="font-medium text-gray-900">
                    {ride.type === "OFFERING"
                      ? `${ride.seatsAvailable || "?"} seat${(ride.seatsAvailable || 0) !== 1 ? "s" : ""} available`
                      : `${ride.seatsNeeded || "?"} seat${(ride.seatsNeeded || 0) !== 1 ? "s" : ""} needed`
                    }
                  </p>
                </div>
              </div>

              {ride.pricePerSeat && (
                <div className="flex items-center gap-3 text-gray-600">
                  <DollarSign className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900">${ride.pricePerSeat} per seat</p>
                  </div>
                </div>
              )}
            </div>

            {ride.description && (
              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
                <p className="whitespace-pre-wrap text-gray-700">{ride.description}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Information
            </h2>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                  {(ride.contactName || ride.user?.name)?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <span className="font-medium text-gray-900">
                    {ride.contactName || ride.user?.name || "Anonymous"}
                  </span>
                  {ride.contactPhone && (
                    <p className="text-sm text-gray-600">{ride.contactPhone}</p>
                  )}
                </div>
              </div>

              {ride.contactPhone && ride.status === "ACTIVE" && (
                <div className="flex gap-2">
                  <a href={`tel:${ride.contactPhone}`} className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </a>
                  <a
                    href={`https://wa.me/${ride.contactPhone.replace(/[^0-9]/g, "")}?text=Hi, I saw your ride from ${ride.origin} to ${ride.destination} on Campus.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Posted {format(new Date(ride.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Posted by
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                {ride.user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <span className="font-medium text-gray-900">
                  {ride.user?.name || "Anonymous"}
                </span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
