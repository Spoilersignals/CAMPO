"use client";

import { useState } from "react";
import { Share2, Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  shareCode: string;
  variant?: "icon" | "button";
  size?: "sm" | "md";
}

export function ShareButton({ shareCode, variant = "icon", size = "sm" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function handleShare(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    
    const url = `${window.location.origin}/c/${shareCode}`;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this confession",
          url,
        });
        return;
      } catch {
        // Fall back to clipboard
      }
    }
    
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const input = document.createElement("input");
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        size={size}
        onClick={handleShare}
        className="gap-2"
      >
        {copied ? (
          <>
            <Check className="h-4 w-4 text-green-600" />
            Copied!
          </>
        ) : (
          <>
            <Share2 className="h-4 w-4" />
            Share
          </>
        )}
      </Button>
    );
  }

  return (
    <button
      onClick={handleShare}
      className="flex items-center gap-1 rounded-full bg-gray-100 px-3 py-1 text-sm text-gray-600 transition-colors hover:bg-gray-200"
      title="Share confession"
    >
      {copied ? (
        <>
          <Check className="h-3.5 w-3.5 text-green-600" />
          <span className="text-green-600">Copied!</span>
        </>
      ) : (
        <>
          <Copy className="h-3.5 w-3.5" />
          <span>Share</span>
        </>
      )}
    </button>
  );
}
