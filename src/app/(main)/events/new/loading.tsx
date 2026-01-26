import { Spinner } from "@/components/ui/spinner";

export default function NewEventLoading() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 h-5 w-32 animate-pulse rounded bg-gray-200" />
      <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 h-7 w-48 animate-pulse rounded bg-gray-200" />
        <div className="mb-6 h-5 w-64 animate-pulse rounded bg-gray-200" />
        <div className="flex items-center justify-center py-16">
          <Spinner size="lg" />
        </div>
      </div>
    </div>
  );
}
