"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Eye, MapPin, User, Sparkles, ImageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Condition } from "@/lib/constants";

interface ListingCardProps {
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
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

const conditionStyles: Record<Condition, { bg: string; text: string }> = {
  New: { bg: "bg-emerald-100", text: "text-emerald-700" },
  "Like New": { bg: "bg-green-100", text: "text-green-700" },
  Good: { bg: "bg-blue-100", text: "text-blue-700" },
  Fair: { bg: "bg-amber-100", text: "text-amber-700" },
  Poor: { bg: "bg-red-100", text: "text-red-700" },
  Used: { bg: "bg-gray-100", text: "text-gray-700" },
};

export function ListingCard({
  id,
  title,
  price,
  condition,
  images,
  seller,
  category,
  location,
  isFeatured = false,
  isFavorited = false,
  onFavoriteToggle,
}: ListingCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [heartAnimating, setHeartAnimating] = React.useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 300);
    onFavoriteToggle?.(id);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-KE", {
      style: "decimal",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  return (
    <Link href={`/listings/${id}`}>
      <div
        className="group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No image</p>
              </div>
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent transition-opacity duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Quick View Button */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-300",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          >
            <button className="flex items-center gap-2 rounded-full bg-white/95 px-5 py-2.5 text-sm font-medium text-gray-900 shadow-lg backdrop-blur-sm transition-transform hover:scale-105">
              <Eye className="h-4 w-4" />
              Quick View
            </button>
          </div>

          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute left-3 top-3">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-lg">
                <Sparkles className="h-3.5 w-3.5" />
                Featured
              </div>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute right-3 top-3 rounded-full p-2.5 shadow-lg transition-all duration-300",
              isFavorited
                ? "bg-red-500 text-white"
                : "bg-white/90 text-gray-600 hover:bg-white hover:text-red-500",
              heartAnimating && "scale-125"
            )}
            aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isFavorited && "fill-current",
                heartAnimating && "animate-pulse"
              )}
            />
          </button>

          {/* Condition Badge - Bottom Left of Image */}
          <div className="absolute bottom-3 left-3">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold backdrop-blur-sm",
                conditionStyles[condition].bg,
                conditionStyles[condition].text
              )}
            >
              {condition}
            </span>
          </div>
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Location Badges */}
          <div className="mb-2 flex flex-wrap items-center gap-2">
            {category && (
              <span className="inline-flex items-center rounded-md bg-purple-50 px-2 py-1 text-xs font-medium text-purple-700">
                {category}
              </span>
            )}
            {location && (
              <span className="inline-flex items-center gap-1 text-xs text-gray-500">
                <MapPin className="h-3 w-3" />
                {location}
              </span>
            )}
          </div>

          {/* Title */}
          <h3 className="mb-2 line-clamp-2 text-base font-semibold text-gray-900 group-hover:text-purple-600 transition-colors">
            {title}
          </h3>

          {/* Price */}
          <div className="mb-3">
            <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Ksh {formatPrice(price)}
            </span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 to-pink-400 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">
                {seller.name}
              </p>
              {seller.isVerified && (
                <span className="inline-flex items-center text-xs text-emerald-600">
                  <svg className="mr-1 h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Verified
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Skeleton loader for listing cards
export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100 animate-pulse">
      <div className="aspect-[4/3] bg-gradient-to-br from-gray-200 to-gray-100" />
      <div className="p-4">
        <div className="mb-2 flex gap-2">
          <div className="h-5 w-16 rounded-md bg-gray-200" />
          <div className="h-5 w-20 rounded-md bg-gray-200" />
        </div>
        <div className="mb-2 h-5 w-3/4 rounded bg-gray-200" />
        <div className="mb-3 h-7 w-24 rounded bg-gray-200" />
        <div className="flex items-center gap-2 border-t border-gray-100 pt-3">
          <div className="h-8 w-8 rounded-full bg-gray-200" />
          <div className="h-4 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </div>
  );
}
