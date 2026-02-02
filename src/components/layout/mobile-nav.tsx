"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  Home,
  ShoppingBag,
  Lightbulb,
  Search as SearchIcon,
  User,
  Package,
  MessageSquare,
  LogOut,
  LogIn,
  UserPlus,
  Bell,
  LayoutDashboard,
  MessageCircle,
  HelpCircle,
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
  ChevronDown,
  Shield,
} from "lucide-react";

interface MobileNavProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
    image?: string | null;
  } | null;
  isAdmin?: boolean;
}

export function MobileNav({ user, isAdmin }: MobileNavProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [communityOpen, setCommunityOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setIsOpen(true)}
        className="rounded-full p-2 text-gray-600 hover:bg-gray-100"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setIsOpen(false)}
          />

          <div className="absolute right-0 top-0 h-full w-72 bg-white shadow-xl">
            <div className="flex items-center justify-between border-b p-4">
              <span className="flex items-center gap-2 text-lg font-semibold text-indigo-600">
                <MessageCircle className="h-5 w-5" />
                ComradeZone
              </span>
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-full p-2 hover:bg-gray-100"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="p-4">
              <div className="space-y-1">
                <Link
                  href="/"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <Home className="h-5 w-5" />
                  Home
                </Link>
                <Link
                  href="/marketplace"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <ShoppingBag className="h-5 w-5" />
                  Marketplace
                </Link>
                <Link
                  href="/requests"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <Lightbulb className="h-5 w-5" />
                  Item Suggestions
                </Link>
                <Link
                  href="/lost-found"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <SearchIcon className="h-5 w-5" />
                  Lost & Found
                </Link>
                <Link
                  href="/how-it-works"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                >
                  <HelpCircle className="h-5 w-5" />
                  How It Works
                </Link>
                <Link
                  href="/sell"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-white hover:bg-indigo-700"
                >
                  <Package className="h-5 w-5" />
                  Sell Item
                </Link>

                {/* Community Section */}
                <div className="mt-2">
                  <button
                    onClick={() => setCommunityOpen(!communityOpen)}
                    className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <span className="flex items-center gap-3">
                      <Users className="h-5 w-5" />
                      Community
                    </span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${communityOpen ? "rotate-180" : ""}`} />
                  </button>
                  {communityOpen && (
                    <div className="ml-6 space-y-1 border-l-2 border-gray-200 pl-3">
                      <Link
                        href="/chat"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <MessagesSquare className="h-4 w-4" />
                        Campus Chat
                      </Link>
                      <Link
                        href="/confessions"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <MessageSquare className="h-4 w-4" />
                        Confessions
                      </Link>
                      <Link
                        href="/crushes"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <Heart className="h-4 w-4" />
                        Crushes
                      </Link>
                      <Link
                        href="/spotted"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <Eye className="h-4 w-4" />
                        Spotted
                      </Link>
                      <Link
                        href="/polls"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <BarChart3 className="h-4 w-4" />
                        Polls
                      </Link>
                      <Link
                        href="/events"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <Calendar className="h-4 w-4" />
                        Events
                      </Link>
                      <Link
                        href="/courses"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <BookOpen className="h-4 w-4" />
                        Course Reviews
                      </Link>
                      <Link
                        href="/rides"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <Car className="h-4 w-4" />
                        Ride Sharing
                      </Link>
                      <Link
                        href="/study-groups"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
                      >
                        <GraduationCap className="h-4 w-4" />
                        Study Groups
                      </Link>
                    </div>
                  )}
                </div>
              </div>

              <hr className="my-4" />

              {user ? (
                <div className="space-y-1">
                  <div className="mb-4 flex items-center gap-3 px-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100 text-indigo-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {user.name || "Seller"}
                      </p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>

                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setIsOpen(false)}
                      className="flex items-center gap-3 rounded-lg bg-indigo-50 px-3 py-2.5 text-indigo-700 hover:bg-indigo-100"
                    >
                      <Shield className="h-5 w-5" />
                      Admin Dashboard
                    </Link>
                  )}
                  <Link
                    href="/notifications"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <Bell className="h-5 w-5" />
                    Notifications
                  </Link>
                  <Link
                    href="/dashboard"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <LayoutDashboard className="h-5 w-5" />
                    Dashboard
                  </Link>
                  <Link
                    href="/dashboard/listings"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <Package className="h-5 w-5" />
                    My Listings
                  </Link>
                  <Link
                    href="/messages"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <MessageSquare className="h-5 w-5" />
                    Messages
                  </Link>
                  <Link
                    href={user?.id ? `/profile/${user.id}` : "/dashboard"}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <User className="h-5 w-5" />
                    Profile
                  </Link>
                  <Link
                    href="/support"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-indigo-600 hover:bg-gray-100"
                  >
                    <Headphones className="h-5 w-5" />
                    Contact Broker
                  </Link>

                  <hr className="my-4" />

                  <button
                    type="button"
                    onClick={() => {
                      import("next-auth/react").then(({ signOut }) => {
                        signOut({ callbackUrl: "/" });
                      });
                    }}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-red-600 hover:bg-gray-100"
                  >
                    <LogOut className="h-5 w-5" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link
                    href="/login"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-gray-700 hover:bg-gray-100"
                  >
                    <LogIn className="h-5 w-5" />
                    Log In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-3 rounded-lg bg-indigo-600 px-3 py-2.5 text-white hover:bg-indigo-700"
                  >
                    <UserPlus className="h-5 w-5" />
                    Create Account
                  </Link>
                </div>
              )}
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
