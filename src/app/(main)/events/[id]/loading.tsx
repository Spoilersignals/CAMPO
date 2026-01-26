import { Spinner } from "@/components/ui/spinner";

export default function EventDetailLoading() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200" />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="mb-6 aspect-video animate-pulse rounded-xl bg-gray-200" />
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 h-8 w-3/4 animate-pulse rounded bg-gray-200" />
            <div className="mb-6 flex gap-4">
              <div className="h-12 w-48 animate-pulse rounded bg-gray-200" />
              <div className="h-12 w-32 animate-pulse rounded bg-gray-200" />
            </div>
            <div className="space-y-2">
              <div className="h-4 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-gray-200" />
              <div className="h-4 w-4/6 animate-pulse rounded bg-gray-200" />
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-center">
              <Spinner size="lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
