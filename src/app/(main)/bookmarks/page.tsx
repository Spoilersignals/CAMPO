"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Bookmark, Trash2 } from "lucide-react";
import { getMyBookmarks, toggleBookmark } from "@/actions/bookmarks";
import { formatRelativeTime } from "@/lib/utils";

type BookmarkItem = {
  id: string;
  contentType: string;
  createdAt: Date;
  content: {
    id: string;
    content?: string;
    title?: string;
    confessionNumber?: number | null;
    crushNumber?: number | null;
    spottedNumber?: number | null;
    question?: string;
  } | null;
};

export default function BookmarksPage() {
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBookmarks();
  }, []);

  async function loadBookmarks() {
    const data = await getMyBookmarks();
    setBookmarks(data as BookmarkItem[]);
    setLoading(false);
  }

  async function handleRemove(contentType: string, contentId: string) {
    await toggleBookmark(contentType as "confession" | "crush" | "spotted" | "poll", contentId);
    setBookmarks((prev) => prev.filter((b) => b.content?.id !== contentId));
  }

  function getContentUrl(bookmark: BookmarkItem) {
    if (!bookmark.content) return "#";
    switch (bookmark.contentType) {
      case "confession":
        return `/confessions/${bookmark.content.id}`;
      case "crush":
        return `/crushes/${bookmark.content.id}`;
      case "spotted":
        return `/spotted/${bookmark.content.id}`;
      case "poll":
        return `/polls/${bookmark.content.id}`;
      default:
        return "#";
    }
  }

  function getContentNumber(bookmark: BookmarkItem) {
    if (!bookmark.content) return null;
    if ("confessionNumber" in bookmark.content) return bookmark.content.confessionNumber;
    if ("crushNumber" in bookmark.content) return bookmark.content.crushNumber;
    if ("spottedNumber" in bookmark.content) return bookmark.content.spottedNumber;
    return null;
  }

  function getContentText(bookmark: BookmarkItem) {
    if (!bookmark.content) return "";
    if ("content" in bookmark.content && bookmark.content.content) return bookmark.content.content;
    if ("title" in bookmark.content && bookmark.content.title) return bookmark.content.title;
    if ("question" in bookmark.content && bookmark.content.question) return bookmark.content.question;
    return "";
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
          <Bookmark className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Bookmarks
          </h1>
          <p className="text-gray-500">{bookmarks.length} saved items</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="text-center py-16">
          <Bookmark className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No bookmarks yet
          </h2>
          <p className="text-gray-500 mb-6">
            Save posts to read later by tapping the bookmark icon
          </p>
          <Link
            href="/confessions"
            className="inline-block px-6 py-2.5 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-full font-medium hover:opacity-90 transition"
          >
            Browse Confessions
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {bookmarks.map((bookmark) => (
            <div
              key={bookmark.id}
              className="relative group p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all"
            >
              <Link href={getContentUrl(bookmark)} className="block">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 capitalize">
                    {bookmark.contentType}
                  </span>
                  {getContentNumber(bookmark) && (
                    <span className="text-sm font-bold text-rose-500">
                      #{getContentNumber(bookmark)}
                    </span>
                  )}
                  <span className="text-xs text-gray-400 ml-auto">
                    {formatRelativeTime(bookmark.createdAt)}
                  </span>
                </div>
                <p className="text-gray-800 dark:text-gray-200 line-clamp-2">
                  {getContentText(bookmark)}
                </p>
              </Link>
              
              <button
                onClick={() => bookmark.content && handleRemove(bookmark.contentType, bookmark.content.id)}
                className="absolute top-4 right-4 p-1.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
