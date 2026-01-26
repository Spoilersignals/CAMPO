import { redirect } from "next/navigation";
import Link from "next/link";
import { Bell, CheckCircle, Package, MessageCircle, AlertCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MarkAllReadButton } from "./mark-read-button";

const iconMap: Record<string, React.ReactNode> = {
  MESSAGE: <MessageCircle className="h-5 w-5 text-blue-600" />,
  LISTING_APPROVED: <CheckCircle className="h-5 w-5 text-green-600" />,
  LISTING_REJECTED: <AlertCircle className="h-5 w-5 text-red-600" />,
  LISTING_SOLD: <Package className="h-5 w-5 text-indigo-600" />,
  SUGGESTION_MATCH: <Package className="h-5 w-5 text-purple-600" />,
  DEFAULT: <Bell className="h-5 w-5 text-gray-600" />,
};

export default async function NotificationsPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const notifications = await prisma.notification.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const unreadCount = notifications.filter((n) => !n.readAt).length;

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="text-gray-600">
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
              : "You're all caught up!"}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Bell className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No notifications yet
            </h3>
            <p className="text-gray-500">
              When you receive notifications, they will appear here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={notification.readAt ? "bg-white" : "border-indigo-200 bg-indigo-50"}
            >
              <CardContent className="p-4">
                <div className="flex gap-4">
                  <div className="shrink-0 rounded-full bg-white p-2 shadow-sm">
                    {iconMap[notification.type] || iconMap.DEFAULT}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-medium text-gray-900">
                        {notification.title}
                      </h4>
                      <span className="shrink-0 text-xs text-gray-500">
                        {new Date(notification.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {notification.body && (
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.body}
                      </p>
                    )}
                    {notification.href && (
                      <Link
                        href={notification.href}
                        className="mt-2 inline-block text-sm font-medium text-indigo-600 hover:underline"
                      >
                        View details →
                      </Link>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
