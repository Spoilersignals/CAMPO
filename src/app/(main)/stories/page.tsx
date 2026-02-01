"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Clock, Eye, Flame } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StoryViewer } from "@/components/stories/story-viewer";
import { getStories, getMyStories } from "@/actions/stories";
import { cn } from "@/lib/utils";

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
  if (hours > 0) return `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return "<1m";
}

export default function StoriesPage() {
  const [stories, setStories] = useState<Story[]>([]);
  const [myStories, setMyStories] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [currentSessionId, setCurrentSessionId] = useState("");

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    setLoading(true);
    const [storiesResult, myStoriesResult] = await Promise.all([
      getStories(),
      getMyStories(),
    ]);

    if (storiesResult.success && storiesResult.data) {
      setStories(storiesResult.data.stories);
      if (storiesResult.data.stories.length > 0) {
        setCurrentSessionId(storiesResult.data.stories[0].sessionId);
      }
    }

    if (myStoriesResult.success && myStoriesResult.data) {
      setMyStories(myStoriesResult.data.stories as Story[]);
    }

    setLoading(false);
  }

  function openViewer(index: number, isMyStory: boolean = false) {
    if (isMyStory) {
      const fullIndex = stories.findIndex((s) => s.id === myStories[index]?.id);
      setViewerIndex(fullIndex >= 0 ? fullIndex : 0);
    } else {
      setViewerIndex(index);
    }
    setViewerOpen(true);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  const allStories = stories;
  const hasMyStory = myStories.length > 0;

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <div className="mb-2 flex items-center gap-2">
          <Flame className="h-6 w-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Stories</h1>
        </div>
        <p className="text-gray-600">
          Share moments that disappear in 24 hours ⏳
        </p>
      </div>

      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex gap-4">
          <Link
            href="/stories/new"
            className="group flex shrink-0 flex-col items-center gap-2"
          >
            <div className="relative">
              <div
                className={cn(
                  "flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed transition",
                  hasMyStory
                    ? "border-purple-400 bg-gradient-to-br from-purple-100 to-pink-100"
                    : "border-gray-300 bg-gray-100 group-hover:border-purple-400 group-hover:bg-purple-50"
                )}
              >
                {hasMyStory ? (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      openViewer(0, true);
                    }}
                    className="h-16 w-16 overflow-hidden rounded-full"
                  >
                    {myStories[0].mediaUrl ? (
                      <img
                        src={myStories[0].mediaUrl}
                        alt="Your story"
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div
                        className={cn(
                          "flex h-full w-full items-center justify-center text-xs text-white",
                          getBackgroundClass(myStories[0].id)
                        )}
                      >
                        <span className="line-clamp-2 px-1 text-center font-medium">
                          {myStories[0].content?.slice(0, 20)}
                        </span>
                      </div>
                    )}
                  </button>
                ) : (
                  <Plus className="h-8 w-8 text-gray-400 transition group-hover:text-purple-500" />
                )}
              </div>
              {hasMyStory && (
                <Link
                  href="/stories/new"
                  className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-blue-500 text-white shadow-lg transition hover:bg-blue-600"
                >
                  <Plus className="h-4 w-4" />
                </Link>
              )}
            </div>
            <span className="text-xs font-medium text-gray-700">
              {hasMyStory ? "Your Story" : "Add Story"}
            </span>
          </Link>

          {allStories
            .filter((s) => !myStories.some((ms) => ms.id === s.id))
            .map((story, idx) => (
              <button
                key={story.id}
                onClick={() => {
                  const realIndex = allStories.findIndex(
                    (s) => s.id === story.id
                  );
                  openViewer(realIndex);
                }}
                className="group flex shrink-0 flex-col items-center gap-2"
              >
                <div className="relative">
                  <div className="rounded-full bg-gradient-to-tr from-purple-500 via-pink-500 to-orange-500 p-0.5">
                    <div className="rounded-full bg-white p-0.5">
                      <div className="h-16 w-16 overflow-hidden rounded-full">
                        {story.mediaUrl ? (
                          <img
                            src={story.mediaUrl}
                            alt="Story preview"
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div
                            className={cn(
                              "flex h-full w-full items-center justify-center text-xs text-white",
                              getBackgroundClass(story.id)
                            )}
                          >
                            <span className="line-clamp-2 px-1 text-center font-medium">
                              {story.content?.slice(0, 15)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 rounded-full bg-black/70 px-1.5 py-0.5 text-[10px] text-white">
                    <Clock className="mr-0.5 inline h-2.5 w-2.5" />
                    {formatTimeLeft(story.timeLeft)}
                  </div>
                </div>
                <span className="max-w-[70px] truncate text-xs text-gray-600">
                  Anonymous
                </span>
              </button>
            ))}
        </div>
      </div>

      {allStories.length === 0 && !hasMyStory ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 p-12 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-pink-100">
            <Clock className="h-8 w-8 text-purple-500" />
          </div>
          <h3 className="mb-2 text-lg font-semibold text-gray-900">
            No stories yet
          </h3>
          <p className="mb-4 text-gray-600">
            Be the first to share a moment with campus!
          </p>
          <Link
            href="/stories/new"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-medium text-white transition hover:from-purple-700 hover:to-pink-700"
          >
            <Plus className="h-5 w-5" />
            Create Your Story
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {allStories.map((story, idx) => {
            const isOwn = myStories.some((ms) => ms.id === story.id);
            return (
              <button
                key={story.id}
                onClick={() => openViewer(idx)}
                className="group relative aspect-[9/16] overflow-hidden rounded-2xl shadow-lg transition hover:shadow-xl"
              >
                {story.mediaUrl ? (
                  story.mediaType === "video" ? (
                    <video
                      src={story.mediaUrl}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <img
                      src={story.mediaUrl}
                      alt="Story"
                      className="h-full w-full object-cover"
                    />
                  )
                ) : (
                  <div
                    className={cn(
                      "flex h-full w-full items-center justify-center p-4",
                      getBackgroundClass(story.id)
                    )}
                  >
                    <p className="text-center text-lg font-bold text-white drop-shadow-lg">
                      {story.content}
                    </p>
                  </div>
                )}

                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

                <div className="absolute left-3 top-3 flex items-center gap-2">
                  <div className="rounded-full bg-black/40 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                    <Clock className="mr-1 inline h-3 w-3" />
                    {formatTimeLeft(story.timeLeft)}
                  </div>
                  {isOwn && (
                    <div className="rounded-full bg-purple-500/80 px-2 py-1 text-xs font-medium text-white backdrop-blur-sm">
                      Your Story
                    </div>
                  )}
                </div>

                <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white">
                  <span className="text-sm font-medium">
                    {isOwn ? "You" : "Anonymous"}
                  </span>
                  <div className="flex items-center gap-3 text-sm">
                    <span className="flex items-center gap-1">
                      <Eye className="h-4 w-4" />
                      {story.viewCount}
                    </span>
                    {story.reactionCount > 0 && (
                      <span>❤️ {story.reactionCount}</span>
                    )}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 transition group-hover:opacity-100">
                  <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm">
                    View Story
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {viewerOpen && allStories.length > 0 && (
        <StoryViewer
          stories={allStories}
          initialIndex={viewerIndex}
          currentSessionId={currentSessionId}
          onClose={() => {
            setViewerOpen(false);
            loadStories();
          }}
        />
      )}
    </div>
  );
}
