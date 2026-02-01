"use client";

import Link from "next/link";
import { useEffect, useState, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  ShoppingBag,
  Check,
  Heart,
  Plus
} from "lucide-react";
import { ListingGrid, ListingGridSkeleton } from "@/components/listings";
import { cn } from "@/lib/utils";

// Category data with emojis and gradients
const SHOWCASE_CATEGORIES = [
  { name: "Electronics", emoji: "📱", gradient: "from-blue-500 to-cyan-500", count: 124 },
  { name: "Fashion", emoji: "👕", gradient: "from-pink-500 to-rose-500", count: 89 },
  { name: "Furniture", emoji: "🪑", gradient: "from-amber-500 to-orange-500", count: 45 },
  { name: "Books", emoji: "📚", gradient: "from-emerald-500 to-teal-500", count: 156 },
  { name: "Food", emoji: "🍔", gradient: "from-red-500 to-orange-500", count: 32 },
  { name: "Services", emoji: "🛠️", gradient: "from-purple-500 to-indigo-500", count: 67 },
  { name: "Events", emoji: "🎉", gradient: "from-yellow-500 to-amber-500", count: 23 },
  { name: "Other", emoji: "📦", gradient: "from-gray-500 to-slate-600", count: 78 },
];

const FILTER_PILLS = ["All", "Electronics", "Fashion", "Furniture", "Books", "Food", "Services", "Events"];

const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor", "Used"];

const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
];

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: "New" | "Like New" | "Good" | "Fair" | "Poor" | "Used";
  images: string[];
  seller: {
    name: string;
    isVerified?: boolean;
  };
  category?: string;
  location?: string;
  isFeatured?: boolean;
  createdAt?: string;
}

// Animated background shapes component
function AnimatedShapes() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating circles */}
      <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" />
      <div className="absolute -right-20 -bottom-20 h-64 w-64 rounded-full bg-white/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      <div className="absolute left-1/4 top-1/3 h-32 w-32 rounded-full bg-pink-300/20 blur-2xl animate-bounce" style={{ animationDuration: "3s" }} />
      <div className="absolute right-1/4 bottom-1/4 h-40 w-40 rounded-full bg-orange-300/20 blur-2xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "0.5s" }} />
      
      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23fff' fill-opacity='0.4'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }} />
      
      {/* Animated gradient orbs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-96 rounded-full bg-gradient-to-r from-purple-400/20 to-pink-400/20 blur-3xl animate-spin" style={{ animationDuration: "20s" }} />
    </div>
  );
}

// Category card component
function CategoryCard({ 
  category, 
  isActive, 
  onClick 
}: { 
  category: typeof SHOWCASE_CATEGORIES[0]; 
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "relative flex-shrink-0 flex flex-col items-center justify-center w-28 h-32 rounded-2xl transition-all duration-300 group",
        "hover:scale-105 hover:shadow-xl",
        isActive 
          ? `bg-gradient-to-br ${category.gradient} shadow-lg ring-2 ring-white/50` 
          : "bg-white/90 backdrop-blur-sm hover:bg-white"
      )}
    >
      <span className="text-4xl mb-2 group-hover:scale-110 transition-transform duration-300">
        {category.emoji}
      </span>
      <span className={cn(
        "text-sm font-semibold",
        isActive ? "text-white" : "text-gray-700"
      )}>
        {category.name}
      </span>
      <span className={cn(
        "absolute top-2 right-2 px-2 py-0.5 rounded-full text-xs font-medium",
        isActive 
          ? "bg-white/20 text-white" 
          : "bg-gray-100 text-gray-600"
      )}>
        {category.count}
      </span>
    </button>
  );
}

// Filter pill component
function FilterPill({ 
  label, 
  isActive, 
  onClick 
}: { 
  label: string; 
  isActive: boolean; 
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300",
        isActive 
          ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25" 
          : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
      )}
    >
      {label}
    </button>
  );
}

// Active filter chip
function ActiveFilterChip({ 
  label, 
  onRemove 
}: { 
  label: string; 
  onRemove: () => void;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-purple-100 px-3 py-1.5 text-sm font-medium text-purple-700 animate-slide-in-from-left">
      <span>{label}</span>
      <button
        onClick={onRemove}
        className="rounded-full hover:bg-purple-200 p-0.5 transition-colors"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </span>
  );
}

// Empty state component
function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50 py-20 px-8 text-center">
      {/* Emoji composition illustration */}
      <div className="relative mb-6">
        <div className="text-7xl animate-bounce" style={{ animationDuration: "2s" }}>📦</div>
        <div className="absolute -right-4 -top-2 text-3xl animate-pulse">✨</div>
        <div className="absolute -left-4 -bottom-2 text-3xl animate-pulse" style={{ animationDelay: "0.5s" }}>🔍</div>
      </div>
      <h3 className="mb-3 text-2xl font-bold text-gray-900">No items found</h3>
      <p className="mb-8 max-w-md text-gray-500">
        We couldn&apos;t find any items matching your search. Try adjusting your filters or be the first to list something!
      </p>
      <Link
        href="/sell"
        className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105"
      >
        <Plus className="h-5 w-5 group-hover:rotate-90 transition-transform duration-300" />
        Be the first to sell!
      </Link>
    </div>
  );
}

