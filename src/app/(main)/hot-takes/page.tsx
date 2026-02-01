"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Flame, MessageCircle, ThumbsUp, ThumbsDown, Plus, TrendingUp, Clock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { getHotTakes, voteHotTake, type SortOption } from "@/actions/hot-takes";
import { formatRelativeTime, cn } from "@/lib/utils";

interface HotTake {
  id: string;
  content: string;
  takeNumber: number | null;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  agreePercentage: number;
  isControversial: boolean;
  commentCount: number;
  createdAt: Date;
  userVote: string | null;
}

export default function HotTakesPage() {
  const [hotTakes, setHotTakes] = useState<HotTake[]>([]);
  const [loading, setLoading] = useState(true);
  const [sort, setSort] = useState<SortOption>("hot");
  const [votingId, setVotingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [animatingVote, setAnimatingVote] = useState<{ id: string; type: "AGREE" | "DISAGREE" } | null>(null);

  useEffect(() => {
    loadHotTakes();
  }, [sort]);

  async function loadHotTakes() {
    setLoading(true);
    const result = await getHotTakes(1, 20, sort);
    if (result.success && result.data) {
      setHotTakes(result.data.hotTakes);
    }
    setLoading(false);
  }

  async function handleVote(hotTakeId: string, voteType: "AGREE" | "DISAGREE") {
    const take = hotTakes.find((t) => t.id === hotTakeId);
    if (!take || take.userVote) return;

    setVotingId(hotTakeId);
    setAnimatingVote({ id: hotTakeId, type: voteType });

    startTransition(async () => {
      const result = await voteHotTake(hotTakeId, voteType);
      if (result.success && result.data) {
        setHotTakes((prev) =>
          prev.map((t) => {
            if (t.id === hotTakeId) {
              const newTotal = result.data!.newAgreeCount + result.data!.newDisagreeCount;
              const newPercentage = newTotal > 0 ? Math.round((result.data!.newAgreeCount / newTotal) * 100) : 50;
              return {
                ...t,
                agreeCount: result.data!.newAgreeCount,
                disagreeCount: result.data!.newDisagreeCount,
                totalVotes: newTotal,
                agreePercentage: newPercentage,
                userVote: voteType,
                isControversial: newTotal >= 10 && newPercentage >= 40 && newPercentage <= 60,
              };
            }
            return t;
          })
        );
      }
      setTimeout(() => {
        setVotingId(null);
        setAnimatingVote(null);
      }, 300);
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
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
            <Flame className="h-7 w-7 text-orange-500" />
            Hot Takes
          </h1>
          <p className="text-gray-600">Share your unpopular opinions. No judgments.</p>
        </div>
        <Link href="/hot-takes/new">
          <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
            <Plus className="mr-2 h-4 w-4" />
            Drop Your Hot Take
          </Button>
        </Link>
      </div>

      {/* Sort Tabs */}
      <div className="mb-6 flex gap-2 rounded-lg border border-gray-200 bg-gray-50 p-1">
        <button
          onClick={() => setSort("controversial")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
            sort === "controversial"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Zap className="h-4 w-4" />
          Controversial
        </button>
        <button
          onClick={() => setSort("hot")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
            sort === "hot"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <TrendingUp className="h-4 w-4" />
          Hot
        </button>
        <button
          onClick={() => setSort("new")}
          className={cn(
            "flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-all",
            sort === "new"
              ? "bg-white text-orange-600 shadow-sm"
              : "text-gray-600 hover:text-gray-900"
          )}
        >
          <Clock className="h-4 w-4" />
          New
        </button>
      </div>

      {hotTakes.length === 0 ? (
        <Card className="p-8 text-center">
          <Flame className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No hot takes yet</h3>
          <p className="mt-1 text-gray-500">Be the first to drop a spicy opinion!</p>
          <Link href="/hot-takes/new">
            <Button className="mt-4 bg-gradient-to-r from-orange-500 to-red-500">
              Drop Your Hot Take
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-4">
          {hotTakes.map((take) => {
            const hasVoted = !!take.userVote;
            const isVoting = votingId === take.id;
            const isAnimating = animatingVote?.id === take.id;

            return (
              <Card
                key={take.id}
                className={cn(
                  "overflow-hidden transition-all",
                  isAnimating && animatingVote?.type === "AGREE" && "ring-2 ring-green-400",
                  isAnimating && animatingVote?.type === "DISAGREE" && "ring-2 ring-red-400"
                )}
              >
                <CardContent className="p-4">
                  {/* Header */}
                  <div className="mb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {take.takeNumber && (
                        <span className="text-sm font-medium text-orange-600">
                          🔥 Take #{take.takeNumber}
                        </span>
                      )}
                      {take.isControversial && (
                        <span className="rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-0.5 text-xs font-bold text-white">
                          🔥 HOT TAKE
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(take.createdAt)}
                    </span>
                  </div>

                  {/* Content */}
                  <Link href={`/hot-takes/${take.id}`}>
                    <p className="mb-4 text-lg font-semibold text-gray-900 hover:text-orange-600">
                      {take.content}
                    </p>
                  </Link>

                  {/* Vote Bar (always visible) */}
                  <div className="mb-4">
                    <div className="relative h-3 overflow-hidden rounded-full bg-gray-200">
                      <div
                        className={cn(
                          "absolute left-0 top-0 h-full transition-all duration-500",
                          hasVoted ? "bg-gradient-to-r from-green-400 to-green-500" : "bg-green-300"
                        )}
                        style={{ width: `${take.agreePercentage}%` }}
                      />
                      <div
                        className={cn(
                          "absolute right-0 top-0 h-full transition-all duration-500",
                          hasVoted ? "bg-gradient-to-l from-red-400 to-red-500" : "bg-red-300"
                        )}
                        style={{ width: `${100 - take.agreePercentage}%` }}
                      />
                    </div>
                    {hasVoted && (
                      <div className="mt-1 flex justify-between text-xs font-medium">
                        <span className="text-green-600">{take.agreePercentage}% Agree</span>
                        <span className="text-red-600">{100 - take.agreePercentage}% Disagree</span>
                      </div>
                    )}
                  </div>

                  {/* Vote Buttons */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleVote(take.id, "AGREE")}
                      disabled={hasVoted || isVoting}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all",
                        hasVoted && take.userVote === "AGREE"
                          ? "bg-green-500 text-white"
                          : hasVoted
                            ? "cursor-default bg-gray-100 text-gray-400"
                            : "bg-green-100 text-green-700 hover:bg-green-500 hover:text-white hover:scale-105 active:scale-95"
                      )}
                    >
                      <ThumbsUp className={cn("h-5 w-5", isAnimating && animatingVote?.type === "AGREE" && "animate-bounce")} />
                      AGREE
                      {hasVoted && <span className="text-sm">({take.agreeCount})</span>}
                    </button>
                    <button
                      onClick={() => handleVote(take.id, "DISAGREE")}
                      disabled={hasVoted || isVoting}
                      className={cn(
                        "flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-base font-bold transition-all",
                        hasVoted && take.userVote === "DISAGREE"
                          ? "bg-red-500 text-white"
                          : hasVoted
                            ? "cursor-default bg-gray-100 text-gray-400"
                            : "bg-red-100 text-red-700 hover:bg-red-500 hover:text-white hover:scale-105 active:scale-95"
                      )}
                    >
                      <ThumbsDown className={cn("h-5 w-5", isAnimating && animatingVote?.type === "DISAGREE" && "animate-bounce")} />
                      DISAGREE
                      {hasVoted && <span className="text-sm">({take.disagreeCount})</span>}
                    </button>
                  </div>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="text-sm text-gray-500">
                      {take.totalVotes} vote{take.totalVotes !== 1 ? "s" : ""}
                    </span>
                    <Link
                      href={`/hot-takes/${take.id}`}
                      className="flex items-center gap-1 text-sm text-orange-600 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {take.commentCount} comment{take.commentCount !== 1 ? "s" : ""}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
