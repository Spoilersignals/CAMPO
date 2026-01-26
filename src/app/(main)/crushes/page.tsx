"use client";

import { useState, useTransition, useEffect } from "react";
import Link from "next/link";
import { Flame, Clock, MessageCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitCrush, getApprovedCrushes } from "@/actions/crushes";
import { formatRelativeTime, truncate } from "@/lib/utils";

type SortBy = "hot" | "recent";

type Crush = {
  id: string;
  title: string;
  description: string;
  location: string | null;
  seenAt: Date | null;
  crushNumber: number | null;
  createdAt: Date;
  approvedAt: Date | null;
  _count: { comments: number; reactions: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

export default function CrushesPage() {
  const [crushes, setCrushes] = useState<Crush[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [sortBy, setSortBy] = useState<SortBy>("hot");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [seenAt, setSeenAt] = useState("");

  useEffect(() => {
    loadCrushes();
  }, [sortBy]);

  async function loadCrushes() {
    setLoading(true);
    const result = await getApprovedCrushes(1, 20, sortBy);
    if (result.success && result.data) {
      setCrushes(result.data.crushes);
    }
    setLoading(false);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess(false);

    startTransition(async () => {
      const result = await submitCrush({
        title,
        description,
        location: location || undefined,
        seenAt: seenAt ? new Date(seenAt) : undefined,
      });

      if (result.success) {
        setSuccess(true);
        setTitle("");
        setDescription("");
        setLocation("");
        setSeenAt("");
        setShowForm(false);
      } else {
        setError(result.error || "Failed to submit crush");
      }
    });
  }

  const topReactions = (breakdown: Array<{ emoji: string; count: number }>) => {
    return breakdown.sort((a, b) => b.count - a.count).slice(0, 4);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-pink-600">💕 Campus Crushes</h1>
        <p className="mt-2 text-gray-600">
          Share your anonymous crush sightings
        </p>
      </div>

      {success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4 text-green-800">
          Your crush has been submitted! It will appear after moderation.
        </div>
      )}

      {!showForm ? (
        <Button
          onClick={() => setShowForm(true)}
          className="mb-6 w-full bg-pink-500 hover:bg-pink-600"
        >
          💌 Submit a Crush
        </Button>
      ) : (
        <Card className="mb-6 border-pink-200">
          <CardHeader>
            <CardTitle className="text-pink-600">Submit Your Crush</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                label="Title"
                placeholder="e.g., Library mystery person"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              <Textarea
                label="Description"
                placeholder="Describe your crush sighting..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              <Input
                label="Location (optional)"
                placeholder="e.g., Main library, 2nd floor"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              <Input
                label="When did you see them? (optional)"
                type="date"
                value={seenAt}
                onChange={(e) => setSeenAt(e.target.value)}
                className="focus:border-pink-500 focus:ring-pink-500/20"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              <div className="flex gap-3">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 bg-pink-500 hover:bg-pink-600"
                >
                  {isPending ? "Submitting..." : "Submit Crush"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

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

      <div className="space-y-4">
        {loading ? (
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
        ) : crushes.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No crushes yet. Be the first to share!
          </div>
        ) : (
          crushes.map((crush) => (
            <Link key={crush.id} href={`/crushes/${crush.id}`}>
              <Card className="transition-shadow hover:shadow-md border-pink-100 hover:border-pink-200">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        {crush.crushNumber && (
                          <span className="text-sm font-medium text-pink-500">
                            #{crush.crushNumber}
                          </span>
                        )}
                        <h3 className="font-semibold text-gray-900">
                          {crush.title}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-600">
                        {truncate(crush.description, 150)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-500">
                        {crush.location && (
                          <span className="flex items-center gap-1">
                            📍 {crush.location}
                          </span>
                        )}
                        <span>{formatRelativeTime(crush.createdAt)}</span>
                      </div>
                      
                      {/* Reaction Summary */}
                      <div className="mt-3 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {topReactions(crush.reactionBreakdown).length > 0 ? (
                            <div className="flex items-center gap-1 rounded-full bg-pink-50 px-3 py-1">
                              <span className="flex -space-x-1">
                                {topReactions(crush.reactionBreakdown).map((r, idx) => (
                                  <span key={r.emoji} style={{ zIndex: 10 - idx }}>
                                    {r.emoji}
                                  </span>
                                ))}
                              </span>
                              <span className="ml-1 text-sm font-medium text-pink-700">
                                {crush._count.reactions}
                              </span>
                            </div>
                          ) : (
                            <span className="text-sm text-gray-400">No reactions yet</span>
                          )}
                        </div>
                        <span className="flex items-center gap-1 text-sm text-gray-500">
                          <MessageCircle className="h-4 w-4" />
                          {crush._count.comments}
                        </span>
                      </div>
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
