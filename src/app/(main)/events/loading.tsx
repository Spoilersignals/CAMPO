import { Spinner } from "@/components/ui/spinner";

export default function EventsLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 h-8 w-48 animate-pulse rounded bg-gray-200" />
        <div className="h-5 w-72 animate-pulse rounded bg-gray-200" />
      </div>

      <div className="mb-8">
        <div className="mb-4 h-6 w-36 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="h-64 animate-pulse rounded-xl bg-gray-200"
            />
          ))}
        </div>
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div className="h-10 w-96 animate-pulse rounded-lg bg-gray-200" />
        <div className="h-10 w-48 animate-pulse rounded-lg bg-gray-200" />
      </div>

      <div className="flex items-center justify-center py-16">
        <Spinner size="lg" />
      </div>
    </div>
  );
}
