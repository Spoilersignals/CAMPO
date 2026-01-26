import { Card, CardContent } from "@/components/ui/card";

export default function ConfessionsLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      <Card className="mb-8">
        <CardContent className="pt-6">
          <div className="mb-4 h-[120px] w-full animate-pulse rounded-lg bg-gray-200" />
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 animate-pulse rounded bg-gray-200" />
            <div className="h-10 w-36 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="pt-6">
              <div className="mb-2 flex items-center gap-2">
                <div className="h-5 w-12 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-20 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="mb-4 space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
              </div>
              <div className="flex gap-4">
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
                <div className="h-4 w-16 animate-pulse rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
