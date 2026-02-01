"use client";

import { useState, useEffect, useTransition } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, ThumbsUp, ThumbsDown, MessageCircle, Send, Share2, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { getHotTakeWithComments, voteHotTake, commentOnHotTake } from "@/actions/hot-takes";
import { formatRelativeTime, cn } from "@/lib/utils";

interface Comment {
  id: string;
  content: string;
  createdAt: Date;
}

interface HotTake {
  id: string;
  content: string;
  takeNumber: number | null;
  agreeCount: number;
  disagreeCount: number;
  totalVotes: number;
  agreePercentage: number;
  isControversial: boolean;
  createdAt: Date;
  userVote: string | null;
  comments: Comment[];
}

export default function HotTakeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [hotTake, setHotTake] = useState<HotTake | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVoting, setIsVoting] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [animatingVote, setAnimatingVote] = useState<"AGREE" | "DISAGREE" | null>(null);

  const [commentContent, setCommentContent] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadHotTake();
  }, [id]);

  async function loadHotTake() {
    setLoading(true);
    const result = await getHotTakeWithComments(id);
    if (result.success && result.data) {
      setHotTake(result.data);
    }
    setLoading(false);
  }

  async function handleVote(voteType: "AGREE" | "DISAGREE") {
    if (!hotTake || hotTake.userVote) return;

    setIsVoting(true);
    setAnimatingVote(voteType);

    startTransition(async () => {
      const result = await voteHotTake(hotTake.id, voteType);
      if (result.success && result.data) {
        const newTotal = result.data.newAgreeCount + result.data.newDisagreeCount;
        const newPercentage = newTotal > 0 ? Math.round((result.data.newAgreeCount / newTotal) * 100) : 50;
        setHotTake((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            agreeCount: result.data!.newAgreeCount,
            disagreeCount: result.data!.newDisagreeCount,
            totalVotes: newTotal,
            agreePercentage: newPercentage,
            userVote: voteType,
            isControversial: newTotal >= 10 && newPercentage >= 40 && newPercentage <= 60,
          };
        });
      }
      setTimeout(() => {
        setIsVoting(false);
        setAnimatingVote(null);
      }, 300);
    });
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!hotTake || !commentContent.trim()) {
      setCommentError("Please enter a comment");
      return;
    }

    setIsSubmittingComment(true);
    setCommentError("");

    const result = await commentOnHotTake(hotTake.id, commentContent.trim());
    setIsSubmittingComment(false);

    if (result.success) {
      const newComment: Comment = {
        id: result.data?.commentId || Date.now().toString(),
        content: commentContent.trim(),
        createdAt: new Date(),
      };
      setHotTake((prev) => {
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

  async function handleShare() {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Hot Take",
          text: hotTake?.content,
          url,
        });
      } catch {
        // User cancelled or error
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!hotTake) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/hot-takes"
          className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Hot Takes
        </Link>
        <Card className="p-8 text-center">
          <Flame className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">Hot take not found</h3>
          <p className="mt-1 text-gray-500">This take may have been removed.</p>
        </Card>
      </div>
    );
  }

  const hasVoted = !!hotTake.userVote;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/hot-takes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hot Takes
      </Link>

      {/* Main Hot Take Card */}
      <Card className="mb-8 overflow-hidden">
        <CardHeader className={cn(
          "text-white",
          hotTake.isControversial
            ? "bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"
            : "bg-gradient-to-r from-orange-500 to-red-500"
        )}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-6 w-6" />
              {hotTake.takeNumber && (
                <span className="font-medium">Take #{hotTake.takeNumber}</span>
              )}
              {hotTake.isControversial && (
                <span className="rounded-full bg-white/20 px-2 py-0.5 text-xs font-bold">
                  🔥 HOT TAKE
                </span>
              )}
            </div>
            <span className="text-sm text-orange-100">
              {formatRelativeTime(hotTake.createdAt)}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-6">
          {/* Content */}
          <p className="mb-6 text-2xl font-bold text-gray-900">
            {hotTake.content}
          </p>

          {/* Vote Results Bar */}
          <div className="mb-6">
            <div className="relative h-6 overflow-hidden rounded-full bg-gray-200">
              <div
                className="absolute left-0 top-0 h-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
                style={{ width: `${hotTake.agreePercentage}%` }}
              />
              <div
                className="absolute right-0 top-0 h-full bg-gradient-to-l from-red-400 to-red-500 transition-all duration-500"
                style={{ width: `${100 - hotTake.agreePercentage}%` }}
              />
              {/* Center line */}
              <div className="absolute left-1/2 top-0 h-full w-0.5 -translate-x-1/2 bg-white/50" />
            </div>
            <div className="mt-2 flex justify-between text-sm font-semibold">
              <span className="text-green-600">
                👍 {hotTake.agreePercentage}% Agree ({hotTake.agreeCount})
              </span>
              <span className="text-red-600">
                ({hotTake.disagreeCount}) Disagree {100 - hotTake.agreePercentage}% 👎
              </span>
            </div>
          </div>

          {/* Vote Buttons */}
          {!hasVoted ? (
            <div className="flex gap-4">
              <button
                onClick={() => handleVote("AGREE")}
                disabled={isVoting}
                className={cn(
                  "flex flex-1 items-center justify-center gap-3 rounded-2xl py-4 text-xl font-bold transition-all",
                  "bg-gradient-to-r from-green-400 to-green-500 text-white",
                  "hover:from-green-500 hover:to-green-600 hover:scale-105 hover:shadow-lg",
                  "active:scale-95",
                  animatingVote === "AGREE" && "scale-110 ring-4 ring-green-300"
                )}
              >
                <ThumbsUp className={cn("h-6 w-6", animatingVote === "AGREE" && "animate-bounce")} />
                AGREE
              </button>
              <button
                onClick={() => handleVote("DISAGREE")}
                disabled={isVoting}
                className={cn(
                  "flex flex-1 items-center justify-center gap-3 rounded-2xl py-4 text-xl font-bold transition-all",
                  "bg-gradient-to-r from-red-400 to-red-500 text-white",
                  "hover:from-red-500 hover:to-red-600 hover:scale-105 hover:shadow-lg",
                  "active:scale-95",
                  animatingVote === "DISAGREE" && "scale-110 ring-4 ring-red-300"
                )}
              >
                <ThumbsDown className={cn("h-6 w-6", animatingVote === "DISAGREE" && "animate-bounce")} />
                DISAGREE
              </button>
            </div>
          ) : (
            <div className="flex gap-4">
              <div
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold",
                  hotTake.userVote === "AGREE"
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <ThumbsUp className="h-5 w-5" />
                {hotTake.userVote === "AGREE" ? "You Agreed" : "Agree"}
              </div>
              <div
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-2xl py-4 text-lg font-bold",
                  hotTake.userVote === "DISAGREE"
                    ? "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-400"
                )}
              >
                <ThumbsDown className="h-5 w-5" />
                {hotTake.userVote === "DISAGREE" ? "You Disagreed" : "Disagree"}
              </div>
            </div>
          )}

          {/* Share Button */}
          <div className="mt-6 flex justify-center border-t border-gray-100 pt-4">
            <Button
              variant="outline"
              onClick={handleShare}
              className="gap-2"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  Link Copied!
                </>
              ) : (
                <>
                  <Share2 className="h-4 w-4" />
                  Share this Take
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Comments Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-orange-500" />
            Comments ({hotTake.comments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Comment Form */}
          <form onSubmit={handleSubmitComment} className="mb-6">
            <Textarea
              placeholder="Share your thoughts on this take..."
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              className="mb-3 min-h-[80px]"
            />
            <div className="flex items-center justify-between">
              <p className="text-xs text-gray-500">Comments are anonymous</p>
              <Button
                type="submit"
                disabled={isSubmittingComment || !commentContent.trim()}
                className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isSubmittingComment ? (
                  <Spinner size="sm" className="mr-2" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                Post Comment
              </Button>
            </div>
            {commentError && (
              <p className="mt-2 text-sm text-red-600">{commentError}</p>
            )}
          </form>

          {/* Comments List */}
          {hotTake.comments.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              <MessageCircle className="mx-auto mb-2 h-8 w-8 text-gray-300" />
              No comments yet. Be the first to share your thoughts!
            </div>
          ) : (
            <div className="space-y-4">
              {hotTake.comments.map((comment) => (
                <div
                  key={comment.id}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-4"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="font-medium text-gray-900">Anonymous</span>
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
