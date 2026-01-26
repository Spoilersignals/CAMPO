import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: "📊" },
  { href: "/admin/listings", label: "Pending Listings", icon: "📝" },
  { href: "/admin/commission", label: "Commission", icon: "💰" },
  { href: "/admin/conversations", label: "Conversations", icon: "💬" },
  { href: "/admin/lost-found", label: "Lost & Found", icon: "🔍" },
  { href: "/admin/support", label: "Support Tickets", icon: "🎫" },
  { href: "/admin/users", label: "Users", icon: "👥" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      <aside className="w-64 border-r border-gray-200 bg-gray-50">
        <div className="p-4">
          <h2 className="text-lg font-semibold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500">Manage your marketplace</p>
        </div>
        <nav className="mt-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            >
              <span>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
      </aside>
      <main className="flex-1 p-6">{children}</main>
    </div>
  );
}
