import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageCircle, Heart, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

async function getConfessionAnalytics() {
  const confessions = await prisma.confession.findMany({
    where: { status: "APPROVED" },
    select: {
      id: true,
      content: true,
      confessionNumber: true,
      shareCode: true,
      approvedAt: true,
      expiresAt: true,
      _count: {
        select: {
          views: true,
          comments: true,
          reactions: true,
        },
      },
    },
    orderBy: { approvedAt: "desc" },
    take: 50,
  });

  const totalViews = await prisma.confessionView.count();
  const totalComments = await prisma.confessionComment.count();
  const totalReactions = await prisma.confessionReaction.count();
  const activeStories = await prisma.confession.count({
    where: {
      status: "APPROVED",
      expiresAt: { gt: new Date() },
    },
  });

  return {
    confessions,
    stats: {
      totalViews,
      totalComments,
      totalReactions,
      activeStories,
    },
  };
}

function formatTimeRemaining(expiresAt: Date | null): string {
  if (!expiresAt) return "No expiry";
  const now = new Date();
  const diff = new Date(expiresAt).getTime() - now.getTime();
  if (diff <= 0) return "Expired";
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${minutes}m`;
}

export default async function ConfessionAnalyticsPage() {
  const { confessions, stats } = await getConfessionAnalytics();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Confession Analytics</h1>
          <p className="text-gray-500">View statistics and engagement for confessions</p>
        </div>
        <Link href="/admin/confessions">
          <Button variant="outline">Back to Pending</Button>
        </Link>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalViews}</p>
              <p className="text-sm text-gray-500">Total Views</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <MessageCircle className="h-6 w-6 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalComments}</p>
              <p className="text-sm text-gray-500">Total Comments</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <Heart className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.totalReactions}</p>
              <p className="text-sm text-gray-500">Total Reactions</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 pt-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.activeStories}</p>
              <p className="text-sm text-gray-500">Active Stories</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confessions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Confessions Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b text-left text-sm text-gray-500">
                  <th className="pb-3 font-medium">#</th>
                  <th className="pb-3 font-medium">Confession</th>
                  <th className="pb-3 font-medium text-center">Views</th>
                  <th className="pb-3 font-medium text-center">Comments</th>
                  <th className="pb-3 font-medium text-center">Reactions</th>
                  <th className="pb-3 font-medium text-center">Story Status</th>
                </tr>
              </thead>
              <tbody>
                {confessions.map((confession) => {
                  const isActive = confession.expiresAt && new Date(confession.expiresAt) > new Date();
                  return (
                    <tr key={confession.id} className="border-b last:border-0">
                      <td className="py-3">
                        <span className="font-semibold text-indigo-600">
                          #{confession.confessionNumber}
                        </span>
                      </td>
                      <td className="py-3">
                        <p className="max-w-xs truncate text-gray-700">
                          {confession.content}
                        </p>
                      </td>
                      <td className="py-3 text-center">
                        <span className="flex items-center justify-center gap-1 text-blue-600">
                          <Eye className="h-4 w-4" />
                          {confession._count.views}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="flex items-center justify-center gap-1 text-green-600">
                          <MessageCircle className="h-4 w-4" />
                          {confession._count.comments}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="flex items-center justify-center gap-1 text-red-600">
                          <Heart className="h-4 w-4" />
                          {confession._count.reactions}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        {isActive ? (
                          <Badge variant="success" className="gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTimeRemaining(confession.expiresAt)}
                          </Badge>
                        ) : (
                          <Badge variant="default">Expired</Badge>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
