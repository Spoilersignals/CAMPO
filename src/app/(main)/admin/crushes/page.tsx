import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  getPendingCrushes,
  approveCrushAction,
  rejectCrushAction,
} from "@/actions/admin";

export default async function AdminCrushesPage() {
  const crushes = await getPendingCrushes();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Crushes</h1>
          <p className="text-gray-500">Review and moderate crush submissions</p>
        </div>
        <Badge variant="warning">{crushes.length} pending</Badge>
      </div>

      {crushes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending crushes</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {crushes.map((crush) => (
            <Card key={crush.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{crush.title}</CardTitle>
                  <span className="text-sm text-gray-500">
                    {new Date(crush.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  {crush.description.length > 200
                    ? `${crush.description.slice(0, 200)}...`
                    : crush.description}
                </p>
                <div className="mt-4 flex gap-3">
                  <form action={async () => {
                    "use server";
                    await approveCrushAction(crush.id);
                  }}>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Approve
                    </Button>
                  </form>
                  <form action={async () => {
                    "use server";
                    await rejectCrushAction(crush.id);
                  }}>
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
