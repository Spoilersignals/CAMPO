"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Bell, MessageSquare, Heart, Eye, UserPlus, Check } from "lucide-react";
import { useNotifications } from "@/lib/notification-context";
import { formatDistanceToNow } from "date-fns";

const typeIcons: Record<string, typeof MessageSquare> = {
  COMMENT: MessageSquare,
  REPLY: MessageSquare,
  REACTION: Heart,
  FOLLOW: UserPlus,
  SPOTTED: Eye,
};

export function NotificationBell() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleNotificationClick = async (notificationId: string, isRead: boolean) => {
    if (!isRead) {
      await markAsRead(notificationId);
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative rounded-full p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-lg border bg-white shadow-lg dark:bg-gray-900 dark:border-gray-700">
          <div className="flex items-center justify-between border-b px-4 py-3 dark:border-gray-700">
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-700"
              >
                <Check className="h-3 w-3" />
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="px-4 py-8 text-center text-sm text-gray-500">
                No notifications yet
              </div>
            ) : (
              notifications.slice(0, 5).map((notification) => {
                const Icon = typeIcons[notification.type] || Bell;
                return (
                  <Link
                    key={notification.id}
                    href={notification.link || "/notifications"}
                    onClick={() => handleNotificationClick(notification.id, notification.isRead)}
                    className={`flex gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 ${
                      !notification.isRead ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                    }`}
                  >
                    <div
                      className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                        !notification.isRead
                          ? "bg-indigo-100 text-indigo-600"
                          : "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm ${
                          !notification.isRead
                            ? "font-medium text-gray-900 dark:text-white"
                            : "text-gray-700 dark:text-gray-300"
                        }`}
                      >
                        {notification.title}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {notification.body}
                      </p>
                      <p className="mt-1 text-xs text-gray-400">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    {!notification.isRead && (
                      <div className="h-2 w-2 shrink-0 rounded-full bg-indigo-600" />
                    )}
                  </Link>
                );
              })
            )}
          </div>

          <div className="border-t px-4 py-3 dark:border-gray-700">
            <Link
              href="/notifications"
              onClick={() => setIsOpen(false)}
              className="block text-center text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
