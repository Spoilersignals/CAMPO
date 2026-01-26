import Link from "next/link";
import { Plus, Car, MapPin, Calendar, Users, DollarSign, Phone, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getRides } from "@/actions/rides";
import { format } from "date-fns";

interface RidesPageProps {
  searchParams: Promise<{
    type?: "OFFERING" | "LOOKING";
    origin?: string;
    destination?: string;
    date?: string;
  }>;
}

export default async function RidesPage({ searchParams }: RidesPageProps) {
  const params = await searchParams;
  const activeType = params.type || undefined;

  const { success, data: rides } = await getRides({
    type: activeType,
    origin: params.origin,
    destination: params.destination,
    fromDate: params.date ? new Date(params.date) : undefined,
  });

  const ridesList = success && rides ? rides : [];

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ride Sharing</h1>
          <p className="text-gray-600">Find or offer rides to share travel costs</p>
        </div>
        <div className="flex gap-2">
          <Link href="/rides/my-rides">
            <Button variant="outline">My Rides</Button>
          </Link>
          <Link href="/rides/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Ride
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4">
        <div className="flex rounded-lg border border-gray-200 p-1 w-fit">
          <Link
            href="/rides"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !activeType
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </Link>
          <Link
            href="/rides?type=OFFERING"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeType === "OFFERING"
                ? "bg-green-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Car className="mr-1 inline h-4 w-4" />
            Offering Rides
          </Link>
          <Link
            href="/rides?type=LOOKING"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeType === "LOOKING"
                ? "bg-purple-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            <Users className="mr-1 inline h-4 w-4" />
            Looking for Rides
          </Link>
        </div>

        <form className="flex flex-wrap gap-3">
          {activeType && <input type="hidden" name="type" value={activeType} />}
          <input
            type="text"
            name="origin"
            defaultValue={params.origin}
            placeholder="From (origin)"
            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="text"
            name="destination"
            defaultValue={params.destination}
            placeholder="To (destination)"
            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <input
            type="date"
            name="date"
            defaultValue={params.date}
            className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <Button type="submit">Filter</Button>
        </form>
      </div>

      {ridesList.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Car className="mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-lg text-gray-500">No rides found</p>
          <Link href="/rides/new">
            <Button>Create the first ride</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {ridesList.map((ride) => (
            <Link key={ride.id} href={`/rides/${ride.id}`}>
              <Card className="h-full p-5 transition-shadow hover:shadow-md">
                <div className="mb-3 flex items-center justify-between">
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
                        Offering
                      </>
                    ) : (
                      <>
                        <Users className="mr-1 h-3 w-3" />
                        Looking
                      </>
                    )}
                  </Badge>
                </div>

                <div className="mb-3 flex items-center gap-2 text-gray-900">
                  <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="font-medium truncate">{ride.origin}</span>
                  <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                  <span className="font-medium truncate">{ride.destination}</span>
                </div>

                <div className="mb-3 flex flex-wrap gap-3 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {format(new Date(ride.departureDate), "MMM d, yyyy")}
                    {ride.departureTime && ` • ${ride.departureTime}`}
                  </span>
                </div>

                <div className="flex flex-wrap gap-3 text-sm text-gray-600">
                  {ride.type === "OFFERING" && ride.seatsAvailable && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {ride.seatsAvailable} seat{ride.seatsAvailable > 1 ? "s" : ""} available
                    </span>
                  )}
                  {ride.type === "LOOKING" && ride.seatsNeeded && (
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {ride.seatsNeeded} seat{ride.seatsNeeded > 1 ? "s" : ""} needed
                    </span>
                  )}
                  {ride.pricePerSeat && (
                    <span className="flex items-center gap-1">
                      <DollarSign className="h-4 w-4" />
                      ${ride.pricePerSeat}/seat
                    </span>
                  )}
                </div>

                <div className="mt-4 flex items-center justify-between border-t pt-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-sm font-medium text-gray-600">
                      {ride.user?.name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <span className="text-sm text-gray-600">{ride.user?.name || "Anonymous"}</span>
                  </div>
                  {ride.contactPhone && (
                    <Phone className="h-4 w-4 text-gray-400" />
                  )}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
