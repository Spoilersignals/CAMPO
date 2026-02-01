"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Mic, Play, MessageCircle, Headphones } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AudioPlayer } from "@/components/audio/audio-player";
import {
  getAudioConfessions,
  reactToAudio,
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
  _count: { comments: number; reactions: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

const REACTION_EMOJIS = ["🔥", "😢", "💔", "🤯", "😭", "💀"];

export default function AudioConfessionsPage() {
  const [audioConfessions, setAudioConfessions] = useState<AudioConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadAudioConfessions();
  }, []);

  async function loadAudioConfessions() {
    setIsLoading(true);
    const result = await getAudioConfessions();
    if (result.success && result.data) {
      setAudioConfessions(result.data.audioConfessions);
    }
    setIsLoading(false);
  }

  async function handlePlay(audioId: string) {
    await incrementPlayCount(audioId);
  }

  async function handleReaction(audioId: string, emoji: string) {
    await reactToAudio(audioId, emoji);
    loadAudioConfessions();
  }

  const topReactions = (breakdown: Array<{ emoji: string; count: number }>) => {
    return breakdown.sort((a, b) => b.count - a.count).slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="mb-8 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2">
              <Mic className="h-6 w-6 text-purple-400" />
              <h1 className="text-2xl font-bold text-white">Voice Confessions</h1>
            </div>
            <p className="text-gray-400">
              Hear anonymous confessions in their own voice
            </p>
          </div>
          <Link href="/audio/new">
            <Button className="gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700">
              <Mic className="h-4 w-4" />
              Record
            </Button>
          </Link>
        </div>

        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Card
                  key={i}
                  className="animate-pulse border-gray-800 bg-gray-900"
                >
                  <CardContent className="p-6">
                    <div className="mb-4 flex items-center gap-4">
                      <div className="h-14 w-14 rounded-full bg-gray-800" />
                      <div className="flex-1">
                        <div className="mb-2 h-8 rounded bg-gray-800" />
                        <div className="h-4 w-20 rounded bg-gray-800" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : audioConfessions.length === 0 ? (
            <Card className="border-gray-800 bg-gray-900">
              <CardContent className="py-16 text-center">
                <Mic className="mx-auto mb-4 h-12 w-12 text-gray-600" />
                <p className="mb-4 text-gray-400">
                  No voice confessions yet. Be the first to share!
                </p>
                <Link href="/audio/new">
                  <Button className="bg-gradient-to-r from-purple-600 to-indigo-600">
                    Record Your Confession
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            audioConfessions.map((audio) => (
              <Card
                key={audio.id}
                className="border-gray-800 bg-gray-900 transition-all hover:border-purple-800"
              >
                <CardContent className="p-6">
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-purple-400">
                        🎤 #{audio.audioNumber || "..."}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(audio.createdAt)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-gray-500">
                      <Headphones className="h-4 w-4" />
                      {audio.playCount}
                    </div>
                  </div>

                  <AudioPlayer
                    src={audio.audioUrl}
                    duration={audio.duration}
                    onPlay={() => handlePlay(audio.id)}
                  />

                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {REACTION_EMOJIS.map((emoji) => {
                        const reaction = audio.reactionBreakdown.find(
                          (r) => r.emoji === emoji
                        );
                        return (
                          <button
                            key={emoji}
                            onClick={() => handleReaction(audio.id, emoji)}
                            className={`rounded-full px-2 py-1 text-sm transition-all hover:bg-gray-800 ${
                              reaction ? "bg-gray-800" : ""
                            }`}
                          >
                            {emoji}
                            {reaction && (
                              <span className="ml-1 text-xs text-gray-400">
                                {reaction.count}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <Link
                      href={`/audio/${audio.id}`}
                      className="flex items-center gap-1 text-sm text-gray-400 transition-colors hover:text-purple-400"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {audio._count.comments}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
