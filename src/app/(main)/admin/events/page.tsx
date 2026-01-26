import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  getPendingEvents,
  approveEventAction,
  rejectEventAction,
} from "@/actions/admin";

export default async function AdminEventsPage() {
  const events = await getPendingEvents();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Events</h1>
        <p className="text-gray-500">
          {events.length} event{events.length !== 1 ? "s" : ""} awaiting review
        </p>
      </div>

      {events.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending events</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <Card key={event.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{event.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Submitted by {event.user.name || event.user.email} •{" "}
                      {new Date(event.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge>{event.category}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <p className="text-sm text-gray-600">
                    {event.description && event.description.length > 200
                      ? `${event.description.slice(0, 200)}...`
                      : event.description || "No description"}
                  </p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-500">Location:</span>{" "}
                      <span className="font-medium">{event.location}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Start Time:</span>{" "}
                      <span className="font-medium">
                        {new Date(event.startTime).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <form
                      action={async () => {
                        "use server";
                        await approveEventAction(event.id);
                      }}
                    >
                      <Button type="submit" className="bg-green-600 hover:bg-green-700">
                        Approve
                      </Button>
                    </form>
                    <form
                      action={async () => {
                        "use server";
                        await rejectEventAction(event.id);
                      }}
                    >
                      <Button type="submit" variant="destructive">
                        Reject
                      </Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
