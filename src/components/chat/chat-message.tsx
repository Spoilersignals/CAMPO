"use client";

import * as React from "react";
import { Check, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChatMessageProps {
  content: string;
  timestamp: Date;
  isSent: boolean;
  isRead?: boolean;
}

export function ChatMessage({
  content,
  timestamp,
  isSent,
  isRead = false,
}: ChatMessageProps) {
  const formattedTime = new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(timestamp);

  return (
    <div
      className={cn("flex w-full", isSent ? "justify-end" : "justify-start")}
    >
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2",
          isSent
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        )}
      >
        <p className="text-sm leading-relaxed">{content}</p>
        <div
          className={cn(
            "mt-1 flex items-center justify-end gap-1 text-xs",
            isSent ? "text-blue-200" : "text-gray-500"
          )}
        >
          <span>{formattedTime}</span>
          {isSent && (
            <span className="ml-0.5">
              {isRead ? (
                <CheckCheck className="h-3.5 w-3.5" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
