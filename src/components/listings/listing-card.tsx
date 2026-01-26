"use client";

import * as React from "react";
import Link from "next/link";
import { Heart, Star, BadgeCheck, Sparkles, ImageIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  isFeatured?: boolean;
  isFavorited?: boolean;
  onFavoriteToggle?: (id: string) => void;
}

const conditionVariant: Record<Condition, "success" | "default" | "warning"> = {
  New: "success",
  "Like New": "success",
  Good: "default",
  Fair: "warning",
  Poor: "warning",
  Used: "default",
};

export function ListingCard({
  id,
  title,
  price,
  condition,
  images,
  seller,
  isFeatured = false,
  isFavorited = false,
  onFavoriteToggle,
}: ListingCardProps) {
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onFavoriteToggle?.(id);
  };

  return (
    <Link href={`/listings/${id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-square overflow-hidden bg-gray-100">
          {images.length > 0 ? (
            <img
              src={images[0]}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          {isFeatured && (
            <div className="absolute left-2 top-2">
              <Badge className="bg-yellow-500 text-white">
                <Sparkles className="mr-1 h-3 w-3" />
                Featured
              </Badge>
            </div>
          )}

          <button
            onClick={handleFavoriteClick}
            className="absolute right-2 top-2 rounded-full bg-white/80 p-2 shadow-sm transition-colors hover:bg-white"
            aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
          >
            <Heart
              className={cn(
                "h-5 w-5 transition-colors",
                isFavorited ? "fill-red-500 text-red-500" : "text-gray-600"
              )}
            />
          </button>
        </div>

        <div className="p-4">
          <div className="mb-2 flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 font-medium text-gray-900">{title}</h3>
            <Badge variant={conditionVariant[condition]}>{condition}</Badge>
          </div>

          <p className="mb-3 text-lg font-semibold text-blue-600">
            ${price.toFixed(2)}
          </p>

          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            <span>{seller.name}</span>
            {seller.isVerified && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}
