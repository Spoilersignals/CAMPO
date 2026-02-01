"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  BarChart3,
  Share2,
  Clock,
  Trophy,
  Copy,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { getPollResults, votePoll, getMyVote } from "@/actions/polls";
import { formatRelativeTime, cn } from "@/lib/utils";

const POLL_COLORS = [
  { bg: "bg-blue-500", light: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-purple-500", light: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-pink-500", light: "bg-pink-100", text: "text-pink-600" },
  { bg: "bg-orange-500", light: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-green-500", light: "bg-green-100", text: "text-green-600" },
  { bg: "bg-teal-500", light: "bg-teal-100", text: "text-teal-600" },
];

interface PollOption {
  id: string;
  text: string;
  sortOrder: number;
  voteCount: number;
  percentage: number;
}

interface Poll {
  id: string;
  question: string;
  pollNumber: number | null;
  status: string;
  expiresAt: Date | null;
  createdAt: Date;
  isOwner: boolean;
  options: PollOption[];
  totalVotes: number;
}

export default function PollDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadPoll();
  }, [id]);

  async function loadPoll() {
    setLoading(true);
    const [pollResult, voteResult] = await Promise.all([
      getPollResults(id),
      getMyVote(id),
    ]);

    if (pollResult.success && pollResult.data) {
      setPoll(pollResult.data);
    }
    if (voteResult.success && voteResult.data) {
      setUserVotedOption(voteResult.data.optionId);
      if (voteResult.data.hasVoted) {
        setShowResults(true);
      }
    }
    setLoading(false);
  }

  async function handleVote(optionId: string) {
    if (userVotedOption || !poll) return;
    setIsVoting(true);

    startTransition(async () => {
      const result = await votePoll(poll.id, optionId);
      if (result.success) {
        setUserVotedOption(optionId);
        setPoll((prev) => {
          if (!prev) return prev;
          const newTotal = prev.totalVotes + 1;
          return {
            ...prev,
            totalVotes: newTotal,
            options: prev.options.map((opt) => {
              const newCount =
                opt.id === optionId ? opt.voteCount + 1 : opt.voteCount;
              return {
                ...opt,
                voteCount: newCount,
                percentage:
                  newTotal > 0 ? Math.round((newCount / newTotal) * 100) : 0,
              };
            }),
          };
        });
        setTimeout(() => setShowResults(true), 100);
      }
      setIsVoting(false);
    });
  }

  async function handleShare() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({
          title: poll?.question || "Campus Poll",
          url,
        });
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  const isPollExpired = poll?.expiresAt && new Date(poll.expiresAt) <= new Date();
  const canVote = !userVotedOption && !isPollExpired && poll?.status === "ACTIVE";
  const hasVoted = !!userVotedOption;

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/polls"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Polls
        </Link>
        <Card className="p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Poll not found</h3>
          <p className="mt-1 text-gray-500">This poll may have been removed.</p>
        </Card>
      </div>
    );
  }

  const maxVotes = Math.max(...poll.options.map((opt) => opt.voteCount), 1);
  const winningOption = poll.options.reduce((prev, curr) =>
    curr.voteCount > prev.voteCount ? curr : prev
  );

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/polls"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {poll.pollNumber && (
                  <Badge className="bg-blue-600">Poll #{poll.pollNumber}</Badge>
                )}
                {poll.isOwner && (
                  <Badge variant="outline">Your Poll</Badge>
                )}
                {isPollExpired ? (
                  <Badge variant="error">Expired</Badge>
                ) : poll.status === "ACTIVE" ? (
                  <Badge variant="success">Active</Badge>
                ) : (
                  <Badge variant="secondary">{poll.status}</Badge>
                )}
              </div>
              <CardTitle className="text-xl leading-tight sm:text-2xl">
                {poll.question}
              </CardTitle>
              <p className="mt-2 text-sm text-gray-500">
                Created {formatRelativeTime(poll.createdAt)}
              </p>
              {poll.expiresAt && !isPollExpired && (
                <p className="mt-1 flex items-center gap-1 text-sm text-orange-600">
                  <Clock className="h-3 w-3" />
                  Ends {formatRelativeTime(poll.expiresAt)}
                </p>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          {/* Voting or Results */}
          <div className="space-y-3">
            {poll.options.map((option, index) => {
              const colorSet = POLL_COLORS[index % POLL_COLORS.length];
              const isSelected = userVotedOption === option.id;
              const isWinner =
                showResults &&
                poll.totalVotes > 0 &&
                option.id === winningOption.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={!canVote || isVoting}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300",
                    canVote
                      ? "cursor-pointer hover:border-blue-400 hover:shadow-lg active:scale-[0.99]"
                      : "cursor-default",
                    isSelected
                      ? "border-blue-500 bg-blue-50 shadow-md"
                      : isWinner
                      ? "border-yellow-400 bg-yellow-50"
                      : "border-gray-200 bg-white"
                  )}
                >
                  {/* Animated progress bar */}
                  {showResults && (
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-1000 ease-out",
                        isSelected
                          ? `${colorSet.bg} opacity-25`
                          : `${colorSet.light} opacity-60`
                      )}
                      style={{
                        width: `${option.percentage}%`,
                      }}
                    />
                  )}

                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isSelected ? (
                        <CheckCircle2 className="h-6 w-6 shrink-0 text-blue-600" />
                      ) : isWinner && showResults ? (
                        <Trophy className="h-6 w-6 shrink-0 text-yellow-500" />
                      ) : (
                        <div
                          className={cn(
                            "h-6 w-6 shrink-0 rounded-full border-2 transition-colors",
                            canVote
                              ? "border-gray-300 group-hover:border-blue-400"
                              : "border-gray-200"
                          )}
                        />
                      )}
                      <span
                        className={cn(
                          "text-lg font-medium",
                          isSelected
                            ? "text-blue-900"
                            : isWinner
                            ? "text-yellow-900"
                            : "text-gray-900"
                        )}
                      >
                        {option.text}
                      </span>
                    </div>

                    {showResults && (
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}
                        </span>
                        <span
                          className={cn(
                            "min-w-[4rem] text-right text-2xl font-bold tabular-nums",
                            isSelected
                              ? colorSet.text
                              : isWinner
                              ? "text-yellow-600"
                              : "text-gray-600"
                          )}
                        >
                          {option.percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Vote prompt */}
          {!hasVoted && canVote && (
            <div className="mt-6 rounded-lg bg-blue-50 p-4 text-center">
              <p className="text-blue-800">
                👆 Tap an option to vote. Results will be revealed after you vote!
              </p>
            </div>
          )}

          {/* Stats and Share */}
          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2 text-gray-600">
              <BarChart3 className="h-5 w-5" />
              <span className="text-lg font-semibold">
                {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleShare}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
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
        </CardContent>
      </Card>

      {/* Results breakdown */}
      {showResults && poll.totalVotes > 0 && (
        <Card className="mt-6">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Results Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[...poll.options]
                .sort((a, b) => b.voteCount - a.voteCount)
                .map((option, index) => {
                  const colorSet = POLL_COLORS[poll.options.findIndex(o => o.id === option.id) % POLL_COLORS.length];
                  const isSelected = userVotedOption === option.id;

                  return (
                    <div key={option.id} className="flex items-center gap-3">
                      <span className="w-6 text-center font-bold text-gray-400">
                        {index + 1}
                      </span>
                      <div className="flex-1">
                        <div className="mb-1 flex items-center justify-between">
                          <span
                            className={cn(
                              "font-medium",
                              isSelected && "text-blue-600"
                            )}
                          >
                            {option.text}
                            {isSelected && " ✓"}
                          </span>
                          <span className="text-sm text-gray-500">
                            {option.voteCount} ({option.percentage}%)
                          </span>
                        </div>
                        <div className="h-2 overflow-hidden rounded-full bg-gray-100">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              colorSet.bg
                            )}
                            style={{
                              width: `${(option.voteCount / maxVotes) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
