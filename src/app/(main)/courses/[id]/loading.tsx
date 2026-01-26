import { Card, CardContent, CardHeader } from "@/components/ui/card";

export default function CourseDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-6 w-24 animate-pulse rounded bg-gray-200" />
      
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <div className="h-8 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="mt-2 h-6 w-64 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardContent className="py-6 text-center">
              <div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
              <div className="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-8">
        <CardHeader>
          <div className="h-6 w-36 animate-pulse rounded bg-gray-200" />
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-12 w-full animate-pulse rounded bg-gray-200" />
          <div className="grid gap-4 md:grid-cols-2">
            <div className="h-20 animate-pulse rounded bg-gray-200" />
            <div className="h-20 animate-pulse rounded bg-gray-200" />
          </div>
          <div className="h-32 animate-pulse rounded bg-gray-200" />
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 h-6 w-32 animate-pulse rounded bg-gray-200" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="mb-4 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 animate-pulse rounded-full bg-gray-200" />
                    <div>
                      <div className="h-5 w-24 animate-pulse rounded bg-gray-200" />
                      <div className="mt-1 h-4 w-32 animate-pulse rounded bg-gray-200" />
                    </div>
                  </div>
                  <div className="h-5 w-28 animate-pulse rounded bg-gray-200" />
                </div>
                <div className="space-y-2">
                  <div className="h-4 w-full animate-pulse rounded bg-gray-200" />
                  <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
