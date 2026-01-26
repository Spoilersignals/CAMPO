import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BarChart3 } from "lucide-react";
import { getPendingConfessions } from "@/actions/admin";
import { ConfessionActions } from "./confession-actions";

export default async function PendingConfessionsPage() {
  const confessions = await getPendingConfessions();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pending Confessions</h1>
          <p className="text-gray-500">Review and moderate anonymous confessions</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/confessions/analytics">
            <Button variant="outline" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </Button>
          </Link>
          <Badge variant="warning" className="text-lg px-3 py-1">
            {confessions.length} pending
          </Badge>
        </div>
      </div>

      {confessions.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending confessions to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {confessions.map((confession) => (
            <Card key={confession.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base font-medium">
                    Anonymous Confession
                  </CardTitle>
                  <p className="text-sm text-gray-500">
                    {new Date(confession.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {confession.content.length > 200
                    ? `${confession.content.slice(0, 200)}...`
                    : confession.content}
                </p>
                <ConfessionActions confessionId={confession.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
