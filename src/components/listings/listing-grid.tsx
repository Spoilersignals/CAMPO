"use client";

import * as React from "react";
import { ListingCard, ListingCardSkeleton } from "./listing-card";
import type { Condition } from "@/lib/constants";
import { ShoppingBag, Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

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
  createdAt?: string;
}

interface ListingGridProps {
  listings: Listing[];
  favorites?: Set<string>;
  onFavoriteToggle?: (id: string) => void;
  emptyMessage?: string;
  showEmptyState?: boolean;
  columns?: 2 | 3 | 4;
}

export function ListingGrid({
  listings,
  favorites = new Set(),
  onFavoriteToggle,
  emptyMessage = "No listings found",
  showEmptyState = true,
  columns = 3,
}: ListingGridProps) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  if (listings.length === 0 && showEmptyState) {
    return (
      <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-gray-200 bg-gradient-to-b from-white to-gray-50 py-20 px-8 text-center">
        {/* Emoji composition illustration */}
        <div className="relative mb-6">
          <div className="text-7xl animate-bounce" style={{ animationDuration: "2s" }}>📦</div>
          <div className="absolute -right-4 -top-2 text-3xl animate-pulse">✨</div>
          <div className="absolute -left-4 -bottom-2 text-3xl animate-pulse" style={{ animationDelay: "0.5s" }}>🔍</div>
        </div>
        <h3 className="mb-3 text-2xl font-bold text-gray-900">No items found</h3>
        <p className="mb-8 max-w-md text-gray-500">{emptyMessage}</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/marketplace"
            className="rounded-xl border border-gray-200 bg-white px-6 py-2.5 font-medium text-gray-700 transition-all hover:bg-gray-50 hover:shadow-md"
          >
            Browse All Items
          </Link>
          <Link
            href="/sell"
            className="group inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-2.5 font-medium text-white shadow-lg shadow-purple-500/25 transition-all hover:from-purple-700 hover:to-pink-700 hover:shadow-xl hover:scale-105"
          >
            <Plus className="h-4 w-4 group-hover:rotate-90 transition-transform duration-300" />
            Be the first to sell!
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("grid gap-6", gridCols[columns])}>
      {listings.map((listing, index) => (
        <ListingCard
          key={listing.id}
          {...listing}
          isFavorited={favorites.has(listing.id)}
          onFavoriteToggle={onFavoriteToggle}
          index={index}
        />
      ))}
    </div>
  );
}

// Enhanced skeleton grid with stagger animation
export function ListingGridSkeleton({ count = 6, columns = 3 }: { count?: number; columns?: 2 | 3 | 4 }) {
  const gridCols = {
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
  };

  return (
    <div className={cn("grid gap-6", gridCols[columns])}>
      {Array.from({ length: count }).map((_, i) => (
        <div 
          key={i}
          className="animate-fade-in"
          style={{ animationDelay: `${i * 50}ms`, animationFillMode: "both" }}
        >
          <ListingCardSkeleton />
        </div>
      ))}
    </div>
  );
}
