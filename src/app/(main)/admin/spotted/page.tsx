import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin } from "lucide-react";
import {
  getPendingSpotted,
  approveSpottedAction,
  rejectSpottedAction,
} from "@/actions/admin";

export default async function AdminSpottedPage() {
  const pendingSpotted = await getPendingSpotted();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Spotted Moderation</h1>
          <p className="text-gray-500">Review and moderate spotted posts</p>
        </div>
        <Badge variant="warning">{pendingSpotted.length} pending</Badge>
      </div>

      {pendingSpotted.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending spotted posts</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {pendingSpotted.map((spotted) => (
            <Card key={spotted.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-gray-400" />
                    <CardTitle className="text-base">{spotted.location}</CardTitle>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(spotted.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="mb-4 text-sm text-gray-600">
                  {spotted.content.length > 200
                    ? `${spotted.content.slice(0, 200)}...`
                    : spotted.content}
                </p>
                <div className="flex gap-2">
                  <form
                    action={async () => {
                      "use server";
                      await approveSpottedAction(spotted.id);
                    }}
                  >
                    <Button type="submit" size="sm" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectSpottedAction(spotted.id);
                    }}
                  >
                    <Button type="submit" size="sm" variant="destructive">
                      Reject
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
