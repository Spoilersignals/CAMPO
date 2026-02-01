import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { 
  FLAT_CATEGORIES, 
  CONDITIONS, 
  ITEMS_PER_PAGE, 
  SORT_OPTIONS, 
  QUICK_CATEGORIES,
  CATEGORY_ICONS,
  CATEGORIES 
} from "@/lib/constants";
import { ListingGrid } from "@/components/listings";
import { 
  ChevronLeft, 
  ChevronRight, 
  SlidersHorizontal, 
  Search, 
  Sparkles, 
  TrendingUp,
  Users,
  Package,
  X,
  ShoppingBag
} from "lucide-react";

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

  const [listings, total, sellerCount] = await Promise.all([
    prisma.listing.findMany({
      where,
      include: {
        seller: true,
        photos: {
          orderBy: { sortOrder: "asc" },
        },
        category: true,
      },
      skip,
      take: ITEMS_PER_PAGE,
      orderBy,
    }),
    prisma.listing.count({ where }),
    prisma.user.count({ where: { role: "SELLER" } }),
  ]);

  return {
    listings: listings.map((listing: {
      id: string;
      title: string;
      price: number;
      condition: string;
      photos: { url: string }[];
      seller: { name: string | null; isVerified: boolean };
      category: { name: string } | null;
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
      category: listing.category?.name,
      isFeatured: listing.isFeatured,
    })),
    total,
    sellerCount,
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

// Active filter chip component
function ActiveFilterChip({ 
  label, 
  value, 
  href 
}: { 
  label: string; 
  value: string; 
  href: string;
}) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 transition-colors hover:bg-purple-200"
    >
      <span>{label}: {value}</span>
      <X className="h-3.5 w-3.5" />
    </Link>
  );
}

