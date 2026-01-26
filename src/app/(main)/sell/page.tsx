"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Plus,
  Package,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  DollarSign,
  Eye,
  Info,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { COMMISSION_RATE } from "@/lib/constants";
import { getMyListings } from "@/actions/listings";

type Listing = {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  createdAt: Date;
  photos: { url: string }[];
  category: { name: string };
  commissionPayment: { status: string } | null;
};

const statusConfig: Record<
  string,
  { label: string; variant: "default" | "success" | "warning" | "error"; icon: React.ReactNode }
> = {
  PENDING_COMMISSION: {
    label: "Awaiting Commission",
    variant: "warning",
    icon: <DollarSign className="h-4 w-4" />,
  },
  PENDING_REVIEW: {
    label: "Under Review",
    variant: "default",
    icon: <Clock className="h-4 w-4" />,
  },
  ACTIVE: {
    label: "Active",
    variant: "success",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  SOLD: {
    label: "Sold",
    variant: "success",
    icon: <CheckCircle className="h-4 w-4" />,
  },
  REJECTED: {
    label: "Rejected",
    variant: "error",
    icon: <XCircle className="h-4 w-4" />,
  },
  ARCHIVED: {
    label: "Archived",
    variant: "default",
    icon: <AlertCircle className="h-4 w-4" />,
  },
};

export default function SellPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMyListings()
      .then((data) => {
        setListings(data as Listing[]);
      })
      .catch(() => {
        router.push("/login");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
          <div className="h-64 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sell Your Items</h1>
          <p className="mt-1 text-gray-600">
            List your items and reach buyers on campus
          </p>
        </div>
        <Link href="/sell/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create New Listing
          </Button>
        </Link>
      </div>

      <Card className="mb-8 border-blue-200 bg-blue-50">
        <CardContent className="py-6">
          <div className="flex items-start gap-4">
            <div className="rounded-full bg-blue-100 p-3">
              <Info className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-blue-900">How Selling Works</h3>
              <ul className="mt-2 space-y-2 text-sm text-blue-800">
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                    1
                  </span>
                  <span>Create a listing with your item details and photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                    2
                  </span>
                  <span>
                    Pay a {COMMISSION_RATE * 100}% commission fee to activate your listing
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                    3
                  </span>
                  <span>Our broker reviews your listing within 24-48 hours</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-200 text-xs font-medium text-blue-800">
                    4
                  </span>
                  <span>
                    Once approved, buyers can view and purchase your item
                  </span>
                </li>
              </ul>
              <p className="mt-3 text-xs text-blue-700">
                <strong>Note:</strong> If your item doesn&apos;t sell, you may be eligible
                for a 50% refund of the commission.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Listings</CardTitle>
          <CardDescription>
            {listings.length === 0
              ? "You haven't created any listings yet"
              : `You have ${listings.length} listing${listings.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {listings.length === 0 ? (
            <div className="py-8 text-center">
              <Package className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-4 text-lg font-medium text-gray-900">
                No listings yet
              </h3>
              <p className="mt-2 text-sm text-gray-500">
                Get started by creating your first listing
              </p>
              <Link href="/sell/new">
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Listing
                </Button>
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {listings.map((listing) => {
                const status = statusConfig[listing.status] || {
                  label: listing.status,
                  variant: "default" as const,
                  icon: null,
                };

                return (
                  <div
                    key={listing.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    <div className="h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                      {listing.photos[0] ? (
                        <img
                          src={listing.photos[0].url}
                          alt={listing.title}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center">
                          <Package className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="truncate font-medium text-gray-900">
                          {listing.title}
                        </h4>
                        <Badge variant={status.variant}>{status.label}</Badge>
                      </div>
                      <p className="text-sm text-gray-500">
                        {listing.category.name} • ${listing.price.toFixed(2)}
                      </p>
                      <div className="mt-1 flex items-center gap-3 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3" />
                          {listing.views} views
                        </span>
                        <span>
                          Created{" "}
                          {new Date(listing.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      {listing.status === "PENDING_COMMISSION" ? (
                        <Link href={`/sell/commission/${listing.id}`}>
                          <Button size="sm" variant="default">
                            <DollarSign className="mr-1 h-3 w-3" />
                            Pay Commission
                          </Button>
                        </Link>
                      ) : (
                        <Link href={`/listings/${listing.id}`}>
                          <Button size="sm" variant="outline">
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
