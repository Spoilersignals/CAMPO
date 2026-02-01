"use client";

import { useState, useEffect } from "react";
import {
  X,
  Bell,
  AlertTriangle,
  Info,
  Megaphone,
  ChevronRight,
} from "lucide-react";
import {
  getActiveBroadcasts,
  markBroadcastRead,
  type BroadcastData,
} from "@/actions/broadcasts";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("broadcast-session-id");
  if (!sessionId) {
    sessionId = `sess-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("broadcast-session-id", sessionId);
  }
  return sessionId;
}

const priorityStyles = {
  URGENT: {
    bg: "bg-gradient-to-r from-red-600 to-rose-600",
    icon: AlertTriangle,
    animate: "animate-pulse",
  },
  HIGH: {
    bg: "bg-gradient-to-r from-orange-500 to-amber-500",
    icon: Bell,
    animate: "",
  },
  NORMAL: {
    bg: "bg-gradient-to-r from-purple-600 to-indigo-600",
    icon: Megaphone,
    animate: "",
  },
  LOW: {
    bg: "bg-gradient-to-r from-gray-600 to-gray-700",
    icon: Info,
    animate: "",
  },
};

export function BroadcastBanner() {
  const [broadcasts, setBroadcasts] = useState<BroadcastData[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    const sid = getSessionId();
    setSessionId(sid);
    loadBroadcasts(sid);
  }, []);

  async function loadBroadcasts(sid: string) {
    const result = await getActiveBroadcasts(sid);
    if (result.success) {
      // Show unread broadcasts first
      const unread = result.broadcasts.filter((b) => !b.isRead);
      setBroadcasts(unread);
    }
  }

  async function handleDismiss() {
    const current = broadcasts[currentIndex];
    if (current) {
      await markBroadcastRead(current.id, sessionId);
    }

    if (currentIndex < broadcasts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsVisible(false);
    }
  }

  if (!isVisible || broadcasts.length === 0) {
    return null;
  }

  const currentBroadcast = broadcasts[currentIndex];
  const style = priorityStyles[currentBroadcast.priority as keyof typeof priorityStyles] || priorityStyles.NORMAL;
  const Icon = style.icon;

  return (
    <div className={`relative ${style.bg} ${style.animate} text-white`}>
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex-shrink-0 rounded-full bg-white/20 p-1.5">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold">{currentBroadcast.title}</p>
              <p className="text-xs text-white/80 truncate">{currentBroadcast.content}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {broadcasts.length > 1 && (
              <span className="text-xs text-white/60">
                {currentIndex + 1} of {broadcasts.length}
              </span>
            )}
            {currentIndex < broadcasts.length - 1 && (
              <button
                onClick={() => setCurrentIndex(currentIndex + 1)}
                className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            )}
            <button
              onClick={handleDismiss}
              className="rounded-full bg-white/20 p-1 hover:bg-white/30 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
