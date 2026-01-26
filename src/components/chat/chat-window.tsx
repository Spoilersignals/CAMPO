"use client";

import * as React from "react";
import { ArrowLeft, MoreVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ChatMessage, ChatMessageProps } from "./chat-message";
import { ChatInput } from "./chat-input";

export interface ChatUser {
  id: string | null;
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
}

export interface ChatListing {
  id: string;
  title: string;
  imageUrl?: string | null;
  price?: number;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string | null;
  isRead: boolean;
}

export interface ChatWindowProps {
  currentUserId: string;
  otherUser: ChatUser;
  listing?: ChatListing;
  messages: Message[];
  onSendMessage: (content: string) => void;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatWindow({
  currentUserId,
  otherUser,
  listing,
  messages,
  onSendMessage,
  onBack,
  isLoading = false,
  className,
}: ChatWindowProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      {/* Header */}
      <div className="flex items-center gap-3 border-b px-4 py-3">
        {onBack && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            className="h-9 w-9 shrink-0 rounded-full p-0 lg:hidden"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="sr-only">Back</span>
          </Button>
        )}

        <div className="relative">
          <Avatar
            src={otherUser.avatarUrl}
            fallback={otherUser.name}
            size="md"
          />
          {otherUser.isOnline && (
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-green-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h2 className="truncate text-sm font-semibold text-gray-900">
            {otherUser.name}
          </h2>
          {listing && (
            <p className="truncate text-xs text-gray-500">{listing.title}</p>
          )}
        </div>

        {listing?.imageUrl && (
          <div className="hidden h-10 w-10 shrink-0 overflow-hidden rounded-lg sm:block">
            <img
              src={listing.imageUrl}
              alt={listing.title}
              className="h-full w-full object-cover"
            />
          </div>
        )}

        <Button variant="ghost" size="sm" className="h-9 w-9 shrink-0 rounded-full p-0">
          <MoreVertical className="h-5 w-5 text-gray-500" />
          <span className="sr-only">More options</span>
        </Button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && !isLoading && (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-gray-500">
                No messages yet. Start the conversation!
              </p>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isSent={message.senderId === currentUserId}
              isRead={message.isRead}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input */}
      <ChatInput onSend={onSendMessage} disabled={isLoading} />
    </div>
  );
}
