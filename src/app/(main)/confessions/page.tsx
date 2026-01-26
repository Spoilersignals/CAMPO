"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { MessageCircle, Flame, Clock, UserPlus, Play, Link2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { submitConfession, getApprovedConfessions } from "@/actions/confessions";
import { formatRelativeTime } from "@/lib/utils";
import { ShareButton } from "@/components/share-button";

type SortBy = "hot" | "recent";

type Confession = {
  id: string;
  content: string;
  confessionNumber: number | null;
  shareCode: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  _count: { comments: number; reactions: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

export default function ConfessionsPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [confessions, setConfessions] = useState<Confession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>("hot");

  useEffect(() => {
    loadConfessions();
  }, [sortBy]);

  async function loadConfessions() {
    setIsLoading(true);
    const result = await getApprovedConfessions(1, 20, sortBy);
    if (result.success && result.data) {
      setConfessions(result.data.confessions);
    }
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const result = await submitConfession(content);

    if (result.success) {
      setContent("");
      setSuccessMessage("Your confession has been submitted for review! It will appear once approved.");
      setTimeout(() => setSuccessMessage(""), 5000);
    } else {
      setError(result.error || "Failed to submit confession");
    }

    setIsSubmitting(false);
  }

  const topReactions = (breakdown: Array<{ emoji: string; count: number }>) => {
    return breakdown
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Confessions</h1>
          <p className="text-gray-600">Share your thoughts anonymously</p>
        </div>
        <div className="flex gap-2">
          <Link href="/confessions/my-link">
            <Button variant="outline" className="gap-2">
              <Link2 className="h-4 w-4" />
              My Link
            </Button>
          </Link>
          <Link href="/confessions/my-stories">
            <Button variant="outline" className="gap-2">
              <BookOpen className="h-4 w-4" />
              My Stories
            </Button>
          </Link>
          <Link href="/confessions/stories">
            <Button className="gap-2 bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700">
              <Play className="h-4 w-4" />
              Stories
            </Button>
          </Link>
        </div>
      </div>

      {/* Submit Confession Card */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit}>
            <Textarea
              placeholder="Write your confession... (min 10 characters). No account needed!"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="mb-4 min-h-[100px]"
              maxLength={2000}
            />
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm text-gray-500">
                {content.length}/2000
              </span>
              <Button type="submit" disabled={isSubmitting || content.length < 10}>
                {isSubmitting ? "Submitting..." : "Submit Anonymously"}
              </Button>
            </div>
          </form>

          {successMessage && (
            <div className="mt-4 rounded-lg bg-green-50 p-4 text-green-700">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mt-4 rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}
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
              <p className="font-medium text-indigo-900">Want to build your community?</p>
              <p className="text-sm text-indigo-700">Create an account to get followers and follow confessors</p>
            </div>
            <Link href="/register">
              <Button size="sm" variant="outline" className="border-indigo-300 text-indigo-700 hover:bg-indigo-100">
                Sign Up
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Sort Tabs */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setSortBy("hot")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            sortBy === "hot"
              ? "bg-orange-100 text-orange-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Flame className="h-4 w-4" />
          Hot
        </button>
        <button
          onClick={() => setSortBy("recent")}
          className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            sortBy === "recent"
              ? "bg-blue-100 text-blue-700"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
        >
          <Clock className="h-4 w-4" />
          Recent
        </button>
      </div>

      {/* Confessions List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="pt-6">
                  <div className="mb-2 h-4 w-20 rounded bg-gray-200" />
                  <div className="mb-4 space-y-2">
                    <div className="h-4 w-full rounded bg-gray-200" />
                    <div className="h-4 w-3/4 rounded bg-gray-200" />
                  </div>
                  <div className="flex gap-4">
                    <div className="h-6 w-16 rounded bg-gray-200" />
                    <div className="h-6 w-16 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : confessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No confessions yet. Be the first to share!</p>
            </CardContent>
          </Card>
        ) : (
          confessions.map((confession) => (
            <Link key={confession.id} href={`/confessions/${confession.id}`}>
              <Card className="cursor-pointer transition-all hover:shadow-md hover:border-indigo-200">
                <CardContent className="pt-6">
                  <div className="mb-2 flex items-center gap-2">
                    <span className="font-semibold text-indigo-600">
                      #{confession.confessionNumber}
                    </span>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(confession.approvedAt || confession.createdAt)}
                    </span>
                  </div>
                  <p className="mb-4 whitespace-pre-wrap text-gray-800">
                    {confession.content.length > 300
                      ? confession.content.slice(0, 300) + "..."
                      : confession.content}
                  </p>
                  
                  {/* Reaction Summary */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {topReactions(confession.reactionBreakdown).length > 0 ? (
                        <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                          <span className="flex -space-x-1">
                            {topReactions(confession.reactionBreakdown).map((r, idx) => (
                              <span key={r.emoji} style={{ zIndex: 10 - idx }}>
                                {r.emoji}
                              </span>
                            ))}
                          </span>
                          <span className="ml-1 text-sm font-medium text-gray-700">
                            {confession._count.reactions}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">No reactions yet</span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {confession.shareCode && (
                        <ShareButton shareCode={confession.shareCode} />
                      )}
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        {confession._count.comments}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
