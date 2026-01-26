import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getAdminStats, getRecentActivity, getSocialStats } from "@/actions/admin";

export default async function AdminDashboardPage() {
  const [stats, activity, socialStats] = await Promise.all([
    getAdminStats(),
    getRecentActivity(),
    getSocialStats(),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-gray-500">Overview of marketplace activity</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Active Listings
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{stats.totalListings}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Pending Reviews
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-yellow-600">
              {stats.pendingReviews}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Commission Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-green-600">
              ₦{stats.commissionEarned.toLocaleString()}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">
              Open Tickets
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-red-600">{stats.openTickets}</p>
          </CardContent>
        </Card>
      </div>

      {/* Social Features Stats */}
      {socialStats.pending.total > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-yellow-800">
              Pending Social Content
              <Badge variant="warning">{socialStats.pending.total}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4 text-sm">
              {socialStats.pending.confessions > 0 && (
                <span>Confessions: <strong>{socialStats.pending.confessions}</strong></span>
              )}
              {socialStats.pending.crushes > 0 && (
                <span>Crushes: <strong>{socialStats.pending.crushes}</strong></span>
              )}
              {socialStats.pending.spotted > 0 && (
                <span>Spotted: <strong>{socialStats.pending.spotted}</strong></span>
              )}
              {socialStats.pending.polls > 0 && (
                <span>Polls: <strong>{socialStats.pending.polls}</strong></span>
              )}
              {socialStats.pending.events > 0 && (
                <span>Events: <strong>{socialStats.pending.events}</strong></span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/listings">
          <Button>Review Listings</Button>
        </Link>
        <Link href="/admin/commission">
          <Button variant="outline">View Commission</Button>
        </Link>
        <Link href="/admin/support">
          <Button variant="outline">View Tickets</Button>
        </Link>
      </div>

      {/* Social Features Moderation */}
      <div>
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Social Features</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/confessions">
            <Button variant="outline" className="relative">
              Confessions
              {socialStats.pending.confessions > 0 && (
                <Badge variant="error" className="ml-2">{socialStats.pending.confessions}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/crushes">
            <Button variant="outline" className="relative">
              Crushes
              {socialStats.pending.crushes > 0 && (
                <Badge variant="error" className="ml-2">{socialStats.pending.crushes}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/spotted">
            <Button variant="outline" className="relative">
              Spotted
              {socialStats.pending.spotted > 0 && (
                <Badge variant="error" className="ml-2">{socialStats.pending.spotted}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/polls">
            <Button variant="outline" className="relative">
              Polls
              {socialStats.pending.polls > 0 && (
                <Badge variant="error" className="ml-2">{socialStats.pending.polls}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/events">
            <Button variant="outline" className="relative">
              Events
              {socialStats.pending.events > 0 && (
                <Badge variant="error" className="ml-2">{socialStats.pending.events}</Badge>
              )}
            </Button>
          </Link>
          <Link href="/admin/group-chat">
            <Button variant="outline">
              Group Chat
              <Badge variant="default" className="ml-2">{socialStats.groupMessages}</Badge>
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.recentListings.length === 0 ? (
                <p className="text-sm text-gray-500">No listings yet</p>
              ) : (
                activity.recentListings.map((listing) => (
                  <div
                    key={listing.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{listing.title}</p>
                      <p className="text-sm text-gray-500">
                        by {listing.seller.name || "Unknown"}
                      </p>
                    </div>
                    <Badge
                      variant={
                        listing.status === "ACTIVE"
                          ? "success"
                          : listing.status === "PENDING"
                          ? "warning"
                          : "default"
                      }
                    >
                      {listing.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Support Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activity.recentTickets.length === 0 ? (
                <p className="text-sm text-gray-500">No tickets yet</p>
              ) : (
                activity.recentTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="flex items-center justify-between border-b border-gray-100 pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{ticket.subject}</p>
                      <p className="text-sm text-gray-500">
                        {new Date(ticket.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge
                      variant={
                        ticket.status === "RESOLVED"
                          ? "success"
                          : ticket.status === "OPEN"
                          ? "warning"
                          : "default"
                      }
                    >
                      {ticket.status}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
