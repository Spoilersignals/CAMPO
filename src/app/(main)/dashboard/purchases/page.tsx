import { redirect } from "next/navigation";
import Link from "next/link";
import { ShoppingBag, Package, Star, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";

async function getPurchases(userEmail: string) {
  return prisma.transaction.findMany({
    where: { buyerEmail: userEmail },
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      seller: { select: { id: true, name: true, image: true } },
      review: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export default async function PurchasesPage() {
  const session = await auth();

  if (!session?.user?.email) {
    redirect("/login");
  }

  const purchases = await getPurchases(session.user.email);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Purchases</h1>

      {purchases.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No purchases yet
            </h3>
            <p className="mb-4 text-gray-500">
              When you buy items, they will appear here.
            </p>
            <Link href="/listings">
              <Button>Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {purchases.map((purchase: Awaited<ReturnType<typeof getPurchases>>[number]) => (
            <Card key={purchase.id}>
              <CardContent className="flex items-start gap-4 p-4">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {purchase.listing.photos[0] ? (
                    <img
                      src={purchase.listing.photos[0].url}
                      alt={purchase.listing.title}
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
                      <Link
                        href={`/listings/${purchase.listing.id}`}
                        className="font-medium text-gray-900 hover:underline"
                      >
                        {purchase.listing.title}
                      </Link>
                      <p className="text-lg font-semibold text-blue-600">
                        ${purchase.price.toFixed(2)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        purchase.status === "COMPLETED"
                          ? "success"
                          : purchase.status === "CANCELLED"
                          ? "warning"
                          : "default"
                      }
                    >
                      {purchase.status}
                    </Badge>
                  </div>

                  <div className="mt-3 flex items-center gap-3">
                    <Link
                      href={`/profile/${purchase.seller.id}`}
                      className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
                    >
                      <Avatar
                        src={purchase.seller.image}
                        fallback={purchase.seller.name || "S"}
                        size="sm"
                      />
                      <span>{purchase.seller.name}</span>
                    </Link>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <p className="text-sm text-gray-500">
                      Purchased on{" "}
                      {new Date(purchase.createdAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="mt-3 flex gap-2">
                    {purchase.status === "COMPLETED" && !purchase.review && (
                      <Button variant="outline" size="sm">
                        <Star className="mr-1 h-4 w-4" />
                        Leave Review
                      </Button>
                    )}
                    <Link href={`/messages`}>
                      <Button variant="outline" size="sm">
                        <MessageCircle className="mr-1 h-4 w-4" />
                        Message Seller
                      </Button>
                    </Link>
                  </div>

                  {purchase.review && (
                    <div className="mt-3 rounded-lg bg-gray-50 p-3">
                      <div className="flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < purchase.review!.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {purchase.review.comment && (
                        <p className="mt-1 text-sm text-gray-600">
                          {purchase.review.comment}
                        </p>
                      )}
                    </div>
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
