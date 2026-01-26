import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequestCard } from "@/components/requests/request-card";
import { getItemRequests } from "@/actions/requests";
import { prisma } from "@/lib/prisma";

interface RequestsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function RequestsPage({ searchParams }: RequestsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const [{ requests, total, pages }, categories] = await Promise.all([
    getItemRequests({
      search: params.search,
      categoryId: params.category,
      page,
    }),
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Item Requests</h1>
          <p className="text-gray-600">Browse what students are looking for</p>
        </div>
        <Link href="/requests/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Post Request
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="search"
            defaultValue={params.search}
            placeholder="Search requests..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </form>
        <select
          name="category"
          defaultValue={params.category}
          className="rounded-lg border border-gray-300 px-4 py-2.5 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="">All Categories</option>
          {categories.map((cat: { id: string; name: string }) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      {requests.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <p className="mb-4 text-lg text-gray-500">No requests found</p>
          <Link href="/requests/new">
            <Button>Post the first request</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {requests.map((request: typeof requests[number]) => (
              <RequestCard
                key={request.id}
                id={request.id}
                title={request.title}
                description={request.description}
                budget={request.budget}
                condition={request.condition}
                category={request.category}
                requester={request.requester}
                status={request.status}
                createdAt={request.createdAt}
              />
            ))}
          </div>

          {pages > 1 && (
            <div className="mt-8 flex justify-center gap-2">
              {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
                <Link
                  key={p}
                  href={`/requests?page=${p}${params.search ? `&search=${params.search}` : ""}${params.category ? `&category=${params.category}` : ""}`}
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
