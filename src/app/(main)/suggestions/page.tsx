import Link from "next/link";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SuggestionList } from "@/components/suggestions/suggestion-list";
import { getSuggestionsAction } from "@/actions/requests";
import { prisma } from "@/lib/prisma";

interface SuggestionsPageProps {
  searchParams: Promise<{
    search?: string;
    category?: string;
    page?: string;
  }>;
}

export default async function SuggestionsPage({ searchParams }: SuggestionsPageProps) {
  const params = await searchParams;
  const page = parseInt(params.page || "1");

  const [{ suggestions, total, pages }, categories] = await Promise.all([
    getSuggestionsAction({
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
          <h1 className="text-2xl font-bold text-gray-900">Item Suggestions</h1>
          <p className="text-gray-600">
            Browse what people are looking for - anyone can suggest an item!
          </p>
        </div>
        <Link href="/suggestions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Suggest an Item
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
            placeholder="Search suggestions..."
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

      <SuggestionList
        suggestions={suggestions}
        currentPage={page}
        totalPages={pages}
        searchParams={params}
      />
    </div>
  );
}
