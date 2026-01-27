"use client";

import { useState, useEffect } from "react";
import { Bookmark } from "lucide-react";
import { toggleBookmark, isBookmarked } from "@/actions/bookmarks";

interface BookmarkButtonProps {
  contentType: "confession" | "crush" | "spotted" | "poll";
  contentId: string;
  size?: "sm" | "md";
}

export function BookmarkButton({ contentType, contentId, size = "md" }: BookmarkButtonProps) {
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    isBookmarked(contentType, contentId).then((result) => {
      setBookmarked(result);
      setLoading(false);
    });
  }, [contentType, contentId]);

  async function handleToggle() {
    setLoading(true);
    const result = await toggleBookmark(contentType, contentId);
    if (result.success) {
      setBookmarked(result.bookmarked);
    }
    setLoading(false);
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={`group flex items-center gap-1.5 transition-all ${
        bookmarked 
          ? "text-amber-500" 
          : "text-gray-400 hover:text-amber-500"
      } ${loading ? "opacity-50" : ""}`}
      title={bookmarked ? "Remove bookmark" : "Bookmark"}
    >
      <Bookmark
        className={`${iconSize} transition-transform group-hover:scale-110 ${
          bookmarked ? "fill-current" : ""
        }`}
      />
    </button>
  );
}
