"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { TelegramReactions } from "@/components/reactions/telegram-reactions";
import {
  getCrushById,
  addCrushComment,
  toggleCrushReaction,
  getCrushReactionsWithUser,
} from "@/actions/crushes";
import { formatRelativeTime, formatDate } from "@/lib/utils";

type Crush = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  seenAt: Date | null;
  crushNumber: number | null;
  createdAt: Date;
  approvedAt: Date | null;
  comments: Array<{
    id: string;
    content: string;
    authorName: string | null;
    createdAt: Date;
  }>;
};

export default function CrushDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [crush, setCrush] = useState<Crush | null>(null);
  const [loading, setLoading] = useState(true);
  const [commentContent, setCommentContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [commentError, setCommentError] = useState("");
  const [isPending, startTransition] = useTransition();
  
  const [reactions, setReactions] = useState<Array<{ emoji: string; count: number }>>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  useEffect(() => {
    loadCrush();
    loadReactions();
  }, [id]);

  async function loadCrush() {
    setLoading(true);
    const result = await getCrushById(id);
    if (result.success && result.data) {
      setCrush(result.data);
    } else {
      router.push("/crushes");
    }
    setLoading(false);
  }

  async function loadReactions() {
    const result = await getCrushReactionsWithUser(id);
    if (result.success && result.data) {
      setReactions(result.data.reactions);
      setUserReactions(result.data.userReactions);
    }
  }

  function handleCommentSubmit(e: React.FormEvent) {
    e.preventDefault();
    setCommentError("");

    startTransition(async () => {
      const result = await addCrushComment(
        id,
        commentContent,
        authorName || undefined
      );
      if (result.success) {
        setCommentContent("");
        setAuthorName("");
        loadCrush();
      } else {
        setCommentError(result.error || "Failed to add comment");
      }
    });
  }

  async function handleReaction(emoji: string) {
    const result = await toggleCrushReaction(id, emoji);
    if (result.success) {
      loadReactions();
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 w-48 bg-gray-200 rounded mb-4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!crush) {
    return null;
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/crushes"
        className="mb-6 inline-flex items-center text-sm text-pink-600 hover:text-pink-700"
      >
        ← Back to Crushes
      </Link>

      <Card className="border-pink-200">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-2">
            {crush.crushNumber && (
              <span className="text-lg font-bold text-pink-500">
                #{crush.crushNumber}
              </span>
            )}
            <h1 className="text-2xl font-bold text-gray-900">{crush.title}</h1>
          </div>

          <div className="flex flex-wrap gap-3 text-sm text-gray-500 mb-4">
            {crush.location && (
              <span className="flex items-center gap-1">📍 {crush.location}</span>
            )}
            {crush.seenAt && (
              <span className="flex items-center gap-1">
                📅 {formatDate(crush.seenAt)}
              </span>
            )}
            <span>{formatRelativeTime(crush.createdAt)}</span>
          </div>

          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
            {crush.description}
          </p>

          <div className="mt-6 pt-4 border-t">
            <TelegramReactions
              reactions={reactions}
              userReactions={userReactions}
              onToggleReaction={handleReaction}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      <div className="mt-8">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          💬 Comments ({crush.comments.length})
        </h2>

        <Card className="mb-4 border-pink-100">
          <CardContent className="p-4">
            <form onSubmit={handleCommentSubmit} className="space-y-3">
              <Textarea
                placeholder="Add a comment..."
                value={commentContent}
                onChange={(e) => setCommentContent(e.target.value)}
                required
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              <Input
                placeholder="Your name (optional, for anonymous leave blank)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              {commentError && (
                <p className="text-sm text-red-600">{commentError}</p>
              )}
              <Button
                type="submit"
                disabled={isPending}
                className="bg-pink-500 hover:bg-pink-600"
              >
                {isPending ? "Posting..." : "Post Comment"}
              </Button>
            </form>
          </CardContent>
        </Card>

        {crush.comments.length === 0 ? (
          <p className="text-center text-gray-500 py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          <div className="space-y-3">
            {crush.comments.map((comment) => (
              <Card key={comment.id} className="border-gray-100">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      {comment.authorName || "Anonymous"}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-700">{comment.content}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
