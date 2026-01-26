import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPendingPolls,
  approvePollAction,
  rejectPollAction,
} from "@/actions/admin";

export default async function AdminPollsPage() {
  const polls = await getPendingPolls();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Polls</h1>
        <p className="text-gray-500">
          Review and moderate poll submissions
          <Badge variant="warning" className="ml-2">
            {polls.length} pending
          </Badge>
        </p>
      </div>

      {polls.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending polls</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {polls.map((poll) => (
            <Card key={poll.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{poll.question}</CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="mb-4 list-inside list-disc text-sm text-gray-600">
                  {poll.options.map((option) => (
                    <li key={option.id}>{option.text}</li>
                  ))}
                </ul>
                <p className="mb-4 text-sm text-gray-500">
                  Created: {new Date(poll.createdAt).toLocaleDateString()}
                </p>
                <div className="flex gap-3">
                  <form
                    action={async () => {
                      "use server";
                      await approvePollAction(poll.id);
                    }}
                  >
                    <Button
                      type="submit"
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                  </form>
                  <form
                    action={async () => {
                      "use server";
                      await rejectPollAction(poll.id);
                    }}
                  >
                    <Button type="submit" variant="destructive">
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
