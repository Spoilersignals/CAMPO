"use client";

import { useState } from "react";
import { Repeat2, Link as LinkIcon, Twitter, Copy, Check } from "lucide-react";
import { createRepost, getRepostCount } from "@/actions/reposts";
import { useEffect } from "react";

interface ShareButtonProps {
  contentType: "confession" | "crush" | "spotted";
  contentId: string;
  size?: "sm" | "md";
}

export function ShareButton({ contentType, contentId, size = "md" }: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [quoteText, setQuoteText] = useState("");
  const [showQuote, setShowQuote] = useState(false);
  const [repostCount, setRepostCount] = useState(0);
  const [copied, setCopied] = useState(false);
  const [reposting, setReposting] = useState(false);

  useEffect(() => {
    getRepostCount(contentType, contentId).then(setRepostCount);
  }, [contentType, contentId]);

  const shareUrl = typeof window !== "undefined" 
    ? `${window.location.origin}/${contentType === "confession" ? "confessions" : contentType === "crush" ? "crushes" : "spotted"}/${contentId}`
    : "";

  async function handleRepost() {
    setReposting(true);
    await createRepost(contentType, contentId, quoteText || undefined);
    setRepostCount((c) => c + 1);
    setQuoteText("");
    setShowQuote(false);
    setIsOpen(false);
    setReposting(false);
  }

  async function handleCopyLink() {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleTwitterShare() {
    const text = `Check this out on Campus! ${shareUrl}`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, "_blank");
  }

  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="group flex items-center gap-1.5 text-gray-400 hover:text-emerald-500 transition-all"
      >
        <Repeat2 className={`${iconSize} transition-transform group-hover:scale-110`} />
        {repostCount > 0 && (
          <span className="text-xs">{repostCount}</span>
        )}
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute bottom-full right-0 mb-2 w-64 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 overflow-hidden">
            <div className="p-3 space-y-2">
              <button
                onClick={() => setShowQuote(!showQuote)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                <Repeat2 className="h-5 w-5 text-emerald-500" />
                <span className="font-medium text-gray-900 dark:text-white">
                  {showQuote ? "Hide quote" : "Repost with quote"}
                </span>
              </button>

              {showQuote && (
                <div className="space-y-2">
                  <textarea
                    value={quoteText}
                    onChange={(e) => setQuoteText(e.target.value)}
                    placeholder="Add your thoughts..."
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-emerald-500 focus:border-transparent resize-none"
                    rows={2}
                  />
                  <button
                    onClick={handleRepost}
                    disabled={reposting}
                    className="w-full py-2 bg-emerald-500 text-white rounded-xl text-sm font-medium hover:bg-emerald-600 disabled:opacity-50 transition-colors"
                  >
                    {reposting ? "Reposting..." : "Repost"}
                  </button>
                </div>
              )}

              <div className="border-t border-gray-100 dark:border-gray-700 pt-2">
                <button
                  onClick={handleCopyLink}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  {copied ? (
                    <Check className="h-5 w-5 text-green-500" />
                  ) : (
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                  )}
                  <span className="font-medium text-gray-900 dark:text-white">
                    {copied ? "Copied!" : "Copy link"}
                  </span>
                </button>

                <button
                  onClick={handleTwitterShare}
                  className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <Twitter className="h-5 w-5 text-blue-400" />
                  <span className="font-medium text-gray-900 dark:text-white">
                    Share on X
                  </span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
