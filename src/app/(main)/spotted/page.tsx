"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitSpotted, getApprovedSpotted } from "@/actions/spotted";
import { formatRelativeTime } from "@/lib/utils";

type SortBy = "hot" | "recent";

type SpottedPost = {
  id: string;
  content: string;
  location: string;
  spottedAt: Date | null;
  spottedNumber: number | null;
  createdAt: Date;
  _count: { comments: number; reactions: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

export default function SpottedPage() {
  const [posts, setPosts] = useState<SpottedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [sortBy, setSortBy] = useState<SortBy>("hot");

  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [spottedDate, setSpottedDate] = useState("");

  useEffect(() => {
    loadPosts();
  }, [sortBy]);

  async function loadPosts() {
    setLoading(true);
    const result = await getApprovedSpotted(1, 50, sortBy);
    if (result.success && result.data) {
      setPosts(result.data.items);
    }
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    setSuccess(false);

    const result = await submitSpotted({
      content,
      location,
      spottedAt: spottedDate ? new Date(spottedDate) : undefined,
    });

    if (result.success) {
      setSuccess(true);
      setContent("");
      setLocation("");
      setSpottedDate("");
    } else {
      setError(result.error || "Failed to submit");
    }
    setSubmitting(false);
  }

  const topReactions = (breakdown: Array<{ emoji: string; count: number }>) => {
    return breakdown.sort((a, b) => b.count - a.count).slice(0, 4);
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Spotted</h1>
        <p className="text-gray-500">Share anonymous sightings on campus</p>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Textarea
              label="What did you spot?"
              placeholder="I saw someone..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="Location"
                placeholder="Library, Cafeteria..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Input
                label="When (optional)"
                type="datetime-local"
                value={spottedDate}
                onChange={(e) => setSpottedDate(e.target.value)}
              />
            </div>
            <Button type="submit" disabled={submitting} className="w-full">
              {submitting ? "Submitting..." : "Submit Spotted"}
            </Button>
            {success && (
              <p className="text-center text-sm text-green-600">
                Submitted! Your spotted will appear after approval.
              </p>
            )}
            {error && (
              <p className="text-center text-sm text-red-600">{error}</p>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Sort Tabs */}
      <div className="flex gap-2">
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

      <div className="space-y-4">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 w-16 rounded bg-gray-200" />
                  <div className="mt-2 h-16 rounded bg-gray-200" />
                  <div className="mt-3 flex gap-4">
                    <div className="h-4 w-24 rounded bg-gray-200" />
                    <div className="h-4 w-16 rounded bg-gray-200" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              No spotted posts yet. Be the first!
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Link key={post.id} href={`/spotted/${post.id}`}>
                <Card className="transition-shadow hover:shadow-md">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="rounded-full bg-blue-100 px-2 py-0.5 text-sm font-medium text-blue-700">
                        #{post.spottedNumber ?? "?"}
                      </span>
                      <span className="text-sm text-gray-500">
                        {post.spottedAt ? formatRelativeTime(post.spottedAt) : "Unknown time"}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap text-gray-800">
                      {post.content.length > 300
                        ? post.content.slice(0, 300) + "..."
                        : post.content}
                    </p>
                    <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <svg
                          className="h-4 w-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                        {post.location}
                      </span>
                    </div>
                    
                    {/* Reaction Summary */}
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {topReactions(post.reactionBreakdown).length > 0 ? (
                          <div className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1">
                            <span className="flex -space-x-1">
                              {topReactions(post.reactionBreakdown).map((r, idx) => (
                                <span key={r.emoji} style={{ zIndex: 10 - idx }}>
                                  {r.emoji}
                                </span>
                              ))}
                            </span>
                            <span className="ml-1 text-sm font-medium text-gray-700">
                              {post._count.reactions}
                            </span>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">No reactions yet</span>
                        )}
                      </div>
                      <span className="flex items-center gap-1 text-sm text-gray-500">
                        <MessageCircle className="h-4 w-4" />
                        {post._count.comments}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
