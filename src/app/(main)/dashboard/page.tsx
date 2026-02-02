import { redirect } from "next/navigation";
import Link from "next/link";
import {
  Package,
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
  MessageCircle,
  Heart,
  ArrowRight,
  AlertCircle,
  Star,
  GraduationCap,
} from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getSellerDashboardStats } from "@/actions/listings";
import { getUniversityFromEmail } from "@/lib/university";

async function getRecentActivity(userId: string) {
  const [recentListings, recentMessages] = await Promise.all([
    prisma.listing.findMany({
      where: { sellerId: userId },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        photos: { orderBy: { sortOrder: "asc" }, take: 1 },
      },
    }),
    prisma.chatMessage.findMany({
      where: {
        thread: {
          OR: [{ sellerId: userId }],
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        sender: { select: { name: true } },
        thread: {
          include: {
            listing: { select: { title: true } },
          },
        },
      },
    }),
  ]);

  return { recentListings, recentMessages };
}

async function getSellerRating(userId: string) {
  const reviews = await prisma.review.aggregate({
    where: { revieweeId: userId },
    _avg: { rating: true },
    _count: true,
  });

  return {
    rating: reviews._avg.rating || 0,
    reviewCount: reviews._count,
  };
}

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const [stats, activity, ratingData] = await Promise.all([
    getSellerDashboardStats(),
    getRecentActivity(session.user.id),
    getSellerRating(session.user.id),
  ]);

  if (!stats) {
    redirect("/login");
  }

  const university = getUniversityFromEmail(session.user.email);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session.user.name}!</p>
          {university && (
            <div className={`mt-2 inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${university.color} px-3 py-1 text-sm font-medium text-white`}>
              <GraduationCap className="h-4 w-4" />
              {university.name}
            </div>
          )}
        </div>
        <Link href="/sell">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            New Listing
          </Button>
        </Link>
      </div>

      {stats.pendingCommissionListings.length > 0 && (
        <Card className="mb-6 border-yellow-200 bg-yellow-50">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              <div className="flex-1">
                <h3 className="font-medium text-yellow-900">
                  Commission Payment Required
                </h3>
                <p className="mt-1 text-sm text-yellow-700">
                  You have {stats.pendingCommissionListings.length} listing(s)
                  waiting for commission payment.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {stats.pendingCommissionListings.map((listing) => (
                    <Link
                      key={listing.id}
                      href={`/sell/commission/${listing.id}`}
                    >
                      <Button size="sm" variant="outline" className="border-yellow-400 bg-white hover:bg-yellow-100">
                        Pay for &quot;{listing.title.slice(0, 20)}
                        {listing.title.length > 20 ? "..." : ""}&quot;
                      </Button>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Active Listings
            </CardTitle>
            <CheckCircle className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.activeListings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Review
            </CardTitle>
            <Clock className="h-5 w-5 text-yellow-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingReview}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Pending Commission
            </CardTitle>
            <AlertCircle className="h-5 w-5 text-orange-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.pendingCommission}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales
            </CardTitle>
            <DollarSign className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.totalSales}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">
              Earnings
            </CardTitle>
            <DollarSign className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">
              ${stats.totalEarnings.toFixed(2)}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Link href="/sell">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-blue-100 p-2">
                <Plus className="h-5 w-5 text-blue-600" />
              </div>
              <span className="font-medium">Create Listing</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/messages">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-green-100 p-2">
                <MessageCircle className="h-5 w-5 text-green-600" />
              </div>
              <span className="font-medium">Messages</span>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/favorites">
          <Card className="cursor-pointer transition-shadow hover:shadow-md">
            <CardContent className="flex items-center gap-3 p-4">
              <div className="rounded-full bg-red-100 p-2">
                <Heart className="h-5 w-5 text-red-600" />
              </div>
              <span className="font-medium">Favorites</span>
            </CardContent>
          </Card>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-2">
        <Star className="h-5 w-5 text-yellow-500" />
        <span className="text-sm text-gray-600">
          Your Rating:{" "}
          <span className="font-medium">
            {ratingData.rating.toFixed(1)} ({ratingData.reviewCount} reviews)
          </span>
        </span>
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Listings</CardTitle>
            <Link
              href="/dashboard/listings"
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {activity.recentListings.length === 0 ? (
              <p className="text-sm text-gray-500">No listings yet</p>
            ) : (
              <div className="space-y-3">
                {activity.recentListings.map(
                  (listing: (typeof activity.recentListings)[number]) => (
                    <Link
                      key={listing.id}
                      href={
                        listing.status === "PENDING_COMMISSION"
                          ? `/sell/commission/${listing.id}`
                          : `/listings/${listing.id}`
                      }
                      className="flex items-center gap-3 rounded-lg p-2 transition-colors hover:bg-gray-50"
                    >
                      <div className="h-12 w-12 overflow-hidden rounded-lg bg-gray-100">
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
                        <p className="truncate font-medium text-gray-900">
                          {listing.title}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${listing.price.toFixed(2)}
                        </p>
                      </div>
                      <Badge
                        variant={
                          listing.status === "ACTIVE"
                            ? "success"
                            : listing.status === "SOLD"
                              ? "default"
                              : listing.status === "PENDING_COMMISSION"
                                ? "error"
                                : listing.status === "PENDING_REVIEW"
                                  ? "warning"
                                  : "default"
                        }
                      >
                        {listing.status === "PENDING_COMMISSION"
                          ? "Pay Commission"
                          : listing.status === "PENDING_REVIEW"
                            ? "In Review"
                            : listing.status}
                      </Badge>
                    </Link>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Messages</CardTitle>
            <Link
              href="/messages"
              className="flex items-center text-sm text-blue-600 hover:underline"
            >
              View all <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </CardHeader>
          <CardContent>
            {activity.recentMessages.length === 0 ? (
              <p className="text-sm text-gray-500">No messages yet</p>
            ) : (
              <div className="space-y-3">
                {activity.recentMessages.map(
                  (message: (typeof activity.recentMessages)[number]) => (
                    <div
                      key={message.id}
                      className="flex items-start gap-3 rounded-lg p-2"
                    >
                      <div className="rounded-full bg-gray-100 p-2">
                        <MessageCircle className="h-4 w-4 text-gray-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm">
                          <span className="font-medium">
                            {message.sender?.name || message.senderName || "Someone"}
                          </span>
                          <span className="text-gray-500"> about </span>
                          <span className="font-medium">
                            {message.thread.listing?.title || "a listing"}
                          </span>
                        </p>
                        <p className="truncate text-sm text-gray-600">
                          {message.body}
                        </p>
                      </div>
                    </div>
                  )
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
