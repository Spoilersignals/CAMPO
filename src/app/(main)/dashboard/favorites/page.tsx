import { redirect } from "next/navigation";
import Link from "next/link";
import { Heart, Package } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ListingCard } from "@/components/listings/listing-card";
import type { Condition } from "@/lib/constants";

async function getFavorites(userId: string) {
  return prisma.favorite.findMany({
    where: { userId },
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" } },
          seller: { select: { id: true, name: true, isVerified: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

const conditionMap: Record<string, Condition> = {
  NEW: "New",
  LIKE_NEW: "Like New",
  GOOD: "Good",
  FAIR: "Fair",
  POOR: "Poor",
  "New": "New",
  "Like New": "Like New",
  "Good": "Good",
  "Fair": "Fair",
  "Poor": "Poor",
};

export default async function FavoritesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const favorites = await getFavorites(session.user.id);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">My Favorites</h1>

      {favorites.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Heart className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No favorites yet
            </h3>
            <p className="mb-4 text-gray-500">
              Save listings you're interested in to find them easily later.
            </p>
            <Link href="/listings">
              <Button>Browse Listings</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {favorites.map((favorite: typeof favorites[number]) => (
            <ListingCard
              key={favorite.id}
              id={favorite.listing.id}
              title={favorite.listing.title}
              price={favorite.listing.price}
              condition={conditionMap[favorite.listing.condition] || "Good"}
              images={favorite.listing.photos.map((p: typeof favorite.listing.photos[number]) => p.url)}
              seller={{
                name: favorite.listing.seller.name || "Unknown",
                isVerified: favorite.listing.seller.isVerified,
              }}
              isFeatured={favorite.listing.isFeatured}
              isFavorited={true}
            />
          ))}
        </div>
      )}
    </div>
  );
}
