"use client";

import { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Eye, Clock, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { viewStory, reactToStory, deleteStory } from "@/actions/stories";

interface Story {
  id: string;
  content: string | null;
  mediaUrl: string | null;
  mediaType: string | null;
  sessionId?: string;
  viewCount: number;
  expiresAt: Date;
  createdAt: Date;
  timeLeft: number;
  reactionCount: number;
}

interface StoryViewerProps {
  stories: Story[];
  initialIndex: number;
  currentSessionId: string;
  onClose: () => void;
}

const STORY_DURATION = 5000;
const REACTION_EMOJIS = ["❤️", "🔥", "😂", "😮", "😢", "👏"];

const BACKGROUND_COLORS = [
  "bg-gradient-to-br from-purple-600 to-pink-500",
  "bg-gradient-to-br from-blue-600 to-cyan-500",
  "bg-gradient-to-br from-green-600 to-emerald-500",
  "bg-gradient-to-br from-orange-500 to-red-500",
  "bg-gradient-to-br from-indigo-600 to-purple-500",
  "bg-gradient-to-br from-pink-500 to-rose-500",
];

function getBackgroundClass(storyId: string): string {
  let hash = 0;
  for (let i = 0; i < storyId.length; i++) {
    hash = storyId.charCodeAt(i) + ((hash << 5) - hash);
  }
  return BACKGROUND_COLORS[Math.abs(hash) % BACKGROUND_COLORS.length];
}

function formatTimeLeft(ms: number): string {
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
  if (hours > 0) return `${hours}h ${minutes}m left`;
  if (minutes > 0) return `${minutes}m left`;
  return "Expiring soon";
}

export function StoryViewer({
  stories,
  initialIndex,
  currentSessionId,
  onClose,
}: StoryViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [userReactions, setUserReactions] = useState<Set<string>>(new Set());
  const [isDeleting, setIsDeleting] = useState(false);

  const currentStory = stories[currentIndex];
  const isOwnStory = currentStory?.sessionId === currentSessionId;

  const goNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goPrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setProgress(0);
    }
  }, [currentIndex]);

  useEffect(() => {
    if (currentStory) {
      viewStory(currentStory.id);
    }
  }, [currentStory]);

  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goNext();
          return 0;
        }
        return prev + 100 / (STORY_DURATION / 100);
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isPaused, goNext]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") onClose();
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goNext, goPrev, onClose]);

  async function handleReaction(emoji: string) {
    if (!currentStory) return;

    const result = await reactToStory(currentStory.id, emoji);
    if (result.success && result.data) {
      setUserReactions((prev) => {
        const next = new Set(prev);
        if (result.data?.added) {
          next.add(emoji);
        } else {
          next.delete(emoji);
        }
        return next;
      });
    }
    setShowReactions(false);
  }

  async function handleDelete() {
    if (!currentStory || !isOwnStory) return;
    setIsDeleting(true);

    const result = await deleteStory(currentStory.id);
    if (result.success) {
      if (stories.length <= 1) {
        onClose();
      } else if (currentIndex >= stories.length - 1) {
        setCurrentIndex(currentIndex - 1);
      }
    }
    setIsDeleting(false);
  }

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black">
      <div className="absolute left-0 right-0 top-0 z-20 flex gap-1 p-2">
        {stories.map((_, idx) => (
          <div
            key={idx}
            className="h-1 flex-1 overflow-hidden rounded-full bg-white/30"
          >
            <div
              className={cn(
                "h-full bg-white transition-all duration-100",
                idx < currentIndex ? "w-full" : idx === currentIndex ? "" : "w-0"
              )}
              style={{
                width: idx === currentIndex ? `${progress}%` : undefined,
              }}
            />
          </div>
        ))}
      </div>

      <div className="absolute left-0 right-0 top-4 z-20 flex items-center justify-between px-4 pt-2">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20 text-lg font-bold text-white">
            👤
          </div>
          <div>
            <p className="text-sm font-medium text-white">
              {isOwnStory ? "Your Story" : "Anonymous"}
            </p>
            <div className="flex items-center gap-2 text-xs text-white/70">
              <Clock className="h-3 w-3" />
              <span>{formatTimeLeft(currentStory.timeLeft)}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {isOwnStory && (
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="rounded-full p-2 text-white/80 transition hover:bg-white/20 hover:text-white disabled:opacity-50"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          )}
          <button
            onClick={onClose}
            className="rounded-full p-2 text-white/80 transition hover:bg-white/20 hover:text-white"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
      </div>

      <div
        className="flex h-full items-center justify-center"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {currentStory.mediaUrl ? (
          currentStory.mediaType === "video" ? (
            <video
              src={currentStory.mediaUrl}
              className="h-full w-full object-contain"
              autoPlay
              muted
              loop
              playsInline
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt="Story"
              className="h-full w-full object-contain"
            />
          )
        ) : (
          <div
            className={cn(
              "flex h-full w-full items-center justify-center p-8",
              getBackgroundClass(currentStory.id)
            )}
          >
            <p className="max-w-md text-center text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
              {currentStory.content}
            </p>
          </div>
        )}
      </div>

      <button
        onClick={goPrev}
        className="absolute left-0 top-1/2 z-10 flex h-full w-1/3 -translate-y-1/2 items-center justify-start pl-2 opacity-0 transition hover:opacity-100"
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-8 w-8 text-white drop-shadow-lg" />
      </button>
      <button
        onClick={goNext}
        className="absolute right-0 top-1/2 z-10 flex h-full w-1/3 -translate-y-1/2 items-center justify-end pr-2 opacity-0 transition hover:opacity-100"
      >
        <ChevronRight className="h-8 w-8 text-white drop-shadow-lg" />
      </button>

      <div className="absolute bottom-0 left-0 right-0 z-20 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-white/80">
            <div className="flex items-center gap-1">
              <Eye className="h-4 w-4" />
              <span className="text-sm">{currentStory.viewCount}</span>
            </div>
            {currentStory.reactionCount > 0 && (
              <span className="text-sm">
                {currentStory.reactionCount} reaction
                {currentStory.reactionCount !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          {!isOwnStory && (
            <div className="relative">
              {showReactions ? (
                <div className="absolute bottom-full right-0 mb-2 flex gap-1 rounded-full bg-white/10 p-2 backdrop-blur-sm">
                  {REACTION_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => handleReaction(emoji)}
                      className={cn(
                        "rounded-full p-2 text-2xl transition hover:scale-125 hover:bg-white/20",
                        userReactions.has(emoji) && "bg-white/30"
                      )}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              ) : null}
              <button
                onClick={() => setShowReactions(!showReactions)}
                className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                React ❤️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