export default async function MarketplacePage({ searchParams }: MarketplacePageProps) {
  const params = await searchParams;
  const { listings, total, sellerCount, page, totalPages } = await getListings(params);

  const currentParams = {
    q: params.q,
    category: params.category,
    condition: params.condition,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    sort: params.sort,
    featured: params.featured,
  };

  const hasActiveFilters = params.category || params.condition || params.minPrice || params.maxPrice || params.q;

  return (
    <div className="min-h-screen bg-gray-50/50">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Decorative Circles */}
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16">
          {/* Title & Stats */}
          <div className="mb-8 text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
              <Sparkles className="h-4 w-4" />
              Campus Student Marketplace
            </div>
            <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">
              Find Amazing Deals
            </h1>
            <p className="mx-auto max-w-2xl text-lg text-white/80">
              Buy and sell with fellow students. Great prices, trusted community.
            </p>

            {/* Stats */}
            <div className="mt-6 flex flex-wrap items-center justify-center gap-4 md:gap-8">
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                <Package className="h-5 w-5" />
                <span className="font-semibold">{total}+ Items</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                <Users className="h-5 w-5" />
                <span className="font-semibold">{sellerCount}+ Sellers</span>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-white backdrop-blur-sm">
                <TrendingUp className="h-5 w-5" />
                <span className="font-semibold">Best Prices</span>
              </div>
            </div>
          </div>

          {/* Search Bar */}
          <form action="/marketplace" method="GET" className="mx-auto max-w-2xl">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                name="q"
                defaultValue={params.q}
                placeholder="Search for items..."
                className="w-full rounded-2xl border-0 bg-white py-4 pl-12 pr-32 text-gray-900 shadow-xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30"
              />
              <button
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-lg"
              >
                Search
              </button>
            </div>
          </form>

          {/* Quick Category Pills */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {QUICK_CATEGORIES.map((cat) => (
              <Link
                key={cat.name}
                href={`/marketplace?category=${encodeURIComponent(cat.name)}`}
                className="inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/30 hover:scale-105"
              >
                <span>{cat.icon}</span>
                <span>{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Category Cards Section */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">Browse Categories</h2>
          <Link href="/categories" className="text-sm font-medium text-purple-600 hover:text-purple-700">
            View All
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
          {Object.entries(CATEGORIES).map(([parent, children]) => (
            <Link
              key={parent}
              href={`/marketplace?category=${encodeURIComponent(children[0])}`}
              className="group flex-shrink-0"
            >
              <div className="relative h-32 w-48 overflow-hidden rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-4 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-105">
                <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="relative z-10">
                  <span className="text-3xl">{CATEGORY_ICONS[parent]}</span>
                  <h3 className="mt-2 font-bold text-white">{parent}</h3>
                  <p className="text-sm text-white/80">{children.length} subcategories</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 pb-12">
        {/* Active Filters */}
        {hasActiveFilters && (
          <div className="mb-6 flex flex-wrap items-center gap-2">
            <span className="text-sm font-medium text-gray-500">Active filters:</span>
            {params.q && (
              <ActiveFilterChip 
                label="Search" 
                value={params.q} 
                href={`/marketplace?${buildQueryString(currentParams, { q: undefined })}`}
              />
            )}
            {params.category && (
              <ActiveFilterChip 
                label="Category" 
                value={params.category} 
                href={`/marketplace?${buildQueryString(currentParams, { category: undefined })}`}
              />
            )}
            {params.condition && (
              <ActiveFilterChip 
                label="Condition" 
                value={params.condition} 
                href={`/marketplace?${buildQueryString(currentParams, { condition: undefined })}`}
              />
            )}
            {(params.minPrice || params.maxPrice) && (
              <ActiveFilterChip 
                label="Price" 
                value={`Ksh ${params.minPrice || '0'} - ${params.maxPrice || '∞'}`} 
                href={`/marketplace?${buildQueryString(currentParams, { minPrice: undefined, maxPrice: undefined })}`}
              />
            )}
            <Link
              href="/marketplace"
              className="text-sm font-medium text-red-600 hover:text-red-700"
            >
              Clear all
            </Link>
          </div>
        )}

        <div className="flex flex-col gap-8 lg:flex-row">
          {/* Filters Sidebar */}
          <aside className="w-full shrink-0 lg:w-72">
            <div className="sticky top-20 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
              {/* Filter Header */}
              <div className="flex items-center justify-between border-b border-gray-100 bg-gradient-to-r from-purple-50 to-pink-50 p-4">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="h-5 w-5 text-purple-600" />
                  <h2 className="font-semibold text-gray-900">Filters</h2>
                </div>
                {hasActiveFilters && (
                  <Link
                    href="/marketplace"
                    className="text-xs font-medium text-purple-600 hover:text-purple-700"
                  >
                    Reset
                  </Link>
                )}
              </div>

              <form method="GET" className="p-4">
                {params.q && <input type="hidden" name="q" value={params.q} />}

                {/* Category Filter */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-gray-900">
                    Category
                  </label>
                  <select
                    name="category"
                    defaultValue={params.category || ""}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">All Categories</option>
                    {FLAT_CATEGORIES.map((cat) => (
                      <option key={cat.slug} value={cat.name}>
                        {CATEGORY_ICONS[cat.name]} {cat.parent} &gt; {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Condition Filter */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-gray-900">
                    Condition
                  </label>
                  <select
                    name="condition"
                    defaultValue={params.condition || ""}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    <option value="">Any Condition</option>
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Price Range */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-gray-900">
                    Price Range (Ksh)
                  </label>
                  <div className="flex items-center gap-3">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Ksh</span>
                      <input
                        type="number"
                        name="minPrice"
                        placeholder="Min"
                        defaultValue={params.minPrice || ""}
                        min="0"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-gray-400">Ksh</span>
                      <input
                        type="number"
                        name="maxPrice"
                        placeholder="Max"
                        defaultValue={params.maxPrice || ""}
                        min="0"
                        className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                      />
                    </div>
                  </div>
                </div>

                {/* Sort By */}
                <div className="mb-6">
                  <label className="mb-3 block text-sm font-semibold text-gray-900">
                    Sort By
                  </label>
                  <select
                    name="sort"
                    defaultValue={params.sort || "createdAt-desc"}
                    className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm focus:border-purple-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                  >
                    {SORT_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Apply Button */}
                <button
                  type="submit"
                  className="w-full rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:shadow-purple-500/30"
                >
                  Apply Filters
                </button>
              </form>
            </div>
          </aside>

          {/* Listings Grid */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="mb-6 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing <span className="font-semibold text-gray-900">{listings.length}</span> of{" "}
                <span className="font-semibold text-gray-900">{total}</span> items
              </p>
            </div>

            {/* Grid */}
            {listings.length > 0 ? (
              <ListingGrid
                listings={listings}
                emptyMessage="No listings match your filters."
              />
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 px-8 text-center">
                <div className="mb-4 rounded-full bg-purple-100 p-4">
                  <ShoppingBag className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">No items found</h3>
                <p className="mb-6 max-w-sm text-gray-500">
                  We couldn&apos;t find any items matching your filters. Try adjusting your search or browse all items.
                </p>
                <Link
                  href="/marketplace"
                  className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
                >
                  Browse All Items
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <nav className="mt-8 flex items-center justify-center gap-2">
                {page > 1 ? (
                  <Link
                    href={`/marketplace?${buildQueryString(currentParams, { page: String(page - 1) })}`}
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Previous
                  </Link>
                ) : (
                  <span className="flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400">
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
                        className={`flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all ${
                          pageNum === page
                            ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25"
                            : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
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
                    className="flex items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 hover:shadow"
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <span className="flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-gray-100 bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-400">
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </span>
                )}
              </nav>
            )}

            {/* Load More Style Alternative */}
            {totalPages > 1 && page < totalPages && (
              <div className="mt-6 text-center">
                <Link
                  href={`/marketplace?${buildQueryString(currentParams, { page: String(page + 1) })}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-purple-600 hover:text-purple-700"
                >
                  Load more items
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
