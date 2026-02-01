"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Heart, Search, Sparkles, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  getCompliments,
  searchCompliments,
  reactToCompliment,
  getUserReactions,
} from "@/actions/compliments";
import { formatRelativeTime, cn } from "@/lib/utils";

const REACTION_EMOJIS = ["❤️", "🥰", "😊", "💕", "✨"];

interface Compliment {
  id: string;
  recipientName: string;
  recipientHint: string | null;
  message: string;
  complimentNumber: number | null;
  createdAt: Date;
  reactionCounts: Record<string, number>;
  totalReactions: number;
}

export default function ComplimentsPage() {
  const [compliments, setCompliments] = useState<Compliment[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [userReactions, setUserReactions] = useState<Record<string, string[]>>(
    {}
  );
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadCompliments();
  }, []);

  async function loadCompliments() {
    setLoading(true);
    const result = await getCompliments();
    if (result.success && result.data) {
      setCompliments(result.data.compliments);
      const reactions: Record<string, string[]> = {};
      for (const c of result.data.compliments) {
        const r = await getUserReactions(c.id);
        if (r.success && r.data) {
          reactions[c.id] = r.data.reactions;
        }
      }
      setUserReactions(reactions);
    }
    setLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!searchQuery.trim()) {
      loadCompliments();
      return;
    }

    setIsSearching(true);
    const result = await searchCompliments(searchQuery);
    if (result.success && result.data) {
      setCompliments(result.data.compliments);
      const reactions: Record<string, string[]> = {};
      for (const c of result.data.compliments) {
        const r = await getUserReactions(c.id);
        if (r.success && r.data) {
          reactions[c.id] = r.data.reactions;
        }
      }
      setUserReactions(reactions);
    }
    setIsSearching(false);
  }

  function handleReaction(complimentId: string, emoji: string) {
    startTransition(async () => {
      const result = await reactToCompliment(complimentId, emoji);
      if (result.success && result.data) {
        setUserReactions((prev) => {
          const current = prev[complimentId] || [];
          if (result.data!.added) {
            return { ...prev, [complimentId]: [...current, emoji] };
          } else {
            return {
              ...prev,
              [complimentId]: current.filter((e) => e !== emoji),
            };
          }
        });

        setCompliments((prev) =>
          prev.map((c) => {
            if (c.id === complimentId) {
              const newCounts = { ...c.reactionCounts };
              if (result.data!.added) {
                newCounts[emoji] = (newCounts[emoji] || 0) + 1;
                return {
                  ...c,
                  reactionCounts: newCounts,
                  totalReactions: c.totalReactions + 1,
                };
              } else {
                newCounts[emoji] = Math.max((newCounts[emoji] || 1) - 1, 0);
                if (newCounts[emoji] === 0) delete newCounts[emoji];
                return {
                  ...c,
                  reactionCounts: newCounts,
                  totalReactions: Math.max(c.totalReactions - 1, 0),
                };
              }
            }
            return c;
          })
        );
      }
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-pink-100 to-rose-100 px-4 py-2">
          <Sparkles className="h-5 w-5 text-pink-500" />
          <span className="font-medium text-pink-700">
            Spread Love Anonymously
          </span>
          <Sparkles className="h-5 w-5 text-pink-500" />
        </div>
        <h1 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Secret Compliments Wall
        </h1>
        <p className="text-gray-600">
          Send anonymous compliments to brighten someone&apos;s day
        </p>
      </div>

      {/* Search & CTA */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row">
        <form onSubmit={handleSearch} className="flex flex-1 gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Search for someone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            type="submit"
            variant="outline"
            disabled={isSearching}
            className="border-pink-200 text-pink-600 hover:bg-pink-50"
          >
            {isSearching ? <Spinner size="sm" /> : "Search"}
          </Button>
        </form>
        <Link href="/compliments/new">
          <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 sm:w-auto">
            <Send className="mr-2 h-4 w-4" />
            Send a Compliment
          </Button>
        </Link>
      </div>

      {/* Compliments Grid */}
      {compliments.length === 0 ? (
        <Card className="border-pink-100 bg-gradient-to-br from-pink-50 to-rose-50">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-pink-300" />
            <h3 className="text-lg font-medium text-gray-900">
              {searchQuery ? "No compliments found" : "No compliments yet"}
            </h3>
            <p className="mt-1 text-gray-500">
              {searchQuery
                ? "Try a different search term"
                : "Be the first to spread some love!"}
            </p>
            {!searchQuery && (
              <Link href="/compliments/new">
                <Button className="mt-4 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                  Send First Compliment
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {compliments.map((compliment) => {
            const myReactions = userReactions[compliment.id] || [];

            return (
              <Link key={compliment.id} href={`/compliments/${compliment.id}`}>
                <Card className="group h-full cursor-pointer border-pink-100 bg-gradient-to-br from-white to-pink-50/50 transition-all hover:border-pink-200 hover:shadow-lg hover:shadow-pink-100/50">
                  <CardContent className="pt-6">
                    {/* Recipient */}
                    <div className="mb-3 flex items-center gap-2">
                      <Heart className="h-4 w-4 text-pink-500" />
                      <span className="font-semibold text-pink-700">
                        To: {compliment.recipientName}
                      </span>
                    </div>

                    {/* Hint */}
                    {compliment.recipientHint && (
                      <p className="mb-2 text-sm text-rose-400 italic">
                        &quot;{compliment.recipientHint}&quot;
                      </p>
                    )}

                    {/* Message */}
                    <p className="mb-4 text-gray-700 leading-relaxed">
                      {compliment.message.length > 150
                        ? compliment.message.slice(0, 150) + "..."
                        : compliment.message}
                    </p>

                    {/* Footer */}
                    <div className="flex items-center justify-between border-t border-pink-100 pt-3">
                      <span className="text-xs text-gray-400">
                        {compliment.complimentNumber && (
                          <span className="mr-2 text-pink-400">
                            #{compliment.complimentNumber}
                          </span>
                        )}
                        {formatRelativeTime(compliment.createdAt)}
                      </span>

                      {/* Reaction Buttons */}
                      <div
                        className="flex items-center gap-1"
                        onClick={(e) => e.preventDefault()}
                      >
                        {REACTION_EMOJIS.map((emoji) => {
                          const count = compliment.reactionCounts[emoji] || 0;
                          const isActive = myReactions.includes(emoji);

                          return (
                            <button
                              key={emoji}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleReaction(compliment.id, emoji);
                              }}
                              disabled={isPending}
                              className={cn(
                                "flex items-center gap-0.5 rounded-full px-2 py-1 text-sm transition-all",
                                isActive
                                  ? "bg-pink-100 scale-110"
                                  : "bg-gray-50 hover:bg-pink-50 opacity-60 group-hover:opacity-100"
                              )}
                            >
                              <span>{emoji}</span>
                              {count > 0 && (
                                <span className="text-xs text-gray-600">
                                  {count}
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
