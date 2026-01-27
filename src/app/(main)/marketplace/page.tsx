import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { FLAT_CATEGORIES, CONDITIONS, ITEMS_PER_PAGE, SORT_OPTIONS } from "@/lib/constants";
import { ListingGrid } from "@/components/listings";
import { ChevronLeft, ChevronRight, SlidersHorizontal, Sparkles } from "lucide-react";

interface MarketplacePageProps {
  searchParams: Promise<{
    q?: string;
    category?: string;
    condition?: string;
    minPrice?: string;
    maxPrice?: string;
    sort?: string;
    page?: string;
    featured?: string;
  }>;
}

async function getListings(params: {
  q?: string;
  category?: string;
  condition?: string;
  minPrice?: string;
  maxPrice?: string;
  sort?: string;
  page?: string;
  featured?: string;
}) {
  const page = Math.max(1, parseInt(params.page || "1"));
  const skip = (page - 1) * ITEMS_PER_PAGE;

  const where: Record<string, unknown> = {
    status: "ACTIVE",
  };

  if (params.q) {
    where.OR = [
      { title: { contains: params.q } },
      { description: { contains: params.q } },
    ];
  }

  if (params.category) {
    const category = await prisma.category.findFirst({
      where: { name: params.category },
    });
    if (category) {
      where.categoryId = category.id;
    }
  }

  if (params.condition) {
    where.condition = params.condition;
  }

  if (params.minPrice || params.maxPrice) {
    where.price = {};
    if (params.minPrice) {
      (where.price as Record<string, number>).gte = parseFloat(params.minPrice);
    }
    if (params.maxPrice) {
      (where.price as Record<string, number>).lte = parseFloat(params.maxPrice);
    }
  }

  if (params.featured === "true") {
    where.isFeatured = true;
  }

  let orderBy: Record<string, string> = { createdAt: "desc" };
  if (params.sort) {
    const [field, direction] = params.sort.split("-");
    orderBy = { [field]: direction };
  }

  const [listings, total] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        seller: true,
        photos: {
          orderBy: { sortOrder: "asc" },
        },
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy,
    }),
    prisma.listing.count({ where }),
  ]);

  return {
    listings: listings.map((listing: {
      id: string;
      title: string;
      price: number;
      condition: string;
      photos: { url: string }[];
      seller: { name: string | null; isVerified: boolean };
      isFeatured: boolean;
    }) => ({
      id: listing.id,
      title: listing.title,
      price: listing.price,
      condition: listing.condition as "New" | "Like New" | "Good" | "Fair" | "Poor",
      images: listing.photos.map((p: { url: string }) => p.url),
      seller: {
        name: listing.seller.name || "Anonymous",
        isVerified: listing.seller.isVerified,
      },
      isFeatured: listing.isFeatured,
    })),
    total,
    page,
    totalPages: Math.ceil(total / ITEMS_PER_PAGE),
  };
}

function buildQueryString(
  params: Record<string, string | undefined>,
  updates: Record<string, string | undefined>
) {
  const merged = { ...params, ...updates };
  const searchParams = new URLSearchParams();
  Object.entries(merged).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  return searchParams.toString();
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const { listings, total, page, totalPages } = await getListings(params);

  const currentParams = {
    q: params.q,
    category: params.category,
    condition: params.condition,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    featured: params.featured,
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 p-8 rounded-3xl bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23fff' fill-opacity='0.4' fill-rule='evenodd'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/svg%3E\")"}} />
        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="h-8 w-8" />
            <h1 className="text-3xl md:text-4xl font-bold">Campus Marketplace</h1>
          </div>
          <p className="text-white/80 text-lg">
            {total} {total === 1 ? "item" : "items"} available • Great deals from fellow students
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-8 lg:flex-row">
        <aside className="w-full shrink-0 lg:w-64">
          <div className="sticky top-20 rounded-2xl border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-5 w-5 text-indigo-600" />
                <h2 className="font-semibold text-gray-900">Filters</h2>
              </div>
            </div>
            <div className="p-4">

            <form method="GET" className="space-y-6">
              {params.q && <input type="hidden" name="q" value={params.q} />}

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Category
                </label>
                <select
                  name="category"
                  defaultValue={params.category || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">All Categories</option>
                  {FLAT_CATEGORIES.map((cat) => (
                    <option key={cat.slug} value={cat.name}>
                      {cat.parent} &gt; {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Condition
                </label>
                <select
                  name="condition"
                  defaultValue={params.condition || ""}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Any Condition</option>
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Price Range
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="minPrice"
                    placeholder="Min"
                    defaultValue={params.minPrice || ""}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    name="maxPrice"
                    placeholder="Max"
                    defaultValue={params.maxPrice || ""}
                    min="0"
                    step="0.01"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-gray-700">
                  Sort By
                </label>
                <select
                  name="sort"
                  defaultValue={params.sort || "createdAt-desc"}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  {SORT_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-2.5 text-sm font-medium text-white transition-all hover:from-indigo-700 hover:to-purple-700 shadow-sm hover:shadow-md"
              >
                Apply Filters
              </button>

              <Link
                href="/marketplace"
                className="block text-center text-sm text-gray-500 hover:text-indigo-600 transition-colors"
              >
                Clear all filters
              </Link>
            </form>
            </div>
          </div>
        </aside>

        <div className="flex-1">
          <ListingGrid
            listings={listings}
            emptyMessage="No listings match your filters. Try adjusting your search criteria."
          />

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-2">
              {page > 1 ? (
                <Link
                  href={`/marketplace?${buildQueryString(currentParams, { page: String(page - 1) })}`}
                  className="flex items-center gap-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              ) : (
                <span className="flex cursor-not-allowed items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              )}

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }

                  return (
                    <Link
                      key={pageNum}
                      href={`/marketplace?${buildQueryString(currentParams, { page: String(pageNum) })}`}
                      className={`rounded-xl px-3 py-2 text-sm font-medium transition-all ${
                        pageNum === page
                          ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-sm"
                          : "text-gray-700 hover:bg-gray-100"
                      }`}
                    >
                      {pageNum}
                    </Link>
                  );
                })}
              </div>

              {page < totalPages ? (
                <Link
                  href={`/marketplace?${buildQueryString(currentParams, { page: String(page + 1) })}`}
                  className="flex items-center gap-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              ) : (
                <span className="flex cursor-not-allowed items-center gap-1 rounded-xl border border-gray-200 px-4 py-2 text-sm font-medium text-gray-400">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
