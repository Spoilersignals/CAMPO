"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  UserPlus,
  Share2,
  Repeat2,
  ExternalLink,
  Check,
} from "lucide-react";
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
  mediaUrl?: string | null;
  mediaType?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkImage?: string | null;
  _count: { reactions: number };
}

export default function ConfessionPage() {
  const params = useParams();
  const id = params.id as string;
  const [confession, setConfession] = useState<ConfessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<
    Array<{ emoji: string; count: number }>
  >([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const [reposted, setReposted] = useState(false);

  useEffect(() => {
    loadConfession();
    loadReactions();
  }, [id]);

  async function loadConfession() {
    const result = await getConfessionById(id);
    if (result.success && result.data) {
      setConfession(result.data as ConfessionData);
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

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({
        title: `Confession #${confession?.confessionNumber}`,
        text: confession?.content.slice(0, 100),
        url,
      });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  function handleRepost() {
    setReposted(true);
    setTimeout(() => setReposted(false), 2000);
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
        <Link
          href="/confessions"
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
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
      <Link
        href="/confessions"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to confessions
      </Link>

      <Card className="mb-6 overflow-hidden border-0 shadow-lg animate-fadeInUp">
        <div className="h-1 w-full gradient-purple" />
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
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRepost}
                className={`gap-1.5 transition-all ${
                  reposted
                    ? "text-green-600"
                    : "text-gray-500 hover:text-green-600"
                }`}
              >
                {reposted ? (
                  <Check className="h-4 w-4 animate-bounce-subtle" />
                ) : (
                  <Repeat2 className="h-4 w-4" />
                )}
                {reposted ? "Reposted" : "Repost"}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleShare}
                className={`gap-1.5 transition-all ${
                  copied ? "text-blue-600" : "text-gray-500 hover:text-blue-600"
                }`}
              >
                {copied ? (
                  <Check className="h-4 w-4 animate-bounce-subtle" />
                ) : (
                  <Share2 className="h-4 w-4" />
                )}
                {copied ? "Copied!" : "Share"}
              </Button>
              {confession.shareCode && (
                <ShareButton shareCode={confession.shareCode} variant="button" />
              )}
            </div>
          </div>

          <p className="mb-6 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
            {confession.content}
          </p>

          {confession.mediaUrl && confession.mediaType === "image" && (
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 animate-fadeIn">
              <Image
                src={confession.mediaUrl}
                alt="Confession media"
                width={800}
                height={600}
                className="w-full object-cover transition-transform hover:scale-105"
              />
            </div>
          )}

          {confession.mediaUrl && confession.mediaType === "video" && (
            <div className="mb-6 overflow-hidden rounded-xl border border-gray-200 animate-fadeIn">
              <video
                src={confession.mediaUrl}
                controls
                className="w-full"
              />
            </div>
          )}

          {confession.linkUrl && (
            <a
              href={confession.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mb-6 flex items-center gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-all hover:bg-gray-100 hover:shadow-md animate-fadeIn"
            >
              {confession.linkImage ? (
                <Image
                  src={confession.linkImage}
                  alt="Link preview"
                  width={120}
                  height={120}
                  className="h-20 w-20 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-lg bg-gray-200">
                  <ExternalLink className="h-8 w-8 text-gray-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="font-medium text-gray-900 truncate">
                  {confession.linkTitle || "External Link"}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {confession.linkUrl}
                </p>
              </div>
              <ExternalLink className="h-5 w-5 text-gray-400 flex-shrink-0" />
            </a>
          )}

          {/* Telegram-style Reactions */}
          <div className="animate-fadeIn">
            <TelegramReactions
              reactions={reactions}
              userReactions={userReactions}
              onToggleReaction={handleReaction}
              size="md"
            />
          </div>
        </CardContent>
      </Card>

      {/* Build Community CTA */}
      <Card className="mb-6 border-indigo-200 bg-gradient-to-r from-indigo-50 to-purple-50 animate-fadeIn">
        <CardContent className="py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
              <UserPlus className="h-5 w-5 text-indigo-600" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-indigo-900">Like this confession?</p>
              <p className="text-sm text-indigo-700">
                Create an account to follow confessors and get updates
              </p>
            </div>
            <Link href="/register">
              <Button
                size="sm"
                variant="outline"
                className="border-indigo-300 text-indigo-700 hover:bg-indigo-100 transition-all hover:scale-105"
              >
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      <div className="animate-fadeIn">
        <CommentThread contentType="confession" contentId={id} />
      </div>
    </div>
  );
}
