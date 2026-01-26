"use client";

import Link from "next/link";
import { MapPin, Clock, BadgeCheck, ImageIcon, Search, Package, Phone } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface LostFoundCardProps {
  id: string;
  type: "LOST" | "FOUND";
  title: string;
  description?: string | null;
  location?: string | null;
  locationDetails?: string | null;
  contactPhone?: string | null;
  contactName?: string | null;
  status: string;
  photos: { url: string }[];
  reporter: {
    name?: string | null;
    isVerified?: boolean;
  };
  createdAt: Date;
}

const statusVariant: Record<string, "success" | "default" | "warning" | "error"> = {
  ACTIVE: "success",
  RESOLVED: "default",
  PENDING: "warning",
  REJECTED: "error",
};

export function LostFoundCard({
  id,
  type,
  title,
  description,
  location,
  locationDetails,
  contactPhone,
  contactName,
  status,
  photos,
  reporter,
  createdAt,
}: LostFoundCardProps) {
  const TypeIcon = type === "LOST" ? Search : Package;

  return (
    <Link href={`/lost-found/${id}`}>
      <Card className="group overflow-hidden transition-shadow hover:shadow-md">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          {photos.length > 0 ? (
            <img
              src={photos[0].url}
              alt={title}
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center">
              <ImageIcon className="h-12 w-12 text-gray-300" />
            </div>
          )}

          <div className="absolute left-2 top-2 flex gap-2">
            <Badge
              className={
                type === "LOST"
                  ? "bg-red-500 text-white"
                  : "bg-green-500 text-white"
              }
            >
              <TypeIcon className="mr-1 h-3 w-3" />
              {type}
            </Badge>
            {status !== "ACTIVE" && (
              <Badge variant={statusVariant[status] || "default"}>
                {status}
              </Badge>
            )}
          </div>
        </div>

        <div className="p-4">
          <h3 className="mb-2 line-clamp-2 font-medium text-gray-900 group-hover:text-blue-600">
            {title}
          </h3>

          {description && (
            <p className="mb-3 line-clamp-2 text-sm text-gray-600">{description}</p>
          )}

          {(locationDetails || location) && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-gray-500">
              <MapPin className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{locationDetails || location}</span>
            </div>
          )}

          {contactPhone && (
            <div className="mb-3 flex items-center gap-1.5 text-sm text-green-600">
              <Phone className="h-4 w-4 flex-shrink-0" />
              <span className="line-clamp-1">{contactName || reporter.name || "Contact"}: {contactPhone}</span>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-gray-100 pt-3">
            <div className="flex items-center gap-1.5 text-sm text-gray-600">
              <span>{reporter.name || "Anonymous"}</span>
              {reporter.isVerified && (
                <BadgeCheck className="h-4 w-4 text-blue-500" />
              )}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
}
