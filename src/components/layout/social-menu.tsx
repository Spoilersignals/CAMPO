"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessagesSquare,
  MessageSquare,
  Heart,
  Eye,
  BarChart3,
  Calendar,
  BookOpen,
  Car,
  GraduationCap,
  ShoppingBag,
  Package,
  Search,
  Plus,
  LayoutDashboard,
  Bell,
  User,
} from "lucide-react";

interface SocialMenuProps {
  user?: {
    id?: string;
    name?: string | null;
    email?: string | null;
  } | null;
}

interface MenuItem {
  href: string;
  icon: React.ElementType;
  label: string;
  shortLabel: string;
  highlight?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const mainItems: MenuItem[] = [
  { href: "/", icon: Home, label: "Home", shortLabel: "Home" },
  { href: "/confessions", icon: MessageSquare, label: "Confessions", shortLabel: "Confess" },
  { href: "/crushes", icon: Heart, label: "Crushes", shortLabel: "Crushes" },
  { href: "/spotted", icon: Eye, label: "Spotted", shortLabel: "Spotted" },
  { href: "/chat", icon: MessagesSquare, label: "Campus Chat", shortLabel: "Chat" },
];

const communityItems: MenuItem[] = [
  { href: "/polls", icon: BarChart3, label: "Polls", shortLabel: "Polls" },
  { href: "/events", icon: Calendar, label: "Events", shortLabel: "Events" },
  { href: "/study-groups", icon: GraduationCap, label: "Study Groups", shortLabel: "Study" },
  { href: "/courses", icon: BookOpen, label: "Course Reviews", shortLabel: "Courses" },
  { href: "/rides", icon: Car, label: "Ride Sharing", shortLabel: "Rides" },
];

const marketplaceItems: MenuItem[] = [
  { href: "/marketplace", icon: ShoppingBag, label: "Marketplace", shortLabel: "Shop" },
  { href: "/requests", icon: Package, label: "Item Requests", shortLabel: "Requests" },
  { href: "/lost-found", icon: Search, label: "Lost & Found", shortLabel: "Lost" },
  { href: "/sell", icon: Plus, label: "Sell Item", shortLabel: "Sell", highlight: true },
];

const accountItems: MenuItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard", shortLabel: "Dashboard" },
  { href: "/my-listings", icon: Package, label: "My Listings", shortLabel: "Listings" },
  { href: "/messages", icon: MessageSquare, label: "Messages", shortLabel: "Messages" },
  { href: "/notifications", icon: Bell, label: "Notifications", shortLabel: "Alerts" },
  { href: "/profile", icon: User, label: "Profile", shortLabel: "Profile" },
];

const mobileItems: MenuItem[] = [
  { href: "/", icon: Home, label: "Home", shortLabel: "Home" },
  { href: "/confessions", icon: MessageSquare, label: "Confessions", shortLabel: "Confess" },
  { href: "/chat", icon: MessagesSquare, label: "Chat", shortLabel: "Chat" },
  { href: "/crushes", icon: Heart, label: "Crushes", shortLabel: "Crushes" },
  { href: "/marketplace", icon: ShoppingBag, label: "Shop", shortLabel: "Shop" },
];

export function SocialMenu({ user }: SocialMenuProps) {
  const pathname = usePathname();

  const sections: MenuSection[] = [
    { title: "Main", items: mainItems },
    { title: "Community", items: communityItems },
    { title: "Marketplace", items: marketplaceItems },
  ];

  if (user) {
    sections.push({ title: "Account", items: accountItems });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <>
      {/* Mobile Bottom Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white md:hidden">
        <div className="flex">
          {mobileItems.map((item) => {
            const active = isActive(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
                  active
                    ? "text-indigo-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Icon className={`h-5 w-5 ${active ? "text-indigo-600" : ""}`} />
                <span className="truncate">{item.shortLabel}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="fixed left-0 top-0 z-40 hidden h-full w-64 border-r bg-white pt-16 md:block overflow-y-auto">
        <div className="flex flex-col gap-2 p-4">
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-4" : ""}>
              <h2 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                {section.title}
              </h2>
              <nav className="flex flex-col gap-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                        item.highlight
                          ? "bg-indigo-600 text-white hover:bg-indigo-700"
                          : active
                          ? "bg-indigo-50 text-indigo-600"
                          : "text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                      }`}
                    >
                      <Icon className={`h-5 w-5 ${
                        item.highlight 
                          ? "text-white" 
                          : active 
                          ? "text-indigo-600" 
                          : "text-gray-500"
                      }`} />
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>
      </aside>

      {/* Mobile Bottom Padding Spacer */}
      <div className="h-16 md:hidden" />
    </>
  );
}
