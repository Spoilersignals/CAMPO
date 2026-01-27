"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { useSession } from "next-auth/react";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string;
  link?: string | null;
  commentId?: string | null;
  confessionId?: string | null;
  crushId?: string | null;
  spottedId?: string | null;
  isRead: boolean;
  readAt?: string | null;
  createdAt: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isConnected: boolean;
  markAsRead: (notificationId: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refetch: () => void;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isConnected, setIsConnected] = useState(false);

  const refetch = useCallback(() => {
    if (!session?.user) return;

    fetch("/api/notifications/recent")
      .then((res) => res.json())
      .then((data) => {
        if (data.notifications) {
          setNotifications(data.notifications);
          setUnreadCount(data.unreadCount ?? 0);
        }
      })
      .catch(console.error);
  }, [session?.user]);

  useEffect(() => {
    if (!session?.user) {
      setNotifications([]);
      setUnreadCount(0);
      setIsConnected(false);
      return;
    }

    const eventSource = new EventSource("/api/notifications/stream");

    eventSource.onopen = () => {
      setIsConnected(true);
    };

    eventSource.addEventListener("notifications", (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => {
        const newNotifications = data.notifications.filter(
          (n: Notification) => !prev.some((p) => p.id === n.id)
        );
        return [...newNotifications, ...prev].slice(0, 20);
      });
      setUnreadCount(data.unreadCount);
    });

    eventSource.addEventListener("count", (event) => {
      const data = JSON.parse(event.data);
      setUnreadCount(data.unreadCount);
    });

    eventSource.onerror = () => {
      setIsConnected(false);
    };

    refetch();

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [session?.user, refetch]);

  const markAsRead = useCallback(async (notificationId: string) => {
    try {
      await fetch("/api/notifications/mark-read", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, isRead: true, readAt: new Date().toISOString() } : n
        )
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" });
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, isRead: true, readAt: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  }, []);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        isConnected,
        markAsRead,
        markAllAsRead,
        refetch,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error("useNotifications must be used within a NotificationProvider");
  }
  return context;
}
