"use client";

import * as React from "react";
import { ArrowLeft, MoreVertical, AlertCircle, Shield, BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";

export interface ThreadUser {
  id: string;
  name: string;
  avatarUrl?: string | null;
  isOnline?: boolean;
  isVerified?: boolean;
}

export interface ThreadListing {
  id: string;
  title: string;
  imageUrl?: string | null;
  price?: number;
}

export interface ThreadMessage {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string | null;
  senderName?: string;
  isRead: boolean;
  isFromSeller: boolean;
}

export type ViewerType = "guest" | "seller" | "moderator";

export interface ChatThreadProps {
  threadId: string;
  viewerType: ViewerType;
  viewerId?: string;
  viewerName?: string;
  otherUser: ThreadUser;
  listing?: ThreadListing;
  messages: ThreadMessage[];
  supportRequested?: boolean;
  onSendMessage: (content: string) => void;
  onRequestSupport?: () => void;
  onBack?: () => void;
  isLoading?: boolean;
  className?: string;
}

export function ChatThread({
  threadId,
  viewerType,
  viewerId,
  viewerName,
  otherUser,
  listing,
  messages,
  supportRequested,
  onSendMessage,
  onRequestSupport,
  onBack,
  isLoading = false,
  className,
}: ChatThreadProps) {
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isSentByViewer = (message: ThreadMessage): boolean => {
    if (viewerType === "guest") {
      return !message.isFromSeller;
    }
    if (viewerType === "seller") {
      return message.isFromSeller && message.senderId === viewerId;
    }
    return false;
  };

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
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
          <div className="flex items-center gap-1.5">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {otherUser.name}
            </h2>
            {otherUser.isVerified && (
              <BadgeCheck className="h-4 w-4 text-blue-500" />
            )}
          </div>
          {listing && (
            <p className="truncate text-xs text-gray-500">{listing.title}</p>
          )}
        </div>

        {viewerType === "moderator" && (
          <Badge variant="warning" className="shrink-0">
            <Shield className="mr-1 h-3 w-3" />
            Moderator View
          </Badge>
        )}

        {supportRequested && (
          <Badge variant="warning" className="shrink-0">
            <AlertCircle className="mr-1 h-3 w-3" />
            Support Requested
          </Badge>
        )}

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
            <div key={message.id}>
              {viewerType === "moderator" && message.senderName && (
                <p className="mb-1 text-xs text-gray-500">
                  {message.isFromSeller ? "Seller" : "Buyer"}: {message.senderName}
                </p>
              )}
              <ChatMessage
                content={message.content}
                timestamp={message.timestamp}
                isSent={isSentByViewer(message)}
                isRead={message.isRead}
              />
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {viewerType !== "moderator" && (
        <div className="border-t">
          {onRequestSupport && viewerType === "guest" && !supportRequested && (
            <div className="flex justify-center border-b px-4 py-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={onRequestSupport}
                className="text-orange-600 hover:text-orange-700"
              >
                <AlertCircle className="mr-1.5 h-4 w-4" />
                Request Support
              </Button>
            </div>
          )}
          <ChatInput onSend={onSendMessage} disabled={isLoading} />
        </div>
      )}

      {viewerType === "moderator" && (
        <div className="border-t bg-gray-50 p-4">
          <p className="text-center text-sm text-gray-500">
            Viewing as moderator. You cannot send messages.
          </p>
        </div>
      )}
    </div>
  );
}
