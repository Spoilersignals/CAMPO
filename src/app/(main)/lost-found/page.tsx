import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LostFoundCard } from "@/components/lost-found/lost-found-card";
import { getLostFoundItems } from "@/actions/lost-found";

interface LostFoundPageProps {
  searchParams: Promise<{
    type?: "LOST" | "FOUND";
    search?: string;
    page?: string;
  }>;
}

export default async function LostFoundPage({ searchParams }: LostFoundPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");
  const activeTab = params.type || undefined;

  const { items, total, pages } = await getLostFoundItems({
    type: activeTab,
    search: params.search,
    page,
  });

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
          <p className="text-gray-600">Help reunite lost items with their owners</p>
        </div>
        <Link href="/lost-found/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Report Item
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="flex rounded-lg border border-gray-200 p-1">
          <Link
            href="/lost-found"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !activeTab
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </Link>
          <Link
            href="/lost-found?type=LOST"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "LOST"
                ? "bg-red-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Lost
          </Link>
          <Link
            href="/lost-found?type=FOUND"
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              activeTab === "FOUND"
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Found
          </Link>
        </div>

        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search items..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {activeTab && <input type="hidden" name="type" value={activeTab} />}
        </form>
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <p className="mb-4 text-lg text-gray-500">No items found</p>
          <Link href="/lost-found/new">
            <Button>Report an item</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((item: typeof items[number]) => (
              <LostFoundCard
                key={item.id}
                id={item.id}
                type={item.type as "LOST" | "FOUND"}
                title={item.title}
                description={item.description}
                location={item.location}
                locationDetails={item.locationDetails}
                contactPhone={item.contactPhone}
                contactName={item.contactName}
                status={item.status}
                photos={item.photos}
                reporter={item.reporter}
                createdAt={item.createdAt}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/lost-found?page=${p}${activeTab ? `&type=${activeTab}` : ""}${params.search ? `&search=${params.search}` : ""}`}
                  className={`rounded-lg px-4 py-2 ${
                    p === page
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {p}
                </Link>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
