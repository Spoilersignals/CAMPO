"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TelegramReactions } from "@/components/reactions/telegram-reactions";
import { CommentThread, Comment } from "@/components/comments/comment-thread";
import {
  getSpottedById,
  addSpottedComment,
  toggleSpottedReaction,
  getSpottedReactionsWithUser,
} from "@/actions/spotted";
import { formatRelativeTime } from "@/lib/utils";

type SpottedDetail = {
  id: string;
  content: string;
  location: string;
  spottedAt: Date | null;
  spottedNumber: number | null;
  status: string;
  createdAt: Date;
  comments: Array<{
    id: string;
    content: string;
    authorName: string | null;
    createdAt: Date;
  }>;
};

export default function SpottedDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [spotted, setSpotted] = useState<SpottedDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);

  const [reactions, setReactions] = useState<Array<{ emoji: string; count: number }>>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  const loadSpotted = useCallback(async () => {
    const result = await getSpottedById(id);
    if (result.success && result.data) {
      setSpotted(result.data);
      setComments(
        result.data.comments.map((c) => ({
          id: c.id,
          authorName: c.authorName || undefined,
          content: c.content,
          createdAt: c.createdAt,
          reactions: [],
          userReactions: [],
        }))
      );
    } else {
      setError(result.error || "Failed to load");
    }
    setLoading(false);
  }, [id]);

  const loadReactions = useCallback(async () => {
    const result = await getSpottedReactionsWithUser(id);
    if (result.success && result.data) {
      setReactions(result.data.reactions);
      setUserReactions(result.data.userReactions);
    }
  }, [id]);

  useEffect(() => {
    loadSpotted();
    loadReactions();
  }, [loadSpotted, loadReactions]);

  async function handleReaction(emoji: string) {
    if (!spotted) return;
    const result = await toggleSpottedReaction(spotted.id, emoji);
    if (result.success) {
      await loadReactions();
    }
  }

  async function handleAddComment(content: string, authorName?: string) {
    if (!spotted) return;
    const result = await addSpottedComment(spotted.id, content, authorName);
    if (result.success) {
      await loadSpotted();
    }
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6 p-4">
        <div className="animate-pulse">
          <div className="mb-4 h-8 w-32 rounded bg-gray-200" />
          <Card>
            <CardContent className="space-y-4 p-6">
              <div className="h-6 w-24 rounded bg-gray-200" />
              <div className="h-24 rounded bg-gray-200" />
              <div className="h-4 w-48 rounded bg-gray-200" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error || !spotted) {
    return (
      <div className="mx-auto max-w-2xl p-4">
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">{error || "Spotted not found"}</p>
            <Link href="/spotted">
              <Button variant="outline" className="mt-4">
                Back to Spotted
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <Link
        href="/spotted"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to Spotted
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              #{spotted.spottedNumber ?? "?"}
            </span>
          </div>

          <p className="whitespace-pre-wrap text-lg text-gray-800">
            {spotted.content}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              {spotted.location}
            </span>
            <span className="flex items-center gap-1">
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {spotted.spottedAt ? formatRelativeTime(spotted.spottedAt) : "Unknown time"}
            </span>
          </div>

          <div className="mt-6 border-t pt-4">
            <TelegramReactions
              reactions={reactions}
              userReactions={userReactions}
              onToggleReaction={handleReaction}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      <div className="space-y-4">
        <CommentThread
          contentType="spotted"
          contentId={id}
          initialComments={comments}
          onAddComment={handleAddComment}
        />
      </div>
    </div>
  );
}
