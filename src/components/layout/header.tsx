import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  Search,
  Bell,
  User,
  Package,
  MessageSquare,
  ChevronDown,
  LayoutDashboard,
  MessageCircle,
  Headphones,
  Users,
  Heart,
  Eye,
  BarChart3,
  Calendar,
  BookOpen,
  Car,
  GraduationCap,
  MessagesSquare,
  Shield,
} from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { prisma } from "@/lib/prisma";
import { LogoutButton } from "./logout-button";
import { HeaderActions } from "./header-actions";

export async function Header() {
  const session = await auth();
  
  let isAdmin = false;
  let unreadNotifications = 0;
  
  let unreadMessages = 0;
  
  if (session?.user?.id) {
    const [user, notifCount, msgCount] = await Promise.all([
      prisma.user.findUnique({
        where: { id: session.user.id },
        select: { role: true },
      }),
      prisma.notification.count({
        where: { userId: session.user.id, readAt: null },
      }),
      prisma.chatMessage.count({
        where: { 
          readAt: null,
          senderId: { not: session.user.id },
          thread: {
            OR: [
              { sellerId: session.user.id },
              { buyerId: session.user.id },
            ],
          },
        },
      }),
    ]);
    isAdmin = user?.role === "ADMIN";
    unreadNotifications = notifCount;
    unreadMessages = msgCount;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white dark:bg-gray-900 dark:border-gray-800 shadow-sm">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {/* Profile icon on the left - mobile only */}
          <Link
            href={session?.user?.id ? `/profile/${session.user.id}` : "/login"}
            className="flex md:hidden h-8 w-8 items-center justify-center rounded-full bg-indigo-100 text-indigo-600"
          >
            <User className="h-5 w-5" />
          </Link>
          
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
            <MessageCircle className="h-6 w-6" />
            <span className="hidden sm:inline">ComradeZone</span>
          </Link>

          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="/marketplace"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              Marketplace
            </Link>
            <Link
              href="/requests"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              Item Suggestions
            </Link>
            <Link
              href="/lost-found"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              Lost & Found
            </Link>
            <Link
              href="/how-it-works"
              className="text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600"
            >
              How It Works
            </Link>
            
            {/* Community Dropdown */}
            <div className="group relative">
              <button className="flex items-center gap-1 text-sm font-medium text-gray-700 transition-colors hover:text-indigo-600">
                <Users className="h-4 w-4" />
                Community
                <ChevronDown className="h-3 w-3" />
              </button>
              <div className="invisible absolute left-0 top-full z-50 mt-2 w-56 rounded-lg border bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                <Link href="/chat" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <MessagesSquare className="h-4 w-4" />
                  Campus Chat
                </Link>
                <Link href="/confessions" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <MessageSquare className="h-4 w-4" />
                  Confessions
                </Link>
                <Link href="/crushes" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Heart className="h-4 w-4" />
                  Crushes
                </Link>
                <Link href="/spotted" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Eye className="h-4 w-4" />
                  Spotted
                </Link>
                <Link href="/polls" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <BarChart3 className="h-4 w-4" />
                  Polls
                </Link>
                <hr className="my-2" />
                <Link href="/events" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Calendar className="h-4 w-4" />
                  Events
                </Link>
                <Link href="/courses" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <BookOpen className="h-4 w-4" />
                  Course Reviews
                </Link>
                <Link href="/rides" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <Car className="h-4 w-4" />
                  Ride Sharing
                </Link>
                <Link href="/study-groups" className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                  <GraduationCap className="h-4 w-4" />
                  Study Groups
                </Link>
              </div>
            </div>

            <Link
              href="/sell"
              className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
            >
              Sell Item
            </Link>
          </nav>
        </div>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <form action="/marketplace" method="GET" className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              name="q"
              placeholder="Search items..."
              className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </form>
        </div>

        <div className="flex items-center gap-4">
          <HeaderActions />
          
          {session?.user ? (
            <>
              <Link
                href="/messages"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <MessageSquare className="h-5 w-5" />
                {unreadMessages > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-purple-500 text-[10px] font-medium text-white">
                    {unreadMessages > 9 ? "9+" : unreadMessages}
                  </span>
                )}
              </Link>
              <Link
                href="/notifications"
                className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                <Bell className="h-5 w-5" />
                {unreadNotifications > 0 && (
                  <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
                    {unreadNotifications > 9 ? "9+" : unreadNotifications}
                  </span>
                )}
              </Link>

              <div className="group relative hidden md:block">
                <button className="flex items-center gap-2 rounded-full border border-gray-300 py-1.5 pl-1.5 pr-3 hover:bg-gray-50">
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                    <User className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-gray-700">
                    {session.user.name || "Seller"}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>

                <div className="invisible absolute right-0 top-full z-50 mt-2 w-48 rounded-lg border bg-white py-2 opacity-0 shadow-lg transition-all group-hover:visible group-hover:opacity-100">
                  {isAdmin && (
                    <>
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 font-medium hover:bg-gray-100"
                      >
                        <Shield className="h-4 w-4" />
                        Admin Dashboard
                      </Link>
                      <hr className="my-2" />
                    </>
                  )}
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/listings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <Package className="h-4 w-4" />
                    My Listings
                  </Link>
                  <Link
                    href="/messages"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <MessageSquare className="h-4 w-4" />
                    Messages
                  </Link>
                  <Link
                    href={`/profile/${session.user.id}`}
                    className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                  <Link
                    href="/support"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-indigo-600 hover:bg-gray-100"
                  >
                    <Headphones className="h-4 w-4" />
                    Contact Broker
                  </Link>
                  <hr className="my-2" />
                  <LogoutButton />
                </div>
              </div>
            </>
          ) : (
            <div className="hidden items-center gap-3 md:flex">
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-full border border-gray-300 py-1.5 pl-1.5 pr-3 hover:bg-gray-50"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-100 text-gray-500">
                  <User className="h-4 w-4" />
                </div>
                <span className="text-sm font-medium text-gray-700">Log In</span>
              </Link>
              <Link
                href="/register"
                className="rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
              >
                Create Account
              </Link>
            </div>
          )}

          <MobileNav user={session?.user} isAdmin={isAdmin} />
        </div>
      </div>

      <div className="border-t px-4 py-2 md:hidden">
        <form action="/marketplace" method="GET" className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="q"
            placeholder="Search items..."
            className="w-full rounded-full border border-gray-300 bg-gray-50 py-2 pl-10 pr-4 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </form>
      </div>
    </header>
  );
}
