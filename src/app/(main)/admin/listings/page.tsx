import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ListingActions } from "./listing-actions";

export default async function PendingListingsPage() {
  const listings = await prisma.listing.findMany({
    where: { status: "PENDING" },
    include: {
      seller: { select: { id: true, name: true, email: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      category: true,
      commissionPayment: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Listings</h1>
        <p className="text-gray-500">Review and approve new listings</p>
      </div>

      {listings.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending listings to review</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {listings.map((listing) => (
            <Card key={listing.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{listing.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      by {listing.seller.name || listing.seller.email} •{" "}
                      {new Date(listing.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        listing.commissionPayment?.status === "PAID"
                          ? "success"
                          : "warning"
                      }
                    >
                      Commission:{" "}
                      {listing.commissionPayment?.status || "UNPAID"}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {listing.photos[0] && (
                      <img
                        src={listing.photos[0].url}
                        alt={listing.title}
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {listing.description || "No description"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-500">Price:</span>{" "}
                        <span className="font-medium">
                          ₦{listing.price.toLocaleString()}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Category:</span>{" "}
                        <span className="font-medium">
                          {listing.category.name}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Condition:</span>{" "}
                        <span className="font-medium">{listing.condition}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Delivery:</span>{" "}
                        <span className="font-medium">
                          {listing.deliveryMethod}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <ListingActions listingId={listing.id} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
