"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { Heart, Sparkles, ArrowLeft, Share2, Send, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getComplimentById, reactToCompliment } from "@/actions/compliments";
import { formatRelativeTime, cn } from "@/lib/utils";

const REACTION_EMOJIS = ["❤️", "🥰", "😊", "💕", "✨"];

interface ComplimentData {
  id: string;
  recipientName: string;
  recipientHint: string | null;
  message: string;
  complimentNumber: number | null;
  createdAt: Date;
  reactionCounts: Record<string, number>;
  totalReactions: number;
  userReactions: string[];
}

export default function ComplimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [compliment, setCompliment] = useState<ComplimentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadCompliment();
  }, [id]);

  async function loadCompliment() {
    setLoading(true);
    const result = await getComplimentById(id);
    if (result.success && result.data) {
      setCompliment(result.data);
    } else {
      setError(result.error || "Failed to load compliment");
    }
    setLoading(false);
  }

  function handleReaction(emoji: string) {
    if (!compliment) return;

    startTransition(async () => {
      const result = await reactToCompliment(compliment.id, emoji);
      if (result.success && result.data) {
        setCompliment((prev) => {
          if (!prev) return prev;
          const newCounts = { ...prev.reactionCounts };
          let newUserReactions = [...prev.userReactions];
          let newTotal = prev.totalReactions;

          if (result.data!.added) {
            newCounts[emoji] = (newCounts[emoji] || 0) + 1;
            newUserReactions.push(emoji);
            newTotal++;
          } else {
            newCounts[emoji] = Math.max((newCounts[emoji] || 1) - 1, 0);
            if (newCounts[emoji] === 0) delete newCounts[emoji];
            newUserReactions = newUserReactions.filter((e) => e !== emoji);
            newTotal = Math.max(newTotal - 1, 0);
          }

          return {
            ...prev,
            reactionCounts: newCounts,
            userReactions: newUserReactions,
            totalReactions: newTotal,
          };
        });
      }
    });
  }

  async function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Secret Compliment",
          text: `Check out this sweet compliment for ${compliment?.recipientName}!`,
          url,
        });
      } catch {
        copyToClipboard(url);
      }
    } else {
      copyToClipboard(url);
    }
  }

  function copyToClipboard(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !compliment) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/compliments"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Compliments Wall
        </Link>
        <Card className="border-pink-100">
          <CardContent className="py-12 text-center">
            <Heart className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900">
              {error || "Compliment not found"}
            </h3>
            <p className="mt-1 text-gray-500">
              This compliment may not exist or hasn&apos;t been approved yet.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back Button */}
      <Link
        href="/compliments"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Compliments Wall
      </Link>

      {/* Main Card */}
      <Card className="relative overflow-hidden border-pink-200 bg-gradient-to-br from-white via-pink-50/50 to-rose-50/70 shadow-xl shadow-pink-100/50">
        {/* Decorative Background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10">
            <Heart className="h-20 w-20 text-pink-500" />
          </div>
          <div className="absolute bottom-10 right-10">
            <Heart className="h-16 w-16 text-rose-500" />
          </div>
          <div className="absolute top-1/2 right-20">
            <Sparkles className="h-12 w-12 text-yellow-500" />
          </div>
        </div>

        <CardContent className="relative pt-8 pb-6">
          {/* Header */}
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-lg shadow-pink-200">
                <Heart className="h-7 w-7 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold text-pink-700">
                  To: {compliment.recipientName}
                </p>
                {compliment.recipientHint && (
                  <p className="text-sm text-rose-400 italic">
                    &quot;{compliment.recipientHint}&quot;
                  </p>
                )}
              </div>
            </div>
            {compliment.complimentNumber && (
              <span className="rounded-full bg-pink-100 px-3 py-1 text-sm font-medium text-pink-600">
                #{compliment.complimentNumber}
              </span>
            )}
          </div>

          {/* Message */}
          <div className="mb-6 rounded-xl bg-white/80 p-6 shadow-inner backdrop-blur-sm">
            <p className="whitespace-pre-wrap text-lg text-gray-800 leading-relaxed">
              {compliment.message}
            </p>
          </div>

          {/* Timestamp */}
          <p className="mb-6 text-center text-sm text-gray-400">
            Sent with love {formatRelativeTime(compliment.createdAt)}
          </p>

          {/* Reactions */}
          <div className="mb-6">
            <p className="mb-3 text-center text-sm font-medium text-gray-500">
              Spread the love
            </p>
            <div className="flex justify-center gap-2">
              {REACTION_EMOJIS.map((emoji) => {
                const count = compliment.reactionCounts[emoji] || 0;
                const isActive = compliment.userReactions.includes(emoji);

                return (
                  <button
                    key={emoji}
                    onClick={() => handleReaction(emoji)}
                    disabled={isPending}
                    className={cn(
                      "flex items-center gap-1 rounded-full px-4 py-2 text-lg transition-all hover:scale-110",
                      isActive
                        ? "bg-gradient-to-r from-pink-100 to-rose-100 shadow-md"
                        : "bg-white shadow hover:shadow-md"
                    )}
                  >
                    <span>{emoji}</span>
                    {count > 0 && (
                      <span className="text-sm font-medium text-gray-600">
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-xs text-gray-400">
              {compliment.totalReactions} total reaction
              {compliment.totalReactions !== 1 ? "s" : ""}
            </p>
          </div>

          {/* Share Button */}
          <div className="flex justify-center gap-3">
            <Button
              variant="outline"
              onClick={handleShare}
              className="border-pink-200 text-pink-600 hover:bg-pink-50"
            >
              {copied ? (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="mr-2 h-4 w-4" />
                  Share
                </>
              )}
            </Button>
            <Link href="/compliments/new">
              <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
                <Send className="mr-2 h-4 w-4" />
                Send Your Own
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Inspired CTA */}
      <div className="mt-8 rounded-xl bg-gradient-to-r from-pink-100 via-rose-100 to-pink-100 p-6 text-center">
        <Sparkles className="mx-auto mb-3 h-8 w-8 text-yellow-500" />
        <h3 className="mb-2 font-bold text-gray-800">Feeling inspired?</h3>
        <p className="mb-4 text-gray-600">
          Spread kindness by sending your own anonymous compliment to someone
          special.
        </p>
        <Link href="/compliments/new">
          <Button className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600">
            <Heart className="mr-2 h-4 w-4" />
            Send a Compliment
          </Button>
        </Link>
      </div>
    </div>
  );
}
