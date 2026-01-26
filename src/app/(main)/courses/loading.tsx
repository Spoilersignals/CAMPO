import { Card, CardContent } from "@/components/ui/card";

export default function CoursesLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-72 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mb-6">
        <div className="h-10 w-40 animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="mb-6">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="space-y-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-48 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="text-right">
                  <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                  <div className="mt-1 h-3 w-16 animate-pulse rounded bg-gray-200" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