// Pagination component
function Pagination({ 
  currentPage, 
  totalPages, 
  onPageChange 
}: { 
  currentPage: number; 
  totalPages: number; 
  onPageChange: (page: number) => void;
}) {
  const pages = [];
  const maxVisible = 5;
  
  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);
  
  if (end - start + 1 < maxVisible) {
    start = Math.max(1, end - maxVisible + 1);
  }
  
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-2 mt-12">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
          currentPage === 1
            ? "cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-400"
            : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow"
        )}
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-1">
        {pages.map((page) => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl text-sm font-medium transition-all duration-300",
              page === currentPage
                ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg shadow-purple-500/25 scale-110"
                : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:scale-105"
            )}
          >
            {page}
          </button>
        ))}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={cn(
          "flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all duration-300",
          currentPage === totalPages
            ? "cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-400"
            : "border border-gray-200 bg-white text-gray-700 shadow-sm hover:bg-gray-50 hover:shadow"
        )}
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </nav>
  );
}

function MarketplaceContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [sellerCount, setSellerCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "");
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "All");
  const [selectedCondition, setSelectedCondition] = useState(searchParams.get("condition") || "");
  const [sortBy, setSortBy] = useState(searchParams.get("sort") || "createdAt-desc");
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (searchQuery) params.set("q", searchQuery);
      if (activeCategory && activeCategory !== "All") params.set("category", activeCategory);
      if (selectedCondition) params.set("condition", selectedCondition);
      if (sortBy) params.set("sort", sortBy);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("page", String(currentPage));

      const res = await fetch(`/api/listings?${params.toString()}`);
      const data = await res.json();
      
      setListings(data.listings || []);
      setTotal(data.total || 0);
      setSellerCount(data.sellerCount || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error("Failed to fetch listings:", error);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, activeCategory, selectedCondition, sortBy, minPrice, maxPrice, currentPage]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    fetchListings();
  };

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setCurrentPage(1);
  };

  const handleRemoveFilter = (filterType: string) => {
    switch (filterType) {
      case "category":
        setActiveCategory("All");
        break;
      case "condition":
        setSelectedCondition("");
        break;
      case "price":
        setMinPrice("");
        setMaxPrice("");
        break;
      case "search":
        setSearchQuery("");
        break;
    }
    setCurrentPage(1);
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setActiveCategory("All");
    setSelectedCondition("");
    setMinPrice("");
    setMaxPrice("");
    setSortBy("createdAt-desc");
    setCurrentPage(1);
  };

  const hasActiveFilters = activeCategory !== "All" || selectedCondition || minPrice || maxPrice || searchQuery;

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-600 via-pink-500 to-orange-400">
        <AnimatedShapes />
        
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          {/* Badge */}
          <div className="mb-6 flex justify-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-sm font-medium text-white backdrop-blur-sm animate-fade-in">
              <Sparkles className="h-4 w-4 animate-pulse" />
              Campus Student Marketplace
              <Check className="h-4 w-4" />
            </div>
          </div>

          {/* Title */}
          <h1 className="mb-4 text-center text-4xl font-bold text-white md:text-6xl animate-fade-in" style={{ animationDelay: "100ms" }}>
            Find Amazing Deals
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-center text-lg text-white/80 animate-fade-in" style={{ animationDelay: "200ms" }}>
            Buy and sell with fellow students. Great prices, trusted community.
          </p>

          {/* Stats */}
          <div className="mb-10 flex flex-wrap items-center justify-center gap-4 md:gap-6 animate-fade-in animate-slide-in-from-bottom" style={{ animationDelay: "300ms" }}>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Package className="h-5 w-5" />
              <span className="font-semibold">{total > 0 ? total : 500}+ Items</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
              <Users className="h-5 w-5" />
              <span className="font-semibold">{sellerCount > 0 ? sellerCount : 100}+ Sellers</span>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/20 px-5 py-2.5 text-white backdrop-blur-sm hover:bg-white/30 transition-colors">
              <TrendingUp className="h-5 w-5" />
              <span className="font-semibold">Campus Verified ✓</span>
            </div>
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="mx-auto max-w-2xl animate-fade-in" style={{ animationDelay: "400ms" }}>
            <div className="relative group">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for electronics, books, fashion..."
                className="w-full rounded-2xl border-0 bg-white py-5 pl-14 pr-36 text-gray-900 shadow-2xl placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
              />
              <button
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-lg transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Category Showcase */}
      <div className="relative -mt-8 mx-auto max-w-7xl px-4">
        <div className="overflow-x-auto pb-4 scrollbar-hide">
          <div className="flex gap-4 min-w-max animate-fade-in" style={{ animationDelay: "500ms" }}>
            {SHOWCASE_CATEGORIES.map((category, index) => (
              <CategoryCard
                key={category.name}
                category={category}
                isActive={activeCategory === category.name}
                onClick={() => handleCategoryChange(category.name)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-lg border-b border-gray-100 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4">
          <div className="flex flex-wrap items-center gap-3">
            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {FILTER_PILLS.map((pill) => (
                <FilterPill
                  key={pill}
                  label={pill}
                  isActive={activeCategory === pill || (pill === "All" && activeCategory === "All")}
                  onClick={() => handleCategoryChange(pill)}
                />
              ))}
            </div>

            <div className="h-8 w-px bg-gray-200 mx-2 hidden md:block" />

            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Price Toggle */}
            <button
              onClick={() => setShowPriceFilter(!showPriceFilter)}
              className={cn(
                "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
                showPriceFilter || (minPrice || maxPrice)
                  ? "bg-purple-100 text-purple-700"
                  : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
              )}
            >
              <SlidersHorizontal className="h-4 w-4" />
              Price Range
            </button>

            {/* Condition Filter */}
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
            >
              <option value="">Any Condition</option>
              {CONDITIONS.map((cond) => (
                <option key={cond} value={cond}>
                  {cond}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range Inputs (Collapsible) */}
          {showPriceFilter && (
            <div className="mt-4 flex items-center gap-4 animate-slide-in-from-top">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">Ksh</span>
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
                <span className="text-gray-400">-</span>
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-24 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/20"
                />
              </div>
              <button
                onClick={() => {
                  setCurrentPage(1);
                  fetchListings();
                }}
                className="rounded-lg bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
              >
                Apply
              </button>
            </div>
          )}

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mt-4 flex flex-wrap items-center gap-2 animate-fade-in">
              <span className="text-sm text-gray-500">Active filters:</span>
              {searchQuery && (
                <ActiveFilterChip
                  label={`Search: "${searchQuery}"`}
                  onRemove={() => handleRemoveFilter("search")}
                />
              )}
              {activeCategory !== "All" && (
                <ActiveFilterChip
                  label={`Category: ${activeCategory}`}
                  onRemove={() => handleRemoveFilter("category")}
                />
              )}
              {selectedCondition && (
                <ActiveFilterChip
                  label={`Condition: ${selectedCondition}`}
                  onRemove={() => handleRemoveFilter("condition")}
                />
              )}
              {(minPrice || maxPrice) && (
                <ActiveFilterChip
                  label={`Price: Ksh ${minPrice || "0"} - ${maxPrice || "∞"}`}
                  onRemove={() => handleRemoveFilter("price")}
                />
              )}
              <button
                onClick={clearAllFilters}
                className="text-sm font-medium text-red-600 hover:text-red-700 transition-colors"
              >
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Results Header */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Showing <span className="font-semibold text-gray-900">{listings.length}</span> of{" "}
            <span className="font-semibold text-gray-900">{total}</span> items
          </p>
        </div>

        {/* Grid / Loading / Empty State */}
        {loading ? (
          <ListingGridSkeleton count={8} />
        ) : listings.length > 0 ? (
          <div className="animate-fade-in">
            <ListingGrid
              listings={listings}
              emptyMessage="No listings match your filters."
              showEmptyState={false}
            />
          </div>
        ) : (
          <EmptyState />
        )}

        {/* Pagination */}
        {!loading && listings.length > 0 && totalPages > 1 && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              setCurrentPage(page);
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          />
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading marketplace...</p>
        </div>
      </div>
    }>
      <MarketplaceContent />
    </Suspense>
  );
}
