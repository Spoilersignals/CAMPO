"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

const AVAILABLE_REACTIONS = ["❤️", "👍", "😂", "😮", "😢", "🔥", "👎", "🎉"];

interface TelegramReactionsProps {
  reactions: Array<{ emoji: string; count: number }>;
  userReactions: string[];
  onToggleReaction: (emoji: string) => void;
  size?: "sm" | "md" | "lg";
  darkMode?: boolean;
}

export function TelegramReactions({
  reactions,
  userReactions,
  onToggleReaction,
  size = "md",
  darkMode = false,
}: TelegramReactionsProps) {
  const [showPicker, setShowPicker] = React.useState(false);
  const pickerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        pickerRef.current &&
        !pickerRef.current.contains(event.target as Node)
      ) {
        setShowPicker(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const sizeClasses = {
    sm: "h-6 px-1.5 text-sm gap-1",
    md: "h-8 px-2 text-base gap-1.5",
    lg: "h-10 px-3 text-lg gap-2",
  };

  const emojiSize = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className="relative flex flex-wrap items-center gap-1">
      {reactions.map(({ emoji, count }) => {
        const isUserReaction = userReactions.includes(emoji);
        return (
          <button
            key={emoji}
            onClick={() => onToggleReaction(emoji)}
            className={cn(
              "inline-flex items-center rounded-full border transition-all duration-200 hover:scale-105 active:scale-95",
              sizeClasses[size],
              isUserReaction
                ? darkMode 
                  ? "border-blue-400 bg-blue-500/30 text-white"
                  : "border-blue-500 bg-blue-50 text-blue-700"
                : darkMode
                  ? "border-white/30 bg-white/10 text-white hover:bg-white/20"
                  : "border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
            )}
          >
            <span
              className={cn(
                emojiSize[size],
                "inline-block transition-transform duration-200"
              )}
              style={{
                animation: isUserReaction
                  ? "reaction-pop 0.3s ease-out"
                  : undefined,
              }}
            >
              {emoji}
            </span>
            <span className="text-xs font-medium">{count}</span>
          </button>
        );
      })}

      <div ref={pickerRef} className="relative">
        <button
          onClick={() => setShowPicker(!showPicker)}
          className={cn(
            "inline-flex items-center justify-center rounded-full border border-dashed transition-all duration-200",
            darkMode 
              ? "border-white/30 text-white/70 hover:border-white/50 hover:bg-white/10 hover:text-white"
              : "border-gray-300 text-gray-500 hover:border-gray-400 hover:bg-gray-100 hover:text-gray-700",
            size === "sm" ? "h-6 w-6 text-sm" : size === "lg" ? "h-10 w-10 text-lg" : "h-8 w-8 text-base"
          )}
        >
          +
        </button>

        {showPicker && (
          <div
            className={cn(
              "absolute bottom-full left-0 z-50 mb-2 flex gap-1 rounded-lg border p-2 shadow-lg",
              darkMode ? "border-white/20 bg-gray-800" : "border-gray-200 bg-white"
            )}
            style={{ animation: "picker-fade-in 0.15s ease-out" }}
          >
            {AVAILABLE_REACTIONS.map((emoji) => {
              const isUserReaction = userReactions.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => {
                    onToggleReaction(emoji);
                    setShowPicker(false);
                  }}
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-md transition-all duration-150 hover:scale-110",
                    darkMode ? "hover:bg-white/10" : "hover:bg-gray-100",
                    isUserReaction && (darkMode ? "bg-blue-500/30" : "bg-blue-50")
                  )}
                >
                  <span className="text-lg">{emoji}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>

      <style jsx>{`
        @keyframes reaction-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }
        @keyframes picker-fade-in {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
