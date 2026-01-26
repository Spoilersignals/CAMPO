import * as React from "react";
import { ListingCard } from "./listing-card";
import type { Condition } from "@/lib/constants";

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
  isFeatured?: boolean;
}

interface ListingGridProps {
  listings: Listing[];
  favorites?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  emptyMessage?: string;
}

export function ListingGrid({
  listings,
  favorites = new Set(),
  onFavoriteToggle,
  emptyMessage = "No listings found",
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex min-h-[200px] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
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
