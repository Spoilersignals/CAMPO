"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Heart, MessageCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getMatches } from "@/actions/dating";
import { formatDistanceToNow } from "date-fns";

type Match = {
  matchId: string;
  matchedAt: Date;
  lastMessage: { content: string; createdAt: Date; senderId: string } | null;
  profile: {
    id: string;
    displayName: string;
    photos: { url: string }[];
  };
};

export default function MatchesPage() {
  const router = useRouter();
  const [matches, setMatches] = useState<Match[]>([]);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadMatches();
  }, []);

  async function loadMatches() {
    setIsLoading(true);
    const result = await getMatches();
    if (result.success && result.data) {
      setMatches(result.data);
      setMyProfileId(result.myProfileId || null);
    }
    setIsLoading(false);
  }

  const newMatches = matches.filter(m => !m.lastMessage);
  const conversations = matches.filter(m => m.lastMessage);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dating")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold text-gray-900">Matches</h1>
      </div>

      {matches.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No matches yet</h2>
          <p className="mb-6 text-gray-500">Keep swiping to find your perfect match!</p>
          <Button
            onClick={() => router.push("/dating")}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
          >
            Start Swiping
          </Button>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* New Matches */}
          {newMatches.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-500">New Matches</h2>
              <div className="flex gap-3 overflow-x-auto pb-2">
                {newMatches.map((match) => (
                  <Link
                    key={match.matchId}
                    href={`/dating/chat/${match.matchId}`}
                    className="flex-shrink-0"
                  >
                    <div className="relative">
                      <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-pink-500 p-0.5">
                        <div className="h-full w-full overflow-hidden rounded-full bg-gray-100">
                          {match.profile.photos[0] ? (
                            <Image
                              src={match.profile.photos[0].url}
                              alt={match.profile.displayName}
                              width={80}
                              height={80}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center">
                              <Heart className="h-6 w-6 text-gray-300" />
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="absolute -bottom-1 -right-1 rounded-full bg-pink-500 p-1">
                        <Sparkles className="h-3 w-3 text-white" />
                      </div>
                    </div>
                    <p className="mt-1 text-center text-xs font-medium text-gray-700">
                      {match.profile.displayName}
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Conversations */}
          {conversations.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold text-gray-500">Messages</h2>
              <div className="space-y-2">
                {conversations.map((match) => (
                  <Link
                    key={match.matchId}
                    href={`/dating/chat/${match.matchId}`}
                    className="flex items-center gap-3 rounded-xl bg-white p-3 shadow-sm transition-colors hover:bg-gray-50"
                  >
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-gray-100">
                      {match.profile.photos[0] ? (
                        <Image
                          src={match.profile.photos[0].url}
                          alt={match.profile.displayName}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center">
                          <Heart className="h-6 w-6 text-gray-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-900">{match.profile.displayName}</p>
                        {match.lastMessage && (
                          <span className="text-xs text-gray-400">
                            {formatDistanceToNow(new Date(match.lastMessage.createdAt), { addSuffix: false })}
                          </span>
                        )}
                      </div>
                      {match.lastMessage && (
                        <p className="truncate text-sm text-gray-500">
                          {match.lastMessage.senderId === myProfileId ? "You: " : ""}
                          {match.lastMessage.content}
                        </p>
                      )}
                    </div>
                    <MessageCircle className="h-5 w-5 flex-shrink-0 text-gray-400" />
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
