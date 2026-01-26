import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus, Package, Edit, Eye, Archive, Trash2, DollarSign, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyListings } from "@/actions/listings";
import { calculateCommission } from "@/lib/utils";
import { DeleteListingButton, ArchiveListingButton } from "./listing-actions";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Pending Commission", value: "PENDING_COMMISSION" },
  { label: "Pending Review", value: "PENDING_REVIEW" },
  { label: "Active", value: "ACTIVE" },
  { label: "Sold", value: "SOLD" },
  { label: "Archived", value: "ARCHIVED" },
];

function getStatusBadge(status: string) {
  switch (status) {
    case "ACTIVE":
      return <Badge variant="success">Active</Badge>;
    case "SOLD":
      return <Badge variant="default">Sold</Badge>;
    case "PENDING_COMMISSION":
      return <Badge variant="error">Pay Commission</Badge>;
    case "PENDING_REVIEW":
      return <Badge variant="warning">In Review</Badge>;
    case "ARCHIVED":
      return <Badge>Archived</Badge>;
    case "REJECTED":
      return <Badge variant="error">Rejected</Badge>;
    default:
      return <Badge>{status}</Badge>;
  }
}

export default async function MyListingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const params = await searchParams;
  const currentStatus = params.status || "all";
  const listings = await getMyListings(currentStatus);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link href="/sell">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2">
        {STATUS_TABS.map((tab) => (
          <Link
            key={tab.value}
            href={`/dashboard/listings${tab.value === "all" ? "" : `?status=${tab.value}`}`}
          >
            <Button
              variant={currentStatus === tab.value ? "default" : "outline"}
              size="sm"
            >
              {tab.label}
            </Button>
          </Link>
        ))}
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Package className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No listings found
            </h3>
            <p className="mb-4 text-gray-500">
              {currentStatus === "all"
                ? "You haven't created any listings yet."
                : `You don't have any ${currentStatus.toLowerCase().replace("_", " ")} listings.`}
            </p>
            <Link href="/sell">
              <Button>Create Your First Listing</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing: (typeof listings)[number]) => (
            <Card key={listing.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0].url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {listing.title}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {listing.category.name}
                      </p>
                    </div>
                    {getStatusBadge(listing.status)}
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span className="font-semibold text-blue-600">
                      ${listing.price.toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {listing.views} views
                    </span>
                    <span>{listing._count.favorites} favorites</span>
                    {listing.status === "PENDING_COMMISSION" && (
                      <span className="flex items-center gap-1 text-orange-600">
                        <DollarSign className="h-4 w-4" />
                        Commission: ${calculateCommission(listing.price).toFixed(2)}
                      </span>
                    )}
                    {listing.commissionPayment && (
                      <span className="flex items-center gap-1 text-green-600">
                        <DollarSign className="h-4 w-4" />
                        Commission Paid: ${listing.commissionPayment.amount.toFixed(2)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 gap-2">
                  {listing.status === "PENDING_COMMISSION" ? (
                    <Link href={`/sell/commission/${listing.id}`}>
                      <Button size="sm">
                        <DollarSign className="mr-1 h-4 w-4" />
                        Pay Commission
                      </Button>
                    </Link>
                  ) : (
                    <>
                      <Link href={`/listings/${listing.id}`}>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </Link>
                      {listing.status !== "SOLD" && (
                        <>
                          <Link href={`/dashboard/listings/${listing.id}/edit`}>
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          {listing.status !== "ARCHIVED" && (
                            <ArchiveListingButton listingId={listing.id} />
                          )}
                          <DeleteListingButton listingId={listing.id} />
                        </>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
