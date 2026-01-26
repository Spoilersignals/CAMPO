"use client";

import { NavSidebar } from "./nav-sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
  user?: {
    name?: string | null;
    email?: string | null;
  } | null;
}

export function MainLayout({ children, user }: MainLayoutProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavSidebar user={user} />
      <main className="transition-all duration-300 md:ml-64 lg:ml-64">
        <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
      </main>
    </div>
  );
}
