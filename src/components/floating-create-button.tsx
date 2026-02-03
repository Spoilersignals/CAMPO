"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Plus, X, MessageSquare, Rss, Eye } from "lucide-react";

type MenuItem = {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  gradient: string;
  emoji: string;
};

const menuItems: MenuItem[] = [
  {
    href: "/confessions/new",
    icon: MessageSquare,
    label: "Make a Confession",
    gradient: "from-purple-500 to-indigo-600",
    emoji: "🤫",
  },
  {
    href: "/feed/new",
    icon: Rss,
    label: "Post to Feed",
    gradient: "from-blue-500 to-cyan-500",
    emoji: "📝",
  },
  {
    href: "/spotted/new",
    icon: Eye,
    label: "Share a Spotted",
    gradient: "from-pink-500 to-rose-500",
    emoji: "👀",
  },
];

export function FloatingCreateButton() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div
      ref={menuRef}
      className="fixed bottom-24 right-4 z-50 sm:bottom-8 sm:right-6"
    >
      {/* Menu Items */}
      <div
        className={`absolute bottom-16 right-0 flex flex-col gap-3 transition-all duration-300 ${
          isOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 translate-y-4 pointer-events-none"
        }`}
      >
        {menuItems.map((item, index) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setIsOpen(false)}
            className="group flex items-center gap-3 transition-all duration-300"
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : "0ms",
              transform: isOpen ? "translateX(0)" : "translateX(20px)",
              opacity: isOpen ? 1 : 0,
            }}
          >
            {/* Label */}
            <div className="glass-menu rounded-xl px-4 py-2.5 shadow-xl transition-all duration-200 group-hover:scale-105 group-hover:shadow-2xl">
              <div className="flex items-center gap-2">
                <span className="text-lg">{item.emoji}</span>
                <span className="whitespace-nowrap text-sm font-medium text-white">
                  {item.label}
                </span>
              </div>
            </div>

            {/* Icon Button */}
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.gradient} shadow-lg transition-all duration-200 group-hover:scale-110 group-hover:shadow-xl`}
            >
              <item.icon className="h-5 w-5 text-white" />
            </div>
          </Link>
        ))}
      </div>

      {/* Main Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`group relative flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/30 ${
          isOpen ? "rotate-45" : "animate-float-button"
        }`}
        aria-label={isOpen ? "Close menu" : "Create new post"}
      >
        {/* Pulse ring effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 animate-ping-slow opacity-30" />
        
        {/* Glow effect */}
        <span className="absolute inset-0 rounded-full bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 blur-lg opacity-50 group-hover:opacity-75 transition-opacity" />
        
        {/* Icon */}
        <span className="relative z-10 transition-transform duration-300">
          {isOpen ? (
            <X className="h-7 w-7 text-white" />
          ) : (
            <Plus className="h-7 w-7 text-white" />
          )}
        </span>
      </button>
    </div>
  );
}
