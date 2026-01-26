import { notFound } from "next/navigation";
import Link from "next/link";
import { BadgeCheck, Star, Calendar, Package, MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ListingCard } from "@/components/listings/listing-card";
import type { Condition } from "@/lib/constants";

async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      name: true,
      image: true,
      isVerified: true,
      schoolName: true,
      createdAt: true,
    },
  });

  if (!user) return null;

  const [listings, reviews, stats] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: userId, status: "ACTIVE" },
      include: {
        photos: { orderBy: { sortOrder: "asc" } },
        seller: { select: { id: true, name: true, isVerified: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 8,
    }),
    prisma.review.findMany({
      where: { revieweeId: userId },
      include: {
        reviewer: { select: { id: true, name: true, image: true } },
        transaction: {
          include: { listing: { select: { title: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
    prisma.review.aggregate({
      where: { revieweeId: userId },
      _avg: { rating: true },
      _count: true,
    }),
  ]);

  const salesCount = await prisma.transaction.count({
    where: { sellerId: userId, status: "COMPLETED" },
  });

  return {
    user,
    listings,
    reviews,
    stats: {
      rating: stats._avg.rating || 0,
      reviewCount: stats._count,
      salesCount,
    },
  };
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

export default async function ProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const profile = await getProfile(id);

  if (!profile) {
    notFound();
  }

  const isOwnProfile = session?.user?.id === id;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex flex-col items-center gap-6 sm:flex-row sm:items-start">
        <Avatar
          src={profile.user.image}
          fallback={profile.user.name || "U"}
          size="lg"
          className="h-24 w-24 text-2xl"
        />

        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2 sm:justify-start">
            <h1 className="text-2xl font-bold text-gray-900">
              {profile.user.name}
            </h1>
            {profile.user.isVerified && (
              <BadgeCheck className="h-6 w-6 text-blue-500" />
            )}
          </div>

          {profile.user.schoolName && (
            <p className="mt-1 text-gray-600">{profile.user.schoolName}</p>
          )}

          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 text-sm text-gray-500 sm:justify-start">
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              Joined {new Date(profile.user.createdAt).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1">
              <Package className="h-4 w-4" />
              {profile.stats.salesCount} sales
            </span>
            <span className="flex items-center gap-1">
              <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              {profile.stats.rating.toFixed(1)} ({profile.stats.reviewCount} reviews)
            </span>
          </div>

          {!isOwnProfile && session?.user && (
            <div className="mt-4">
              <Button>
                <MessageCircle className="mr-2 h-4 w-4" />
                Contact Seller
              </Button>
            </div>
          )}
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Listings</h2>
          {profile.listings.length > 0 && (
            <Link
              href={`/listings?seller=${id}`}
              className="text-sm text-blue-600 hover:underline"
            >
              View all
            </Link>
          )}
        </div>

        {profile.listings.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-gray-500">
              No active listings
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {profile.listings.map((listing: typeof profile.listings[number]) => (
              <ListingCard
                key={listing.id}
                id={listing.id}
                title={listing.title}
                price={listing.price}
                condition={conditionMap[listing.condition] || "Good"}
                images={listing.photos.map((p: { url: string }) => p.url)}
                seller={{
                  name: listing.seller.name || "Unknown",
                  isVerified: listing.seller.isVerified,
                }}
                isFeatured={listing.isFeatured}
              />
            ))}
          </div>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          {profile.reviews.length === 0 ? (
            <p className="text-gray-500">No reviews yet</p>
          ) : (
            <div className="space-y-4">
              {profile.reviews.map((review: typeof profile.reviews[number]) => {
                if (!review.reviewer) return null;
                return (
                <div key={review.id} className="border-b pb-4 last:border-b-0 last:pb-0">
                  <div className="flex items-start gap-3">
                    <Avatar
                      src={review.reviewer.image}
                      fallback={review.reviewer.name || "U"}
                      size="sm"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <Link
                          href={`/profile/${review.reviewer.id}`}
                          className="font-medium text-gray-900 hover:underline"
                        >
                          {review.reviewer.name}
                        </Link>
                        <span className="text-sm text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < review.rating
                                ? "fill-yellow-400 text-yellow-400"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      {review.comment && (
                        <p className="mt-2 text-gray-600">{review.comment}</p>
                      )}
                      <p className="mt-1 text-sm text-gray-500">
                        For: {review.transaction.listing.title}
                      </p>
                    </div>
                  </div>
                </div>
              );})}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
