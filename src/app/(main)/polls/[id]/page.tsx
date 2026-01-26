"use client";

import { useState, useEffect, useTransition, use } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Send, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import {
  getPollById,
  votePoll,
  addPollComment,
  getUserVote,
} from "@/actions/polls";
import { formatRelativeTime, cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

interface Comment {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: Date;
}

interface Poll {
  id: string;
  question: string;
  pollNumber: number | null;
  status: string;
  createdAt: Date;
  endsAt: Date | null;
  options: PollOption[];
  totalVotes: number;
  comments: Comment[];
}

interface PollDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PollDetailPage({ params }: PollDetailPageProps) {
  const { id } = use(params);
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(true);
  const [userVotedOption, setUserVotedOption] = useState<string | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const [isPending, startTransition] = useTransition();

  const [commentContent, setCommentContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  useEffect(() => {
    loadPoll();
  }, [id]);

  async function loadPoll() {
    setLoading(true);
    const [pollResult, voteResult] = await Promise.all([
      getPollById(id),
      getUserVote(id),
    ]);

    if (pollResult.success && pollResult.data) {
      setPoll(pollResult.data);
    }
    if (voteResult.success && voteResult.data) {
      setUserVotedOption(voteResult.data.optionId);
    }
    setLoading(false);
  }

  async function handleVote(optionId: string) {
    if (userVotedOption || !poll) return;
    setIsVoting(true);

    startTransition(async () => {
      const result = await votePoll(optionId);
      if (result.success) {
        setUserVotedOption(optionId);
        setPoll((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            totalVotes: prev.totalVotes + 1,
            options: prev.options.map((opt) =>
              opt.id === optionId
                ? { ...opt, voteCount: opt.voteCount + 1 }
                : opt
            ),
          };
        });
      }
      setIsVoting(false);
    });
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!poll || !commentContent.trim()) {
      setCommentError("Please enter a comment");
      return;
    }

    setIsSubmittingComment(true);
    setCommentError("");

    const result = await addPollComment(
      poll.id,
      commentContent.trim(),
      authorName.trim() || undefined
    );

    setIsSubmittingComment(false);

    if (result.success) {
      const newComment: Comment = {
        id: result.data?.commentId || Date.now().toString(),
        content: commentContent.trim(),
        authorName: authorName.trim() || null,
        createdAt: new Date(),
      };
      setPoll((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          comments: [newComment, ...prev.comments],
        };
      });
      setCommentContent("");
    } else {
      setCommentError(result.error || "Failed to add comment");
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/polls"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Polls
        </Link>
        <Card className="p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900">Poll not found</h3>
          <p className="mt-1 text-gray-500">This poll may have been removed.</p>
        </Card>
      </div>
    );
  }

  const hasVoted = !!userVotedOption;
  const maxVotes = Math.max(...poll.options.map((opt) => opt.voteCount), 1);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/polls"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              {poll.pollNumber && (
                <span className="text-sm font-medium text-blue-600">
                  Poll #{poll.pollNumber}
                </span>
              )}
              <CardTitle className="text-xl">{poll.question}</CardTitle>
              <p className="mt-1 text-sm text-gray-500">
                {formatRelativeTime(poll.createdAt)}
              </p>
            </div>
            <Badge
              variant={poll.status === "ACTIVE" ? "success" : "default"}
            >
              {poll.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {poll.options.map((option) => {
              const percentage =
                poll.totalVotes > 0
                  ? Math.round((option.voteCount / poll.totalVotes) * 100)
                  : 0;
              const barWidth =
                maxVotes > 0 ? (option.voteCount / maxVotes) * 100 : 0;
              const isSelected = userVotedOption === option.id;

              return (
                <button
                  key={option.id}
                  onClick={() => handleVote(option.id)}
                  disabled={hasVoted || isVoting || poll.status !== "ACTIVE"}
                  className={cn(
                    "relative w-full overflow-hidden rounded-lg border p-4 text-left transition-all",
                    hasVoted || poll.status !== "ACTIVE"
                      ? "cursor-default"
                      : "cursor-pointer hover:border-blue-400 hover:bg-blue-50",
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 bg-white"
                  )}
                >
                  {hasVoted && (
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 transition-all duration-500",
                        isSelected ? "bg-blue-200" : "bg-gray-100"
                      )}
                      style={{ width: `${barWidth}%` }}
                    />
                  )}
                  <div className="relative flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {isSelected && (
                        <CheckCircle2 className="h-5 w-5 text-blue-600" />
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
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">
                          {option.voteCount} vote{option.voteCount !== 1 ? "s" : ""}
                        </span>
                        <span
                          className={cn(
                            "min-w-[3rem] text-right text-lg font-bold",
                            isSelected ? "text-blue-600" : "text-gray-700"
                          )}
                        >
                          {percentage}%
                        </span>
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-4">
            <span className="text-gray-600">
              {poll.totalVotes} total vote{poll.totalVotes !== 1 ? "s" : ""}
            </span>
            {isVoting && <Spinner size="sm" />}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            Comments ({poll.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitComment} className="mb-6 space-y-3">
            <Textarea
              placeholder="Share your thoughts..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="min-h-[80px]"
            />
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
              <Input
                placeholder="Your name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="sm:max-w-[200px]"
              />
              <Button type="submit" disabled={isSubmittingComment || !commentContent.trim()}>
                {isSubmittingComment ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Comment
              </Button>
            </div>
            {commentError && (
              <p className="text-sm text-red-600">{commentError}</p>
            )}
          </form>

          {poll.comments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {poll.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200">
                        {comment.authorName ? (
                          <span className="text-sm font-medium text-gray-600">
                            {comment.authorName[0].toUpperCase()}
                          </span>
                        ) : (
                          <User className="h-4 w-4 text-gray-400" />
                        )}
                      </div>
                      <span className="font-medium text-gray-900">
                        {comment.authorName || "Anonymous"}
                      </span>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(comment.createdAt)}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-gray-700">
                    {comment.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
