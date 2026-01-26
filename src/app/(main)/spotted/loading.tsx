import { Card, CardContent } from "@/components/ui/card";

export default function SpottedLoading() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div className="animate-pulse">
        <div className="h-8 w-32 rounded bg-gray-200" />
        <div className="mt-1 h-4 w-48 rounded bg-gray-200" />
      </div>

      <Card className="animate-pulse">
        <CardContent className="space-y-4 p-6">
          <div className="h-24 rounded bg-gray-200" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-10 rounded bg-gray-200" />
            <div className="h-10 rounded bg-gray-200" />
          </div>
          <div className="h-10 rounded bg-gray-200" />
        </CardContent>
      </Card>

      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />

        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <div className="h-6 w-12 rounded-full bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
              <div className="mt-2 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-3/4 rounded bg-gray-200" />
              </div>
              <div className="mt-3 flex gap-4">
                <div className="h-4 w-24 rounded bg-gray-200" />
                <div className="h-4 w-8 rounded bg-gray-200" />
                <div className="h-4 w-16 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
