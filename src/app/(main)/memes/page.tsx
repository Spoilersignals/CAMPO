"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Plus, Flame, Clock, Trophy, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMemes, getMemeOfTheWeek, reactToMeme } from "@/actions/memes";
import { formatRelativeTime } from "@/lib/utils";

type SortBy = "hot" | "new" | "top";

type Meme = {
  id: string;
  title: string | null;
  imageUrl: string;
  caption: string | null;
  memeNumber: number | null;
  isFeatured: boolean;
  createdAt: Date;
  _count: { comments: number; reactions: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

const MEME_REACTIONS = ["😂", "🔥", "💀", "😭", "👑"];

export default function MemesPage() {
  const [memes, setMemes] = useState<Meme[]>([]);
  const [memeOfTheWeek, setMemeOfTheWeek] = useState<Meme | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("hot");

  useEffect(() => {
    loadMemes();
    loadMemeOfTheWeek();
  }, [sortBy]);

  async function loadMemes() {
    setIsLoading(true);
    const result = await getMemes(1, 20, sortBy);
    if (result.success && result.data) {
      setMemes(result.data.memes);
    }
    setIsLoading(false);
  }

  async function loadMemeOfTheWeek() {
    const result = await getMemeOfTheWeek();
    if (result.success && result.data?.meme) {
      setMemeOfTheWeek(result.data.meme);
    }
  }

  async function handleReaction(memeId: string, emoji: string, e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    await reactToMeme(memeId, emoji);
    loadMemes();
    if (memeOfTheWeek?.id === memeId) {
      loadMemeOfTheWeek();
    }
  }

  const topReactions = (breakdown: Array<{ emoji: string; count: number }>) => {
    return breakdown.sort((a, b) => b.count - a.count).slice(0, 4);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <span className="text-3xl">😂</span> Campus Memes
          </h1>
          <p className="text-gray-600">The dankest memes on campus</p>
        </div>
        <Link href="/memes/new">
          <Button className="gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600">
            <Plus className="h-4 w-4" />
            Post Meme
          </Button>
        </Link>
      </div>

      {memeOfTheWeek && (
        <Card className="mb-6 overflow-hidden border-2 border-yellow-400 bg-gradient-to-r from-yellow-50 to-orange-50">
          <CardContent className="p-0">
            <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2">
              <Crown className="h-5 w-5 text-white" />
              <span className="font-bold text-white">🏆 Meme of the Week</span>
            </div>
            <Link href={`/memes/${memeOfTheWeek.id}`}>
              <div className="p-4">
                <div className="flex gap-4">
                  <div className="relative h-32 w-32 flex-shrink-0 overflow-hidden rounded-lg">
                    <Image
                      src={memeOfTheWeek.imageUrl}
                      alt={memeOfTheWeek.title || "Meme of the week"}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    {memeOfTheWeek.title && (
                      <h3 className="mb-1 text-lg font-semibold text-gray-900">
                        {memeOfTheWeek.title}
                      </h3>
                    )}
                    {memeOfTheWeek.caption && (
                      <p className="mb-2 text-sm text-gray-600 line-clamp-2">
                        {memeOfTheWeek.caption}
                      </p>
                    )}
                    <div className="flex flex-wrap items-center gap-2">
                      {topReactions(memeOfTheWeek.reactionBreakdown).map((r) => (
                        <span
                          key={r.emoji}
                          className="flex items-center gap-1 rounded-full bg-white px-2 py-1 text-sm shadow-sm"
                        >
                          {r.emoji} {r.count}
                        </span>
                      ))}
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        {memeOfTheWeek._count.comments}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </CardContent>
        </Card>
      )}

      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSortBy("hot")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sortBy === "hot"
              ? "bg-orange-100 text-orange-700 scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Flame className="h-4 w-4" />
          Hot 🔥
        </button>
        <button
          onClick={() => setSortBy("new")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sortBy === "new"
              ? "bg-blue-100 text-blue-700 scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Clock className="h-4 w-4" />
          New ✨
        </button>
        <button
          onClick={() => setSortBy("top")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all ${
            sortBy === "top"
              ? "bg-purple-100 text-purple-700 scale-105"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Trophy className="h-4 w-4" />
          Top 👑
        </button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse overflow-hidden">
              <div className="aspect-square bg-gray-200" />
              <CardContent className="pt-4">
                <div className="mb-2 h-4 w-3/4 rounded bg-gray-200" />
                <div className="flex gap-2">
                  <div className="h-6 w-12 rounded bg-gray-200" />
                  <div className="h-6 w-12 rounded bg-gray-200" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : memes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-4 text-4xl">🤷</p>
            <p className="text-gray-500">No memes yet. Be the first to share!</p>
            <Link href="/memes/new">
              <Button className="mt-4">Post the first meme</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {memes.map((meme) => (
            <Link key={meme.id} href={`/memes/${meme.id}`}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:scale-[1.02]">
                <div className="relative aspect-square overflow-hidden bg-gray-100">
                  <Image
                    src={meme.imageUrl}
                    alt={meme.title || "Meme"}
                    fill
                    className="object-cover transition-transform group-hover:scale-105"
                  />
                  {meme.isFeatured && (
                    <div className="absolute left-2 top-2 rounded-full bg-yellow-400 px-2 py-1 text-xs font-bold text-yellow-900">
                      👑 Featured
                    </div>
                  )}
                </div>
                <CardContent className="pt-4">
                  <div className="mb-2 flex items-center gap-2">
                    {meme.memeNumber && (
                      <span className="font-semibold text-indigo-600">
                        #{meme.memeNumber}
                      </span>
                    )}
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(meme.createdAt)}
                    </span>
                  </div>
                  {meme.title && (
                    <h3 className="mb-1 font-medium text-gray-900 line-clamp-1">
                      {meme.title}
                    </h3>
                  )}
                  {meme.caption && (
                    <p className="mb-3 text-sm text-gray-600 line-clamp-2">
                      {meme.caption}
                    </p>
                  )}
                  <div className="flex items-center justify-between">
                    <div className="flex gap-1">
                      {MEME_REACTIONS.map((emoji) => {
                        const reaction = meme.reactionBreakdown.find(
                          (r) => r.emoji === emoji
                        );
                        return (
                          <button
                            key={emoji}
                            onClick={(e) => handleReaction(meme.id, emoji, e)}
                            className={`flex items-center gap-0.5 rounded-full px-2 py-1 text-sm transition-all hover:scale-110 active:scale-95 ${
                              reaction
                                ? "bg-indigo-100 text-indigo-700"
                                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                            }`}
                          >
                            {emoji}
                            {reaction && <span className="text-xs">{reaction.count}</span>}
                          </button>
                        );
                      })}
                    </div>
                    <span className="flex items-center gap-1 text-sm text-gray-500">
                      <MessageCircle className="h-4 w-4" />
                      {meme._count.comments}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
