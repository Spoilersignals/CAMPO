import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, MapPin, Calendar, Users, DollarSign, Plus, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMyRides, updateRideStatus } from "@/actions/rides";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

const statusVariant: Record<string, "success" | "default" | "warning" | "error"> = {
  ACTIVE: "success",
  FULL: "warning",
  COMPLETED: "default",
  CANCELLED: "error",
};

export default async function MyRidesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/rides/my-rides");
  }

  const result = await getMyRides();
  const rides = result.success && result.data ? result.data : [];

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/rides"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Rides
      </Link>

      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Rides</h1>
          <p className="text-gray-600">Manage your ride listings</p>
        </div>
        <Link href="/rides/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Ride
          </Button>
        </Link>
      </div>

      {rides.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <Car className="mb-4 h-12 w-12 text-gray-300" />
          <p className="mb-4 text-lg text-gray-500">You haven&apos;t created any rides yet</p>
          <Link href="/rides/new">
            <Button>Create your first ride</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {rides.map((ride) => {
            const handleMarkActive = async () => {
              "use server";
              await updateRideStatus(ride.id, "ACTIVE");
            };

            const handleMarkFull = async () => {
              "use server";
              await updateRideStatus(ride.id, "FULL");
            };

            const handleMarkCompleted = async () => {
              "use server";
              await updateRideStatus(ride.id, "COMPLETED");
            };

            const handleCancel = async () => {
              "use server";
              await updateRideStatus(ride.id, "CANCELLED");
            };

            return (
              <Card key={ride.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
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
                      <Badge variant={statusVariant[ride.status] || "default"}>
                        {ride.status}
                      </Badge>
                    </div>

                    <Link href={`/rides/${ride.id}`} className="group">
                      <div className="mb-2 flex items-center gap-2 text-gray-900 group-hover:text-blue-600">
                        <MapPin className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium">{ride.origin}</span>
                        <ArrowRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
                        <span className="font-medium">{ride.destination}</span>
                      </div>
                    </Link>

                    <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(ride.departureDate), "MMM d, yyyy")}
                        {ride.departureTime && ` • ${ride.departureTime}`}
                      </span>
                      {ride.type === "OFFERING" && ride.seatsAvailable && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ride.seatsAvailable} seats
                        </span>
                      )}
                      {ride.type === "LOOKING" && ride.seatsNeeded && (
                        <span className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {ride.seatsNeeded} seats needed
                        </span>
                      )}
                      {ride.pricePerSeat && (
                        <span className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4" />
                          ${ride.pricePerSeat}/seat
                        </span>
                      )}
                    </div>
                  </div>

                  {ride.status !== "CANCELLED" && ride.status !== "COMPLETED" && (
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
                            Reopen
                          </Button>
                        </form>
                      )}
                      <form action={handleMarkCompleted}>
                        <Button variant="outline" size="sm" type="submit">
                          Complete
                        </Button>
                      </form>
                      <form action={handleCancel}>
                        <Button variant="destructive" size="sm" type="submit">
                          Cancel
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
