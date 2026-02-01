"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Share2, Check, MessageCircle, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getMemeById, getMemeReactions, reactToMeme, commentOnMeme } from "@/actions/memes";
import { formatRelativeTime } from "@/lib/utils";

const MEME_REACTIONS = ["😂", "🔥", "💀", "😭", "👑"];

interface MemeData {
  id: string;
  title: string | null;
  imageUrl: string;
  caption: string | null;
  memeNumber: number | null;
  isFeatured: boolean;
  createdAt: Date;
  _count: { comments: number; reactions: number };
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
  }>;
}

export default function MemePage() {
  const params = useParams();
  const id = params.id as string;
  const [meme, setMeme] = useState<MemeData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<Array<{ emoji: string; count: number }>>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [comment, setComment] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  useEffect(() => {
    loadMeme();
    loadReactions();
  }, [id]);

  async function loadMeme() {
    const result = await getMemeById(id);
    if (result.success && result.data?.meme) {
      setMeme(result.data.meme);
    }
    setIsLoading(false);
  }

  async function loadReactions() {
    const result = await getMemeReactions(id);
    if (result.success && result.data) {
      setReactions(result.data.reactions);
      setUserReactions(result.data.userReactions);
    }
  }

  async function handleReaction(emoji: string) {
    const result = await reactToMeme(id, emoji);
    if (result.success) {
      loadReactions();
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmittingComment(true);
    const result = await commentOnMeme(id, comment);
    if (result.success) {
      setComment("");
      loadMeme();
    }
    setIsSubmittingComment(false);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: meme?.title || `Meme #${meme?.memeNumber}`,
        text: meme?.caption || "Check out this meme!",
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-32 rounded bg-gray-200" />
          <Card className="overflow-hidden">
            <div className="aspect-square bg-gray-200" />
            <CardContent className="pt-6">
              <div className="mb-4 space-y-2">
                <div className="h-4 w-3/4 rounded bg-gray-200" />
                <div className="h-4 w-1/2 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!meme) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/memes"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to memes
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="mb-2 text-4xl">🤷</p>
            <p className="text-gray-500">Meme not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/memes"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to memes
      </Link>

      <Card className="mb-6 overflow-hidden border-0 shadow-lg">
        {meme.isFeatured && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-400 to-orange-400 px-4 py-2">
            <Crown className="h-5 w-5 text-white" />
            <span className="font-bold text-white">🏆 Meme of the Week</span>
          </div>
        )}
        <div className="relative aspect-square w-full bg-gray-100">
          <Image
            src={meme.imageUrl}
            alt={meme.title || "Meme"}
            fill
            className="object-contain"
            priority
          />
        </div>
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {meme.memeNumber && (
                <span className="text-lg font-semibold text-indigo-600">
                  #{meme.memeNumber}
                </span>
              )}
              <span className="text-sm text-gray-500">
                {formatRelativeTime(meme.createdAt)}
              </span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleShare}
              className={`gap-1.5 transition-all ${
                copied ? "text-green-600" : "text-gray-500 hover:text-blue-600"
              }`}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share
                </>
              )}
            </Button>
          </div>

          {meme.title && (
            <h1 className="mb-2 text-xl font-bold text-gray-900">{meme.title}</h1>
          )}

          {meme.caption && (
            <p className="mb-6 whitespace-pre-wrap text-gray-700">{meme.caption}</p>
          )}

          <div className="flex flex-wrap gap-2">
            {MEME_REACTIONS.map((emoji) => {
              const reaction = reactions.find((r) => r.emoji === emoji);
              const isUserReaction = userReactions.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-lg transition-all hover:scale-110 active:scale-95 ${
                    isUserReaction
                      ? "bg-indigo-100 text-indigo-700 ring-2 ring-indigo-300"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <span className={isUserReaction ? "animate-bounce" : ""}>
                    {emoji}
                  </span>
                  {reaction && (
                    <span className="text-sm font-medium">{reaction.count}</span>
                  )}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MessageCircle className="h-5 w-5" />
            Comments ({meme._count.comments})
          </h2>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Drop a comment... 💬"
              maxLength={500}
              className="mb-2 min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">{comment.length}/500</span>
              <Button
                type="submit"
                size="sm"
                disabled={!comment.trim() || isSubmittingComment}
              >
                {isSubmittingComment ? "Posting..." : "Comment"}
              </Button>
            </div>
          </form>

          {meme.comments.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-1 text-2xl">💬</p>
              <p className="text-gray-500">No comments yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {meme.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-lg bg-gray-50 p-4 transition-colors hover:bg-gray-100"
                >
                  <div className="mb-1 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 text-xs font-medium text-white">
                      A
                    </div>
                    <span className="text-sm font-medium text-gray-700">Anonymous</span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-800">{c.content}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
