"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageSquare,
  Heart,
  Eye,
  MessagesSquare,
  BarChart3,
  Calendar,
  GraduationCap,
  BookOpen,
  Car,
  ShoppingBag,
  Package,
  Search,
  Plus,
  LayoutDashboard,
  Bell,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

interface NavSidebarProps {
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  highlight?: boolean;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

export function NavSidebar({ user }: NavSidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  const mainItems: NavItem[] = [
    { label: "Home", href: "/", icon: <Home className="h-5 w-5" /> },
    { label: "Confessions", href: "/confessions", icon: <MessageSquare className="h-5 w-5" /> },
    { label: "Crushes", href: "/crushes", icon: <Heart className="h-5 w-5" /> },
    { label: "Spotted", href: "/spotted", icon: <Eye className="h-5 w-5" /> },
    { label: "Campus Chat", href: "/chat", icon: <MessagesSquare className="h-5 w-5" /> },
  ];

  const communityItems: NavItem[] = [
    { label: "Polls", href: "/polls", icon: <BarChart3 className="h-5 w-5" /> },
    { label: "Events", href: "/events", icon: <Calendar className="h-5 w-5" /> },
    { label: "Study Groups", href: "/study-groups", icon: <GraduationCap className="h-5 w-5" /> },
    { label: "Course Reviews", href: "/courses", icon: <BookOpen className="h-5 w-5" /> },
    { label: "Ride Sharing", href: "/rides", icon: <Car className="h-5 w-5" /> },
  ];

  const marketplaceItems: NavItem[] = [
    { label: "Browse", href: "/marketplace", icon: <ShoppingBag className="h-5 w-5" /> },
    { label: "Item Requests", href: "/requests", icon: <Package className="h-5 w-5" /> },
    { label: "Lost & Found", href: "/lost-found", icon: <Search className="h-5 w-5" /> },
    { label: "Sell Item", href: "/sell", icon: <Plus className="h-5 w-5" />, highlight: true },
  ];

  const accountItems: NavItem[] = [
    { label: "Dashboard", href: "/dashboard", icon: <LayoutDashboard className="h-5 w-5" /> },
    { label: "My Listings", href: "/dashboard/listings", icon: <Package className="h-5 w-5" /> },
    { label: "Messages", href: "/messages", icon: <MessageSquare className="h-5 w-5" /> },
    { label: "Notifications", href: "/notifications", icon: <Bell className="h-5 w-5" /> },
  ];

  const sections: NavSection[] = [
    { title: "Main", items: mainItems },
    { title: "Community", items: communityItems },
    { title: "Marketplace", items: marketplaceItems },
  ];

  if (user) {
    sections.push({ title: "Account", items: accountItems });
  }

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <aside
      className={`fixed left-0 top-16 z-40 hidden h-[calc(100vh-4rem)] border-r bg-white transition-all duration-300 md:block ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="flex h-full flex-col">
        <div className="flex-1 overflow-y-auto p-3">
          {sections.map((section, sectionIndex) => (
            <div key={section.title} className={sectionIndex > 0 ? "mt-6" : ""}>
              {!collapsed && (
                <h3 className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </h3>
              )}
              <nav className="space-y-1">
                {section.items.map((item) => {
                  const active = isActive(item.href);
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
                      } ${collapsed ? "justify-center" : ""}`}
                      title={collapsed ? item.label : undefined}
                    >
                      {item.icon}
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm text-gray-600 hover:bg-gray-100"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <>
                <ChevronLeft className="h-5 w-5" />
                <span>Collapse</span>
              </>
            )}
          </button>
        </div>
      </div>
    </aside>
  );
}
