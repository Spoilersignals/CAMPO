"use client";

import Link from "next/link";
import { DollarSign, Tag, Clock, BadgeCheck, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface SuggestionCardProps {
  id: string;
  title: string;
  description?: string | null;
  budget?: number | null;
  condition?: string | null;
  category: {
    name: string;
  };
  requester?: {
    name?: string | null;
    isVerified?: boolean;
  } | null;
  guestName?: string | null;
  status: string;
  createdAt: Date;
}

const statusVariant: Record<string, "success" | "default" | "warning"> = {
  OPEN: "success",
  FULFILLED: "default",
  CLOSED: "warning",
};

export function SuggestionCard({
  id,
  title,
  description,
  budget,
  condition,
  category,
  requester,
  guestName,
  status,
  createdAt,
}: SuggestionCardProps) {
  const displayName = requester?.name || guestName || "Anonymous";
  const isVerified = requester?.isVerified || false;

  return (
    <Link href={`/suggestions/${id}`}>
      <Card className="group h-full p-5 transition-shadow hover:shadow-md">
        <div className="mb-3 flex items-start justify-between gap-2">
          <h3 className="line-clamp-2 font-medium text-gray-900 group-hover:text-blue-600">
            {title}
          </h3>
          <Badge variant={statusVariant[status] || "default"}>{status}</Badge>
        </div>

        {description && (
          <p className="mb-4 line-clamp-2 text-sm text-gray-600">{description}</p>
        )}

        <div className="mb-4 flex flex-wrap gap-2">
          {budget && (
            <div className="flex items-center gap-1 text-sm text-blue-600">
              <DollarSign className="h-4 w-4" />
              <span className="font-medium">Budget: ${budget.toFixed(2)}</span>
            </div>
          )}
          {condition && (
            <Badge variant="default">{condition}</Badge>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Tag className="h-4 w-4" />
          <span>{category.name}</span>
        </div>

        <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
          <div className="flex items-center gap-1.5 text-sm text-gray-600">
            {!requester && <User className="h-4 w-4 text-gray-400" />}
            <span>{displayName}</span>
            {isVerified && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          <div className="flex items-center gap-1 text-xs text-gray-400">
            <Clock className="h-3.5 w-3.5" />
            <span>{formatDistanceToNow(new Date(createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
