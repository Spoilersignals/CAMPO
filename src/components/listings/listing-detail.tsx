"use client";

import * as React from "react";
import {
  MessageCircle,
  Flag,
  MapPin,
  Truck,
  Star,
  BadgeCheck,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { ImageGallery } from "./image-gallery";
import type { Condition, DeliveryMethod } from "@/lib/constants";

interface ListingDetailProps {
  title: string;
  description: string;
  price: number;
  category: string;
  condition: Condition;
  deliveryMethod: DeliveryMethod;
  pickupLocation?: string;
  images: string[];
  createdAt: Date;
  seller: {
    id: string;
    name: string;
    avatar?: string;
    rating?: number;
    reviewCount?: number;
    isVerified?: boolean;
  };
  onContactSeller?: () => void;
  onReport?: () => void;
}

const conditionVariant: Record<Condition, "success" | "default" | "warning"> = {
  New: "success",
  "Like New": "success",
  Good: "default",
  Fair: "warning",
  Poor: "warning",
  Used: "default",
};

export function ListingDetail({
  title,
  description,
  price,
  category,
  condition,
  deliveryMethod,
  pickupLocation,
  images,
  createdAt,
  seller,
  onContactSeller,
  onReport,
}: ListingDetailProps) {
  const formattedDate = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(createdAt);

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <div>
        <ImageGallery images={images} alt={title} />
      </div>

      <div className="space-y-6">
        <div>
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge variant={conditionVariant[condition]}>{condition}</Badge>
            <Badge>{category}</Badge>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">{title}</h1>
          <p className="text-3xl font-bold text-blue-600">${price.toFixed(2)}</p>
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Clock className="h-4 w-4" />
          <span>Listed on {formattedDate}</span>
        </div>

        <div className="rounded-lg border border-gray-200 p-4">
          <div className="mb-4 flex items-center gap-3">
            <Avatar src={seller.avatar} fallback={seller.name} size="lg" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-gray-900">{seller.name}</span>
                {seller.isVerified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" />
                )}
              </div>
              {seller.rating !== undefined && (
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{seller.rating.toFixed(1)}</span>
                  {seller.reviewCount !== undefined && (
                    <span className="text-gray-400">
                      ({seller.reviewCount} review{seller.reviewCount !== 1 ? "s" : ""})
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
          <Button onClick={onContactSeller} className="w-full">
            <MessageCircle className="mr-2 h-4 w-4" />
            Contact Seller
          </Button>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Delivery</h2>
          <div className="flex items-start gap-3 text-gray-600">
            <Truck className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{deliveryMethod}</p>
              {pickupLocation && deliveryMethod !== "Delivery" && (
                <div className="mt-1 flex items-center gap-1 text-sm text-gray-500">
                  <MapPin className="h-4 w-4" />
                  <span>{pickupLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <h2 className="font-semibold text-gray-900">Description</h2>
          <p className="whitespace-pre-wrap text-gray-600">{description}</p>
        </div>

        <button
          onClick={onReport}
          className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600"
        >
          <Flag className="h-4 w-4" />
          Report this listing
        </button>
      </div>
    </div>
  );
}
