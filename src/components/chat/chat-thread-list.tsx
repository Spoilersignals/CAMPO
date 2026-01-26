"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";

export interface ChatThread {
  id: string;
  otherUser: {
    id: string | null;
    name: string;
    avatarUrl?: string | null;
    isOnline?: boolean;
  };
  listing: {
    id: string;
    title: string;
    imageUrl?: string | null;
  };
  lastMessage?: {
    content: string;
    timestamp: Date;
    isFromCurrentUser: boolean;
  };
  unreadCount: number;
}

export interface ChatThreadListProps {
  threads: ChatThread[];
  selectedThreadId?: string;
  onSelectThread: (threadId: string) => void;
  className?: string;
}

function formatTimestamp(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const oneDay = 24 * 60 * 60 * 1000;
  const oneWeek = 7 * oneDay;

  if (diff < oneDay && date.getDate() === now.getDate()) {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  }

  if (diff < oneWeek) {
    return new Intl.DateTimeFormat("en-US", { weekday: "short" }).format(date);
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
  }).format(date);
}

export function ChatThreadList({
  threads,
  selectedThreadId,
  onSelectThread,
  className,
}: ChatThreadListProps) {
  if (threads.length === 0) {
    return (
      <div className={cn("flex h-full items-center justify-center p-8", className)}>
        <p className="text-center text-sm text-gray-500">
          No conversations yet
        </p>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col overflow-y-auto", className)}>
      {threads.map((thread) => (
        <button
          key={thread.id}
          onClick={() => onSelectThread(thread.id)}
          className={cn(
            "flex w-full items-start gap-3 border-b px-4 py-3 text-left transition-colors hover:bg-gray-50",
            selectedThreadId === thread.id && "bg-blue-50 hover:bg-blue-50"
          )}
        >
          {/* User Avatar */}
          <div className="relative shrink-0">
            <Avatar
              src={thread.otherUser.avatarUrl}
              fallback={thread.otherUser.name}
              size="md"
            />
            {thread.otherUser.isOnline && (
              <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full border-2 border-white bg-green-500" />
            )}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h3
                className={cn(
                  "truncate text-sm",
                  thread.unreadCount > 0 ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                )}
              >
                {thread.otherUser.name}
              </h3>
              {thread.lastMessage && (
                <span className="shrink-0 text-xs text-gray-500">
                  {formatTimestamp(thread.lastMessage.timestamp)}
                </span>
              )}
            </div>

            <p className="mt-0.5 truncate text-xs text-gray-500">
              {thread.listing.title}
            </p>

            {thread.lastMessage && (
              <p
                className={cn(
                  "mt-1 truncate text-sm",
                  thread.unreadCount > 0 ? "font-medium text-gray-900" : "text-gray-500"
                )}
              >
                {thread.lastMessage.isFromCurrentUser && (
                  <span className="text-gray-400">You: </span>
                )}
                {thread.lastMessage.content}
              </p>
            )}
          </div>

          {/* Right Side: Listing Image & Unread Badge */}
          <div className="flex shrink-0 flex-col items-end gap-2">
            {thread.listing.imageUrl && (
              <div className="h-10 w-10 overflow-hidden rounded-lg">
                <img
                  src={thread.listing.imageUrl}
                  alt={thread.listing.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}
            {thread.unreadCount > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1.5 text-xs font-medium text-white">
                {thread.unreadCount > 99 ? "99+" : thread.unreadCount}
              </span>
            )}
          </div>
        </button>
      ))}
    </div>
  );
}
