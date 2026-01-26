"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Car, Users } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createRide } from "@/actions/rides";

export default function NewRidePage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [type, setType] = useState<"OFFERING" | "LOOKING">("OFFERING");
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    const formData = new FormData(e.currentTarget);
    const origin = formData.get("origin") as string;
    const destination = formData.get("destination") as string;
    const departureDate = formData.get("departureDate") as string;
    const departureTime = formData.get("departureTime") as string;
    const seats = parseInt(formData.get("seats") as string) || undefined;
    const pricePerSeat = parseFloat(formData.get("pricePerSeat") as string) || undefined;
    const description = formData.get("description") as string;
    const contactPhone = formData.get("contactPhone") as string;
    const contactName = formData.get("contactName") as string;

    if (!origin || !destination || !departureDate || !contactPhone) {
      setError("Please fill in all required fields");
      return;
    }

    startTransition(async () => {
      const result = await createRide({
        type,
        origin,
        destination,
        departureDate: new Date(departureDate),
        departureTime: departureTime || undefined,
        seatsAvailable: type === "OFFERING" ? seats : undefined,
        seatsNeeded: type === "LOOKING" ? seats : undefined,
        pricePerSeat,
        description: description || undefined,
        contactPhone,
        contactName: contactName || undefined,
      });

      if (result.success) {
        router.push("/rides");
      } else {
        setError(result.error || "Failed to create ride");
      }
    });
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/rides"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Rides
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a Ride</CardTitle>
          <p className="text-sm text-gray-500">
            Offer a ride or find travel companions
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
                {error}
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                What are you looking to do?
              </label>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setType("OFFERING")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    type === "OFFERING"
                      ? "border-green-600 bg-green-50 text-green-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Car className="h-5 w-5" />
                  <span className="font-medium">Offering a Ride</span>
                </button>
                <button
                  type="button"
                  onClick={() => setType("LOOKING")}
                  className={`flex flex-1 items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                    type === "LOOKING"
                      ? "border-purple-600 bg-purple-50 text-purple-700"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <Users className="h-5 w-5" />
                  <span className="font-medium">Looking for a Ride</span>
                </button>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="origin"
                label="From (Origin) *"
                placeholder="e.g., Campus Main Gate"
                required
              />
              <Input
                name="destination"
                label="To (Destination) *"
                placeholder="e.g., City Center"
                required
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="departureDate"
                label="Departure Date *"
                type="date"
                min={new Date().toISOString().split("T")[0]}
                required
              />
              <Input
                name="departureTime"
                label="Departure Time"
                placeholder="e.g., Morning, 3pm, After 4pm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="seats"
                label={type === "OFFERING" ? "Seats Available" : "Seats Needed"}
                type="number"
                min="1"
                max="10"
                placeholder="e.g., 3"
              />
              <Input
                name="pricePerSeat"
                label="Price per Seat (optional)"
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g., 15.00"
              />
            </div>

            <Textarea
              name="description"
              label="Description (optional)"
              placeholder="Any additional details about the ride, pickup points, luggage space, etc."
              rows={3}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="contactPhone"
                label="Contact Phone *"
                type="tel"
                placeholder="Your phone number"
                required
              />
              <Input
                name="contactName"
                label="Contact Name (optional)"
                placeholder="Your name"
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Link href="/rides" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1" disabled={isPending}>
                {isPending ? "Creating..." : "Create Ride"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
