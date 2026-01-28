"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UserPlus } from "lucide-react";
import { ShareButton } from "@/components/share-button";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { TelegramReactions } from "@/components/reactions/telegram-reactions";
import { CommentThread } from "@/components/comments/comment-thread";
import {
  getConfessionById,
  toggleConfessionReaction,
  getConfessionReactions,
} from "@/actions/confessions";

import { formatRelativeTime } from "@/lib/utils";

interface ConfessionData {
  id: string;
  content: string;
  confessionNumber: number | null;
  shareCode: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  _count: { reactions: number };
}

export default function ConfessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [confession, setConfession] = useState<ConfessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<Array<{ emoji: string; count: number }>>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  useEffect(() => {
    loadConfession();
    loadReactions();
  }, [id]);

  async function loadConfession() {
    const result = await getConfessionById(id);
    if (result.success && result.data) {
      setConfession(result.data);
    }
    setIsLoading(false);
  }

  async function loadReactions() {
    const result = await getConfessionReactions(id);
    if (result.success && result.data) {
      setReactions(result.data.reactions);
      setUserReactions(result.data.userReactions);
    }
  }

  async function handleReaction(emoji: string) {
    const result = await toggleConfessionReaction(id, emoji);
    if (result.success) {
      loadReactions();
    }
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse">
          <div className="mb-6 h-6 w-32 rounded bg-gray-200" />
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 space-y-2">
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-full rounded bg-gray-200" />
                <div className="h-4 w-2/3 rounded bg-gray-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!confession) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link href="/confessions" className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" />
          Back to confessions
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">Confession not found</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link href="/confessions" className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="h-4 w-4" />
        Back to confessions
      </Link>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-indigo-600">
                #{confession.confessionNumber}
              </span>
              <span className="text-sm text-gray-500">
                {formatRelativeTime(confession.approvedAt || confession.createdAt)}
              </span>
            </div>
            {confession.shareCode && (
              <ShareButton shareCode={confession.shareCode} variant="button" />
            )}
          </div>

          <p className="mb-6 whitespace-pre-wrap text-gray-800 text-lg leading-relaxed">
            {confession.content}
          </p>

          {/* Telegram-style Reactions */}
          <TelegramReactions
            reactions={reactions}
            userReactions={userReactions}
            onToggleReaction={handleReaction}
            size="md"
          />
        </CardContent>
      </Card>

      {/* Build Community CTA */}
      <Card className="mb-6 border-indigo-200 bg-indigo-50">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <UserPlus className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">Like this confession?</p>
              <p className="text-sm text-indigo-700">Create an account to follow confessors and get updates</p>
            </div>
            <Link href="/register">
              <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <CommentThread
        contentType="confession"
        contentId={id}
      />
    </div>
  );
}
