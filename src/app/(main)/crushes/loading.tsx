import { Card, CardContent } from "@/components/ui/card";

export default function CrushesLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <div className="mx-auto h-9 w-48 animate-pulse rounded bg-gray-200"></div>
        <div className="mx-auto mt-2 h-5 w-64 animate-pulse rounded bg-gray-200"></div>
      </div>

      <div className="mb-6 h-10 w-full animate-pulse rounded-lg bg-gray-200"></div>

      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="border-pink-100">
            <CardContent className="p-4">
              <div className="animate-pulse">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-5 w-8 rounded bg-pink-100"></div>
                  <div className="h-5 w-40 rounded bg-gray-200"></div>
                </div>
                <div className="h-4 w-full rounded bg-gray-200 mb-2"></div>
                <div className="h-4 w-3/4 rounded bg-gray-200 mb-3"></div>
                <div className="flex gap-3">
                  <div className="h-4 w-24 rounded bg-gray-100"></div>
                  <div className="h-4 w-16 rounded bg-gray-100"></div>
                  <div className="h-4 w-12 rounded bg-gray-100"></div>
                </div>
                <div className="mt-2 flex gap-2">
                  <div className="h-6 w-12 rounded-full bg-pink-50"></div>
                  <div className="h-6 w-12 rounded-full bg-pink-50"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
