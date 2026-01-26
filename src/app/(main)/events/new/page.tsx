"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createEvent } from "@/actions/events";

const CATEGORIES = [
  { value: "PARTY", label: "Party" },
  { value: "CLUB", label: "Club" },
  { value: "ACADEMIC", label: "Academic" },
  { value: "SPORTS", label: "Sports" },
  { value: "CAREER", label: "Career" },
  { value: "OTHER", label: "Other" },
];

export default function NewEventPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const ticketPriceStr = formData.get("ticketPrice") as string;
    const ticketPrice = ticketPriceStr ? parseFloat(ticketPriceStr) : undefined;

    const result = await createEvent({
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      category: formData.get("category") as string,
      location: formData.get("location") as string,
      startTime: new Date(formData.get("startTime") as string),
      endTime: formData.get("endTime")
        ? new Date(formData.get("endTime") as string)
        : undefined,
      imageUrl: (formData.get("imageUrl") as string) || undefined,
      ticketPrice: ticketPrice,
      ticketLink: (formData.get("ticketLink") as string) || undefined,
      contactInfo: (formData.get("contactInfo") as string) || undefined,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push("/events/my-events");
    } else {
      setError(result.error || "Failed to create event");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/events"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Events
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Event</CardTitle>
          <p className="text-sm text-gray-500">
            Share your event with the campus community
          </p>
        </CardHeader>
        <CardContent>
          <div className="mb-6 flex items-start gap-3 rounded-lg bg-amber-50 p-4">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600" />
            <div className="text-sm text-amber-800">
              <p className="font-medium">Events require admin approval</p>
              <p className="mt-1 text-amber-700">
                Your event will be reviewed before becoming visible to other users.
                This usually takes less than 24 hours.
              </p>
            </div>
          </div>

          {error && (
            <div className="mb-6 rounded-lg bg-red-50 p-4 text-sm text-red-600">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <Input
              name="title"
              label="Event Title *"
              placeholder="e.g., Spring Music Festival"
              required
            />

            <Textarea
              name="description"
              label="Description"
              placeholder="Tell people what your event is about..."
              rows={4}
            />

            <Select name="category" label="Category *" required>
              <option value="">Select a category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </Select>

            <Input
              name="location"
              label="Location *"
              placeholder="e.g., Student Center, Room 101"
              required
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="startTime"
                label="Start Date & Time *"
                type="datetime-local"
                required
              />
              <Input
                name="endTime"
                label="End Date & Time"
                type="datetime-local"
              />
            </div>

            <Input
              name="imageUrl"
              label="Image URL"
              placeholder="https://example.com/event-image.jpg"
              type="url"
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                name="ticketPrice"
                label="Ticket Price"
                placeholder="0.00 (leave empty for free)"
                type="number"
                min="0"
                step="0.01"
              />
              <Input
                name="ticketLink"
                label="Ticket Link"
                placeholder="https://tickets.example.com"
                type="url"
              />
            </div>

            <Input
              name="contactInfo"
              label="Contact Information"
              placeholder="Email, phone, or social media handle"
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Event"}
              </Button>
              <Link href="/events">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
