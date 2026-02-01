"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Eye, MapPin, User, Sparkles, ImageIcon, Clock } from "lucide-react";
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
  createdAt?: string;
  onFavoriteToggle?: (id: string) => void;
  index?: number;
}

const conditionStyles: Record<Condition, { bg: string; text: string; border: string }> = {
  New: { bg: "bg-emerald-100", text: "text-emerald-700", border: "border-emerald-200" },
  "Like New": { bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
  Good: { bg: "bg-blue-100", text: "text-blue-700", border: "border-blue-200" },
  Fair: { bg: "bg-amber-100", text: "text-amber-700", border: "border-amber-200" },
  Poor: { bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  Used: { bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
};

function timeAgo(dateString?: string): string {
  if (!dateString) return "";
  
  const date = new Date(dateString);
  const now = new Date();
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
  
  if (seconds < 60) return "Just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
  if (seconds < 2592000) return `${Math.floor(seconds / 604800)}w ago`;
  return `${Math.floor(seconds / 2592000)}mo ago`;
}

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
  createdAt,
  onFavoriteToggle,
  index = 0,
}: ListingCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);
  const [heartAnimating, setHeartAnimating] = React.useState(false);
  const [imageLoaded, setImageLoaded] = React.useState(false);

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setHeartAnimating(true);
    setTimeout(() => setHeartAnimating(false), 500);
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
        className={cn(
          "group relative overflow-hidden rounded-2xl bg-white shadow-md hover:shadow-2xl transition-all duration-500 border border-gray-100",
          "animate-fade-in animate-slide-in-from-bottom"
        )}
        style={{ 
          animationDelay: `${index * 50}ms`,
          animationFillMode: "both"
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container */}
        <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50">
          {images.length > 0 ? (
            <>
              <img
                src={images[0]}
                alt={title}
                onLoad={() => setImageLoaded(true)}
                className={cn(
                  "h-full w-full object-cover transition-all duration-700",
                  isHovered ? "scale-110" : "scale-100",
                  imageLoaded ? "opacity-100" : "opacity-0"
                )}
              />
              {!imageLoaded && (
                <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200" />
              )}
            </>
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
              <div className="text-center">
                <ImageIcon className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-2 text-sm text-gray-400">No image</p>
              </div>
            </div>
          )}

          {/* Gradient Overlay on Hover */}
          <div
            className={cn(
              "absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent transition-opacity duration-500",
              isHovered ? "opacity-100" : "opacity-0"
            )}
          />

          {/* Quick View Button */}
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center transition-all duration-500",
              isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            )}
          >
            <button className="flex items-center gap-2 rounded-full bg-white/95 px-6 py-3 text-sm font-semibold text-gray-900 shadow-xl backdrop-blur-sm transition-all hover:scale-110 hover:bg-white">
              <Eye className="h-4 w-4" />
              Quick View
            </button>
          </div>

          {/* Featured Badge */}
          {isFeatured && (
            <div className="absolute left-3 top-3 animate-slide-in-from-left">
              <div className="flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 px-3 py-1.5 text-xs font-bold text-white shadow-lg">
                <Sparkles className="h-3.5 w-3.5 animate-pulse" />
                Featured
              </div>
            </div>
          )}

          {/* Favorite Button */}
          <button
            onClick={handleFavoriteClick}
            className={cn(
              "absolute right-3 top-3 rounded-full p-3 shadow-xl transition-all duration-300 z-10",
              isFavorited
                ? "bg-red-500 text-white scale-110"
                : "bg-white/95 text-gray-600 hover:bg-white hover:text-red-500 hover:scale-110",
              heartAnimating && "animate-ping-once"
            )}
            aria-label={isFavorited ? "Remove from wishlist" : "Add to wishlist"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-all duration-300",
                isFavorited && "fill-current",
                heartAnimating && "scale-150"
              )}
            />
          </button>

          {/* Condition Badge - Bottom Left of Image */}
          <div className={cn(
            "absolute bottom-3 left-3 transition-all duration-300",
            isHovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-90"
          )}>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1.5 text-xs font-bold backdrop-blur-md border",
                conditionStyles[condition].bg,
                conditionStyles[condition].text,
                conditionStyles[condition].border
              )}
            >
              {condition}
            </span>
          </div>

          {/* Time Posted - Bottom Right */}
          {createdAt && (
            <div className={cn(
              "absolute bottom-3 right-3 transition-all duration-300",
              isHovered ? "translate-y-0 opacity-100" : "translate-y-1 opacity-90"
            )}>
              <span className="inline-flex items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-xs font-medium text-white backdrop-blur-md">
                <Clock className="h-3 w-3" />
                {timeAgo(createdAt)}
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4">
          {/* Category & Location Badges */}
          <div className="mb-2.5 flex flex-wrap items-center gap-2">
            {category && (
              <span className="inline-flex items-center rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 px-2.5 py-1 text-xs font-semibold text-purple-700 border border-purple-100">
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
          <h3 className="mb-3 line-clamp-2 text-base font-bold text-gray-900 group-hover:text-purple-600 transition-colors duration-300">
            {title}
          </h3>

          {/* Price */}
          <div className="mb-4">
            <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-500 to-orange-500 bg-clip-text text-transparent">
              Ksh {formatPrice(price)}
            </span>
          </div>

          {/* Seller Info */}
          <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
            <div className="relative">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 text-white shadow-lg">
                <User className="h-5 w-5" />
              </div>
              {seller.isVerified && (
                <div className="absolute -bottom-0.5 -right-0.5 rounded-full bg-white p-0.5">
                  <svg className="h-4 w-4 text-emerald-500" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="truncate text-sm font-semibold text-gray-800">
                {seller.name}
              </p>
              {seller.isVerified && (
                <span className="inline-flex items-center text-xs font-medium text-emerald-600">
                  Verified Seller
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}

// Enhanced Skeleton loader with shimmer effect
export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-md border border-gray-100">
      <div className="relative aspect-[4/3] overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer" 
          style={{
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite"
          }}
        />
      </div>
      <div className="p-4">
        <div className="mb-2.5 flex gap-2">
          <div className="h-6 w-16 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" />
          <div className="h-6 w-20 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" style={{ animationDelay: "0.1s" }} />
        </div>
        <div className="mb-2 h-5 w-3/4 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" style={{ animationDelay: "0.2s" }} />
        <div className="mb-4 h-8 w-28 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" style={{ animationDelay: "0.3s" }} />
        <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" style={{ animationDelay: "0.4s" }} />
          <div className="flex-1">
            <div className="h-4 w-24 rounded-lg bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse" style={{ animationDelay: "0.5s" }} />
          </div>
        </div>
      </div>
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
    </div>
  );
}
