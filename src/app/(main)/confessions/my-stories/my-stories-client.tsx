"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, MessageCircle, Heart, Clock, Share2, Trash2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { formatRelativeTime } from "@/lib/utils";
import { deleteMyStory } from "@/actions/confessions";
import { ShareButton } from "@/components/share-button";

type Story = {
  id: string;
  content: string;
  confessionNumber: number | null;
  shareCode: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  expiresAt: Date | null;
  _count: { comments: number; reactions: number; views: number };
};

function getTimeRemaining(expiresAt: Date | null): string | null {
  if (!expiresAt) return null;
  
  const now = new Date();
  const expiry = new Date(expiresAt);
  const diff = expiry.getTime() - now.getTime();
  
  if (diff <= 0) return "Expired";
  
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (hours > 0) {
    return `${hours}h ${minutes}m remaining`;
  }
  return `${minutes}m remaining`;
}

export function MyStoriesClient({ stories: initialStories }: { stories: Story[] }) {
  const [stories, setStories] = useState(initialStories);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    if (!confirm("Are you sure you want to delete this story?")) return;
    
    setDeletingId(id);
    const result = await deleteMyStory(id);
    if (result.success) {
      setStories(stories.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  }

  return (
    <div className="space-y-4">
      {stories.map((story) => {
        const timeRemaining = getTimeRemaining(story.expiresAt);
        const isExpired = timeRemaining === "Expired";
        
        return (
          <Card
            key={story.id}
            className={`overflow-hidden ${isExpired ? "opacity-60" : ""}`}
          >
            <CardContent className="pt-6">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {story.confessionNumber && (
                    <span className="font-semibold text-indigo-600">
                      #{story.confessionNumber}
                    </span>
                  )}
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(story.approvedAt || story.createdAt)}
                  </span>
                </div>
                {timeRemaining && (
                  <div
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                      isExpired
                        ? "bg-gray-100 text-gray-500"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {timeRemaining}
                  </div>
                )}
              </div>

              <Link href={`/confessions/${story.id}`}>
                <p className="mb-4 whitespace-pre-wrap text-gray-800 hover:text-indigo-600">
                  {story.content.length > 200
                    ? story.content.slice(0, 200) + "..."
                    : story.content}
                </p>
              </Link>

              <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Eye className="h-4 w-4 text-blue-500" />
                    <span className="font-medium">{story._count.views}</span>
                    <span className="text-gray-400">views</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <Heart className="h-4 w-4 text-red-500" />
                    <span className="font-medium">{story._count.reactions}</span>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <MessageCircle className="h-4 w-4 text-indigo-500" />
                    <span className="font-medium">{story._count.comments}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {story.shareCode && <ShareButton shareCode={story.shareCode} />}
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() => handleDelete(story.id)}
                    disabled={deletingId === story.id}
                  >
                    {deletingId === story.id ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
