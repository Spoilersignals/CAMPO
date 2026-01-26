import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { ListingDetail, ListingGrid } from "@/components/listings";
import { GuestChat } from "@/components/chat";
import type { Condition, DeliveryMethod } from "@/lib/constants";

interface ListingPageProps {
  params: Promise<{ id: string }>;
}

async function getListing(id: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      seller: {
        include: {
          reviews: {
            select: { rating: true },
          },
        },
      },
      photos: {
        orderBy: { sortOrder: "asc" },
      },
      category: true,
    },
  });

  if (!listing || listing.status !== "ACTIVE") {
    return null;
  }

  await prisma.listing.update({
    where: { id },
    data: { views: { increment: 1 } },
  });

  const reviews = listing.seller.reviews;
  const avgRating = reviews.length
    ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
    : undefined;

  return {
    ...listing,
    seller: {
      ...listing.seller,
      rating: avgRating,
      reviewCount: reviews.length,
    },
  };
}

async function getRelatedListings(categoryId: string, excludeId: string) {
  const listings = await prisma.listing.findMany({
    where: {
      status: "ACTIVE",
      categoryId,
      id: { not: excludeId },
    },
    include: {
      seller: true,
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  return listings.map((listing: {
    id: string;
    title: string;
    price: number;
    condition: string;
    photos: { url: string }[];
    seller: { name: string | null; isVerified: boolean };
    isFeatured: boolean;
  }) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    condition: listing.condition as Condition,
    images: listing.photos.map((p: { url: string }) => p.url),
    seller: {
      name: listing.seller.name || "Anonymous",
      isVerified: listing.seller.isVerified,
    },
    isFeatured: listing.isFeatured,
  }));
}

export async function generateMetadata({ params }: ListingPageProps) {
  const { id } = await params;
  const listing = await prisma.listing.findUnique({
    where: { id },
    select: { title: true, description: true },
  });

  if (!listing) {
    return { title: "Listing Not Found" };
  }

  return {
    title: `${listing.title} | Campus Marketplace`,
    description: listing.description || `Buy ${listing.title} on Campus Marketplace`,
  };
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { id } = await params;
  const [listing, session] = await Promise.all([getListing(id), auth()]);

  if (!listing) {
    notFound();
  }

  const relatedListings = await getRelatedListings(listing.categoryId, listing.id);

  const conditionMap: Record<string, Condition> = {
    NEW: "New",
    LIKE_NEW: "Like New",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
  };

  const deliveryMap: Record<string, DeliveryMethod> = {
    CAMPUS_MEET: "Pickup",
    HOSTEL_DELIVERY: "Delivery",
    PICKUP: "Pickup",
    BOTH: "Both",
  };

  const isOwnListing = session?.user?.id === listing.seller.id;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ListingDetail
            title={listing.title}
            description={listing.description || ""}
            price={listing.price}
            category={listing.category.name}
            condition={conditionMap[listing.condition] || (listing.condition as Condition)}
            deliveryMethod={deliveryMap[listing.deliveryMethod] || (listing.deliveryMethod as DeliveryMethod)}
            pickupLocation={listing.pickupLocation || undefined}
            images={listing.photos.map((p: { url: string }) => p.url)}
            createdAt={listing.createdAt}
            seller={{
              id: listing.seller.id,
              name: listing.seller.name || "Anonymous",
              avatar: listing.seller.image || undefined,
              rating: listing.seller.rating,
              reviewCount: listing.seller.reviewCount,
              isVerified: listing.seller.isVerified,
            }}
          />
        </div>

        <div className="lg:col-span-1">
          {!isOwnListing && (
            <div className="sticky top-4">
              <GuestChat
                listingId={listing.id}
                sellerId={listing.seller.id}
                sellerName={listing.seller.name || "Seller"}
                listingTitle={listing.title}
              />
            </div>
          )}
          {isOwnListing && (
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-center">
              <p className="text-sm text-gray-600">This is your listing</p>
            </div>
          )}
        </div>
      </div>

      {relatedListings.length > 0 && (
        <section className="mt-16">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">
            More in {listing.category.name}
          </h2>
          <ListingGrid listings={relatedListings} />
        </section>
      )}
    </div>
  );
}
