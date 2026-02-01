"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Mic, Headphones, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { AudioPlayer } from "@/components/audio/audio-player";
import {
  getAudioConfessionById,
  reactToAudio,
  commentOnAudio,
  incrementPlayCount,
} from "@/actions/audio-confessions";
import { formatRelativeTime } from "@/lib/utils";

type AudioConfession = {
  id: string;
  audioUrl: string;
  duration: number;
  audioNumber: number | null;
  playCount: number;
  createdAt: Date;
  comments: Array<{
    id: string;
    content: string;
    createdAt: Date;
  }>;
  reactions: Array<{ emoji: string; count: number }>;
  userReactions: string[];
};

const REACTION_EMOJIS = ["🔥", "😢", "💔", "🤯", "😭", "💀", "❤️", "🙏"];

export default function AudioConfessionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [audio, setAudio] = useState<AudioConfession | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userReactions, setUserReactions] = useState<string[]>([]);

  useEffect(() => {
    loadAudioConfession();
  }, [id]);

  async function loadAudioConfession() {
    setIsLoading(true);
    const result = await getAudioConfessionById(id);
    if (result.success && result.data) {
      setAudio(result.data);
      setUserReactions(result.data.userReactions);
    }
    setIsLoading(false);
  }

  async function handlePlay() {
    await incrementPlayCount(id);
  }

  async function handleReaction(emoji: string) {
    const result = await reactToAudio(id, emoji);
    if (result.success) {
      if (result.data?.added) {
        setUserReactions((prev) => [...prev, emoji]);
      } else {
        setUserReactions((prev) => prev.filter((e) => e !== emoji));
      }
      loadAudioConfession();
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;

    setIsSubmitting(true);
    const result = await commentOnAudio(id, comment);
    if (result.success) {
      setComment("");
      loadAudioConfession();
    }
    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <div className="animate-pulse">
            <div className="mb-8 h-6 w-32 rounded bg-gray-800" />
            <div className="mb-4 rounded-2xl bg-gray-900 p-8">
              <div className="mb-4 flex items-center gap-4">
                <div className="h-20 w-20 rounded-full bg-gray-800" />
                <div className="flex-1">
                  <div className="mb-2 h-10 rounded bg-gray-800" />
                  <div className="h-4 w-24 rounded bg-gray-800" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!audio) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="mx-auto max-w-2xl px-4 py-8">
          <Link
            href="/audio"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to confessions
          </Link>
          <Card className="border-gray-800 bg-gray-900">
            <CardContent className="py-16 text-center">
              <Mic className="mx-auto mb-4 h-12 w-12 text-gray-600" />
              <p className="text-gray-400">Audio confession not found</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/audio"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to confessions
        </Link>

        <div className="mb-6 rounded-2xl border border-gray-800 bg-gray-900/80 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Mic className="h-5 w-5 text-purple-400" />
              <span className="font-bold text-purple-400">
                Voice Confession #{audio.audioNumber || "..."}
              </span>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Headphones className="h-4 w-4" />
                {audio.playCount} plays
              </span>
              <span>{formatRelativeTime(audio.createdAt)}</span>
            </div>
          </div>

          <AudioPlayer
            src={audio.audioUrl}
            duration={audio.duration}
            onPlay={handlePlay}
            size="lg"
            showWaveform
          />
        </div>

        <div className="mb-6">
          <h3 className="mb-3 text-sm font-medium text-gray-400">Reactions</h3>
          <div className="flex flex-wrap gap-2">
            {REACTION_EMOJIS.map((emoji) => {
              const reaction = audio.reactions.find((r) => r.emoji === emoji);
              const isSelected = userReactions.includes(emoji);
              return (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className={`flex items-center gap-1 rounded-full px-4 py-2 text-lg transition-all ${
                    isSelected
                      ? "bg-purple-600/30 ring-2 ring-purple-500"
                      : "bg-gray-800 hover:bg-gray-700"
                  }`}
                >
                  {emoji}
                  {reaction && (
                    <span className="ml-1 text-sm text-gray-400">
                      {reaction.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <h3 className="mb-4 text-sm font-medium text-gray-400">
            Comments ({audio.comments.length})
          </h3>

          <form onSubmit={handleSubmitComment} className="mb-6">
            <div className="flex gap-2">
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Share your thoughts anonymously..."
                className="min-h-[80px] flex-1 border-gray-700 bg-gray-800 text-white placeholder:text-gray-500"
                maxLength={500}
              />
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span className="text-sm text-gray-500">{comment.length}/500</span>
              <Button
                type="submit"
                disabled={isSubmitting || !comment.trim()}
                className="bg-gradient-to-r from-purple-600 to-indigo-600"
              >
                <Send className="mr-2 h-4 w-4" />
                {isSubmitting ? "Posting..." : "Post Comment"}
              </Button>
            </div>
          </form>

          <div className="space-y-3">
            {audio.comments.length === 0 ? (
              <p className="py-8 text-center text-gray-500">
                No comments yet. Be the first to share your thoughts!
              </p>
            ) : (
              audio.comments.map((c) => (
                <div
                  key={c.id}
                  className="rounded-xl border border-gray-800 bg-gray-900/50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-400">
                      Anonymous
                    </span>
                    <span className="text-xs text-gray-600">
                      {formatRelativeTime(c.createdAt)}
                    </span>
                  </div>
                  <p className="text-gray-300">{c.content}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
