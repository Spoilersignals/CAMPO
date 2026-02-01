"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Plus, BarChart3, CheckCircle2, Clock, Archive, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { getPolls, votePoll, getMyVote } from "@/actions/polls";
import { formatRelativeTime, cn } from "@/lib/utils";

const POLL_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-teal-500",
];

const POLL_COLORS_LIGHT = [
  "bg-blue-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-orange-100",
  "bg-green-100",
  "bg-teal-100",
];

interface PollOption {
  id: string;
  text: string;
  sortOrder: number;
  voteCount: number;
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

type FilterType = "active" | "ended" | "my";

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({});
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [animatingPollId, setAnimatingPollId] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("active");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadPolls();
  }, [filter]);

  async function loadPolls() {
    setLoading(true);
    const result = await getPolls(filter);
    if (result.success && result.data) {
      setPolls(result.data.polls);
      const votes: Record<string, string | null> = {};
      for (const poll of result.data.polls) {
        const voteResult = await getMyVote(poll.id);
        if (voteResult.success && voteResult.data) {
          votes[poll.id] = voteResult.data.optionId;
        }
      }
      setUserVotes(votes);
    }
    setLoading(false);
  }

  async function handleVote(pollId: string, optionId: string) {
    if (userVotes[pollId]) return;
    setVotingPollId(pollId);

    startTransition(async () => {
      const result = await votePoll(pollId, optionId);
      if (result.success) {
        setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
        setPolls((prev) =>
          prev.map((poll) => {
            if (poll.id === pollId) {
              return {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options.map((opt) =>
                  opt.id === optionId
                    ? { ...opt, voteCount: opt.voteCount + 1 }
                    : opt
                ),
              };
            }
            return poll;
          })
        );
        setAnimatingPollId(pollId);
        setTimeout(() => setAnimatingPollId(null), 1000);
      }
      setVotingPollId(null);
    });
  }

  const isPollExpired = (poll: Poll) => {
    return poll.expiresAt && new Date(poll.expiresAt) <= new Date();
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Polls</h1>
          <p className="text-gray-600">Vote anonymously and see what campus thinks!</p>
        </div>
        <Link href="/polls/new">
          <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
            <Plus className="h-4 w-4" />
            Create Poll
          </Button>
        </Link>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6 flex gap-2">
        <button
          onClick={() => setFilter("active")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            filter === "active"
              ? "bg-blue-100 text-blue-700 shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Active
        </button>
        <button
          onClick={() => setFilter("ended")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            filter === "ended"
              ? "bg-gray-700 text-white shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <Archive className="h-4 w-4" />
          Ended
        </button>
        <button
          onClick={() => setFilter("my")}
          className={cn(
            "flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-all",
            filter === "my"
              ? "bg-purple-100 text-purple-700 shadow-sm"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          )}
        >
          <User className="h-4 w-4" />
          My Polls
        </button>
      </div>

      {polls.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">
            {filter === "active" && "No active polls"}
            {filter === "ended" && "No ended polls"}
            {filter === "my" && "You haven't created any polls yet"}
          </h3>
          <p className="mt-1 text-gray-500">
            {filter === "my" ? "Create your first poll!" : "Be the first to create a poll!"}
          </p>
          {filter !== "active" && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setFilter("active")}
            >
              View Active Polls
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const hasVoted = !!userVotes[poll.id];
            const isVoting = votingPollId === poll.id;
            const isAnimating = animatingPollId === poll.id;
            const isExpired = isPollExpired(poll);
            const canVote = !hasVoted && !isExpired && poll.status === "ACTIVE";

            return (
              <Card
                key={poll.id}
                className={cn(
                  "overflow-hidden transition-all",
                  isAnimating && "ring-2 ring-blue-400 ring-offset-2"
                )}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {poll.pollNumber && (
                          <Badge variant="secondary" className="text-xs">
                            Poll #{poll.pollNumber}
                          </Badge>
                        )}
                        {poll.isOwner && (
                          <Badge variant="outline" className="text-xs">
                            Your Poll
                          </Badge>
                        )}
                        {isExpired && (
                          <Badge variant="error" className="text-xs">
                            Expired
                          </Badge>
                        )}
                      </div>
                      <CardTitle className="text-lg leading-tight">{poll.question}</CardTitle>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(poll.createdAt)}
                      </span>
                      {poll.expiresAt && !isExpired && (
                        <span className="flex items-center gap-1 text-xs text-orange-600">
                          <Clock className="h-3 w-3" />
                          Ends {formatRelativeTime(poll.expiresAt)}
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {poll.options.map((option, index) => {
                      const percentage =
                        poll.totalVotes > 0
                          ? Math.round((option.voteCount / poll.totalVotes) * 100)
                          : 0;
                      const isSelected = userVotes[poll.id] === option.id;
                      const colorClass = POLL_COLORS[index % POLL_COLORS.length];
                      const colorClassLight = POLL_COLORS_LIGHT[index % POLL_COLORS_LIGHT.length];

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(poll.id, option.id)}
                          disabled={!canVote || isVoting}
                          className={cn(
                            "relative w-full overflow-hidden rounded-xl border-2 p-4 text-left transition-all duration-300",
                            canVote
                              ? "cursor-pointer hover:border-blue-400 hover:shadow-md active:scale-[0.99]"
                              : "cursor-default",
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white"
                          )}
                        >
                          {/* Animated progress bar - only show after voting */}
                          {hasVoted && (
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 transition-all duration-700 ease-out",
                                isSelected ? colorClass : colorClassLight,
                                isSelected ? "opacity-30" : "opacity-50"
                              )}
                              style={{
                                width: isAnimating ? "0%" : `${percentage}%`,
                                animation: isAnimating
                                  ? `growWidth 700ms ease-out forwards`
                                  : undefined,
                              }}
                            />
                          )}
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              {isSelected && (
                                <CheckCircle2 className="h-5 w-5 shrink-0 text-blue-600" />
                              )}
                              <span
                                className={cn(
                                  "font-medium",
                                  isSelected ? "text-blue-900" : "text-gray-900"
                                )}
                              >
                                {option.text}
                              </span>
                            </div>
                            {hasVoted && (
                              <div className="flex items-center gap-2">
                                <span
                                  className={cn(
                                    "text-lg font-bold tabular-nums",
                                    isSelected ? "text-blue-600" : "text-gray-600"
                                  )}
                                >
                                  {percentage}%
                                </span>
                                <span className="text-sm text-gray-500">
                                  ({option.voteCount})
                                </span>
                              </div>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-3">
                    <span className="flex items-center gap-2 text-gray-600">
                      <BarChart3 className="h-4 w-4" />
                      {poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}
                    </span>
                    <Link
                      href={`/polls/${poll.id}`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      View Details →
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <style jsx>{`
        @keyframes growWidth {
          from {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}
