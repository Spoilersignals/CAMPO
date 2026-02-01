import * as React from "react";
import { ListingCard, ListingCardSkeleton } from "./listing-card";
import type { Condition } from "@/lib/constants";
import { ShoppingBag } from "lucide-react";
import Link from "next/link";

interface Listing {
  id: string;
  title: string;
  price: number;
  condition: Condition;
  images: string[];
  seller: {
    name: string;
    isVerified?: boolean;
  };
  category?: string;
  location?: string;
  isFeatured?: boolean;
}

interface ListingGridProps {
  listings: Listing[];
  favorites?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  emptyMessage?: string;
  showEmptyState?: boolean;
}

export function ListingGrid({
  listings,
  favorites = new Set(),
  onFavoriteToggle,
  emptyMessage = "No listings found",
  showEmptyState = true,
}: ListingGridProps) {
  if (listings.length === 0 && showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-16 px-8 text-center">
        <div className="mb-4 rounded-full bg-purple-100 p-4">
          <ShoppingBag className="h-8 w-8 text-purple-600" />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-gray-900">No items found</h3>
        <p className="mb-6 max-w-sm text-gray-500">{emptyMessage}</p>
        <Link
          href="/marketplace"
          className="rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-medium text-white transition-all hover:from-purple-700 hover:to-pink-700"
        >
          Browse All Items
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          {...listing}
          isFavorited={favorites.has(listing.id)}
          onFavoriteToggle={onFavoriteToggle}
        />
      ))}
    </div>
  );
}

// Skeleton grid for loading states
export function ListingGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ListingCardSkeleton key={i} />
      ))}
    </div>
  );
}
