"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { 
  ChevronLeft, 
  ChevronRight, 
  Eye, 
  MessageCircle, 
  X, 
  Send,
  Download,
  Instagram,
  Heart,
  Share2,
  Link as LinkIcon,
  Check
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { TelegramReactions } from "@/components/reactions/telegram-reactions";
import {
  getStoriesConfessions,
  recordConfessionView,
  toggleConfessionReaction,
  getConfessionReactions,
  addConfessionComment,
} from "@/actions/confessions";
import { formatRelativeTime } from "@/lib/utils";

type StoryConfession = {
  id: string;
  content: string;
  confessionNumber: number | null;
  shareCode: string | null;
  createdAt: Date;
  approvedAt: Date | null;
  expiresAt: Date | null;
  _count: { comments: number; reactions: number; views: number };
  reactionBreakdown: Array<{ emoji: string; count: number }>;
};

const GRADIENT_THEMES = [
  "from-violet-600 via-purple-600 to-indigo-700",
  "from-rose-500 via-pink-500 to-purple-600",
  "from-amber-500 via-orange-500 to-red-500",
  "from-emerald-500 via-teal-500 to-cyan-500",
  "from-blue-500 via-indigo-500 to-purple-600",
  "from-fuchsia-500 via-pink-500 to-rose-500",
];

export default function ConfessionStoriesPage() {
  const [stories, setStories] = useState<StoryConfession[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [reactions, setReactions] = useState<Array<{ emoji: string; count: number }>>([]);
  const [userReactions, setUserReactions] = useState<string[]>([]);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const storyCardRef = useRef<HTMLDivElement>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  const STORY_DURATION = 10000; // 10 seconds per story

  useEffect(() => {
    loadStories();
  }, []);

  async function loadStories() {
    const result = await getStoriesConfessions(20);
    if (result.success && result.data) {
      setStories(result.data.confessions);
      if (result.data.confessions.length > 0) {
        recordView(result.data.confessions[0].id);
        loadReactions(result.data.confessions[0].id);
      }
    }
    setIsLoading(false);
  }

  async function recordView(confessionId: string) {
    await recordConfessionView(confessionId);
  }

  async function loadReactions(confessionId: string) {
    const result = await getConfessionReactions(confessionId);
    if (result.success && result.data) {
      setReactions(result.data.reactions);
      setUserReactions(result.data.userReactions);
    }
  }

  const goToNext = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      const nextIndex = currentIndex + 1;
      setCurrentIndex(nextIndex);
      setProgress(0);
      setShowComments(false);
      recordView(stories[nextIndex].id);
      loadReactions(stories[nextIndex].id);
    }
  }, [currentIndex, stories]);

  const goToPrevious = useCallback(() => {
    if (currentIndex > 0) {
      const prevIndex = currentIndex - 1;
      setCurrentIndex(prevIndex);
      setProgress(0);
      setShowComments(false);
      recordView(stories[prevIndex].id);
      loadReactions(stories[prevIndex].id);
    }
  }, [currentIndex, stories]);

  // Auto-advance timer
  useEffect(() => {
    if (stories.length === 0 || isPaused || showComments) return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          goToNext();
          return 0;
        }
        return prev + (100 / (STORY_DURATION / 100));
      });
    }, 100);

    return () => clearInterval(interval);
  }, [stories, isPaused, showComments, goToNext]);

  async function handleReaction(emoji: string) {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;
    
    const result = await toggleConfessionReaction(currentStory.id, emoji);
    if (result.success) {
      loadReactions(currentStory.id);
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim()) return;
    
    setIsSubmittingComment(true);
    const currentStory = stories[currentIndex];
    const result = await addConfessionComment(currentStory.id, commentText, authorName || undefined);
    
    if (result.success) {
      setCommentText("");
      // Refresh story data
      loadStories();
    }
    setIsSubmittingComment(false);
  }

  function getTimeRemaining(expiresAt: Date | null): string {
    if (!expiresAt) return "";
    const now = new Date();
    const diff = new Date(expiresAt).getTime() - now.getTime();
    if (diff <= 0) return "Expired";
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  }

  function getConfessionUrl(story: StoryConfession): string {
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    return story.shareCode ? `${baseUrl}/c/${story.shareCode}` : `${baseUrl}/confessions`;
  }

  function createStoryCanvas(story: StoryConfession): HTMLCanvasElement {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card dimensions - calculate based on content length
    const cardX = 80;
    const cardWidth = canvas.width - 160;
    const cornerRadius = 40;
    const headerHeight = 180;
    const padding = 60;
    
    // Determine font size and line height based on content length
    const content = story.content;
    let fontSize = 36;
    let lineHeight = 48;
    if (content.length > 800) {
      fontSize = 24;
      lineHeight = 32;
    } else if (content.length > 500) {
      fontSize = 28;
      lineHeight = 38;
    } else if (content.length > 300) {
      fontSize = 32;
      lineHeight = 42;
    }
    
    // Calculate required height by measuring text
    ctx.font = `bold ${fontSize}px system-ui`;
    const maxWidth = cardWidth - 80;
    const words = content.split(/(\s+)/); // Split but keep whitespace/newlines
    const lines: string[] = [];
    let currentLine = "";
    
    for (const word of words) {
      if (word === "\n" || word === "\r\n") {
        if (currentLine.trim()) lines.push(currentLine.trim());
        currentLine = "";
        continue;
      }
      const testLine = currentLine + word;
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && currentLine !== "") {
        lines.push(currentLine.trim());
        currentLine = word.trim() + " ";
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine.trim()) lines.push(currentLine.trim());
    
    // Calculate card height - content area + header + padding
    const textHeight = lines.length * lineHeight;
    const minContentHeight = 200;
    const contentHeight = Math.max(textHeight + padding * 2, minContentHeight);
    const cardHeight = headerHeight + contentHeight;
    
    // Position card vertically centered but with room for branding
    const maxCardY = 1500; // Leave room for branding at bottom
    const cardY = Math.min(Math.max(300, (canvas.height - cardHeight - 300) / 2), maxCardY - cardHeight);

    // Draw gradient header (pink to orange)
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.clip();
    
    const headerGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + headerHeight);
    headerGradient.addColorStop(0, "#ec4899");
    headerGradient.addColorStop(1, "#f97316");
    ctx.fillStyle = headerGradient;
    ctx.fillRect(cardX, cardY, cardWidth, headerHeight);

    // White bottom portion
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cardX, cardY + headerHeight, cardWidth, cardHeight - headerHeight);
    ctx.restore();

    // Header text
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("send me anonymous", canvas.width / 2, cardY + 80);
    ctx.fillText("messages!", canvas.width / 2, cardY + 130);

    // Confession number badge
    if (story.confessionNumber) {
      ctx.font = "bold 28px system-ui";
      ctx.fillStyle = "rgba(255, 255, 255, 0.6)";
      ctx.fillText(`#${story.confessionNumber}`, canvas.width / 2, cardY + 165);
    }

    // Confession text on white background
    ctx.fillStyle = "#1a1a1a";
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    
    let y = cardY + headerHeight + padding;
    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
    }

    // Bottom branding
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("ComradeZone", canvas.width / 2, 1720);
    
    ctx.font = "28px system-ui";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("anonymous q&a", canvas.width / 2, 1770);

    return canvas;
  }

  async function handleShareToInstagram() {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const canvas = createStoryCanvas(currentStory);
    const confessionUrl = getConfessionUrl(currentStory);
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);

    // Copy link to clipboard for link sticker
    try {
      await navigator.clipboard.writeText(confessionUrl);
    } catch {}

    // Try Web Share API first
    if (navigator.share && navigator.canShare) {
      try {
        const blob = await new Promise<Blob | null>((resolve) => 
          canvas.toBlob(resolve, "image/png")
        );
        if (blob) {
          const file = new File([blob], `confession-${currentStory.confessionNumber}.png`, { 
            type: "image/png" 
          });
          const shareData = {
            files: [file],
            title: `Confession #${currentStory.confessionNumber}`,
          };
          if (navigator.canShare(shareData)) {
            await navigator.share(shareData);
            setShowShareMenu(false);
            return;
          }
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          console.log('Web Share failed, falling back to download');
        } else {
          setShowShareMenu(false);
          return;
        }
      }
    }

    // Fallback: download the image
    const link = document.createElement("a");
    link.download = `confession-${currentStory.confessionNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();

    // On mobile, try to open Instagram Stories after download
    if (isMobile) {
      setTimeout(() => {
        if (isAndroid) {
          window.location.href = "intent://story-camera#Intent;package=com.instagram.android;scheme=instagram;end";
        } else {
          window.location.href = "instagram-stories://share";
        }
      }, 500);
      alert("Image saved & link copied! Select the image from your gallery and paste the link as a sticker.");
    }
    
    setShowShareMenu(false);
  }

  function handleShareToWhatsApp() {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const confessionUrl = getConfessionUrl(currentStory);
    const text = `🔥 Confession #${currentStory.confessionNumber}\n\n"${currentStory.content.substring(0, 200)}${currentStory.content.length > 200 ? '...' : ''}"\n\nRead more: ${confessionUrl}`;
    
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(whatsappUrl, '_blank');
    setShowShareMenu(false);
  }

  async function handleCopyLink() {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const confessionUrl = getConfessionUrl(currentStory);
    try {
      await navigator.clipboard.writeText(confessionUrl);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = confessionUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    }
  }

  function handleDownloadImage() {
    const currentStory = stories[currentIndex];
    if (!currentStory) return;

    const canvas = createStoryCanvas(currentStory);
    const link = document.createElement("a");
    link.download = `confession-${currentStory.confessionNumber}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
    setShowShareMenu(false);
  }

  // Close share menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setShowShareMenu(false);
      }
    }
    if (showShareMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showShareMenu]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white" />
          <p className="text-white/80">Loading stories...</p>
        </div>
      </div>
    );
  }

  if (stories.length === 0) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-violet-900 via-purple-900 to-indigo-900 px-4">
        <Heart className="mb-4 h-16 w-16 text-white/40" />
        <p className="mb-2 text-xl font-semibold text-white">No Stories Yet</p>
        <p className="mb-6 text-center text-white/60">Be the first to share a confession!</p>
        <Link href="/confessions">
          <Button className="bg-white text-purple-700 hover:bg-white/90">
            Share a Confession
          </Button>
        </Link>
      </div>
    );
  }

  const currentStory = stories[currentIndex];
  const themeGradient = GRADIENT_THEMES[currentIndex % GRADIENT_THEMES.length];

  return (
    <div 
      className={`fixed inset-0 bg-gradient-to-br ${themeGradient}`}
      onMouseDown={() => setIsPaused(true)}
      onMouseUp={() => setIsPaused(false)}
      onTouchStart={() => setIsPaused(true)}
      onTouchEnd={() => setIsPaused(false)}
    >
      {/* Progress bars */}
      <div className="absolute left-0 right-0 top-0 z-50 flex gap-1 p-3 pt-safe">
        {stories.map((_, idx) => (
          <div key={idx} className="h-1 flex-1 overflow-hidden rounded-full bg-white/30">
            <div
              className="h-full bg-white transition-all duration-100 ease-linear"
              style={{
                width: idx < currentIndex ? "100%" : idx === currentIndex ? `${progress}%` : "0%",
              }}
            />
          </div>
        ))}
      </div>

      {/* Header */}
      <div className="absolute left-0 right-0 top-6 z-40 flex items-center justify-between px-4">
        <Link href="/confessions">
          <Button variant="ghost" size="sm" className="text-white hover:bg-white/10">
            <X className="h-5 w-5" />
          </Button>
        </Link>
        
        <div className="flex items-center gap-3">
          <span className="rounded-full bg-white/20 px-4 py-1.5 text-sm font-bold text-white backdrop-blur-sm">
            #{currentStory.confessionNumber}
          </span>
          <span className="text-sm text-white/70">
            {getTimeRemaining(currentStory.expiresAt)}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-sm text-white backdrop-blur-sm">
            <Eye className="h-4 w-4" />
            {currentStory._count.views}
          </span>
        </div>
      </div>

      {/* Navigation areas */}
      <button
        className="absolute bottom-0 left-0 top-0 z-30 w-1/4"
        onClick={goToPrevious}
        disabled={currentIndex === 0}
      />
      <button
        className="absolute bottom-0 right-0 top-0 z-30 w-1/4"
        onClick={goToNext}
        disabled={currentIndex === stories.length - 1}
      />

      {/* Story content */}
      <div 
        ref={storyCardRef}
        className="flex h-full flex-col items-center justify-center px-6 py-24"
      >
        <div className="w-full max-w-lg">
          {/* Big confession number watermark */}
          <div className="mb-4 text-center text-8xl font-black text-white/10">
            #{currentStory.confessionNumber}
          </div>
          
          <div className="max-h-[50vh] overflow-y-auto rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
            <p className="text-center text-xl font-medium leading-relaxed text-white md:text-2xl">
              {currentStory.content}
            </p>
          </div>

          <p className="mt-4 text-center text-sm text-white/60">
            {formatRelativeTime(currentStory.approvedAt || currentStory.createdAt)}
          </p>
        </div>
      </div>

      {/* Bottom section */}
      <div className="absolute bottom-0 left-0 right-0 z-40 bg-gradient-to-t from-black/40 to-transparent pb-safe">
        {/* Reactions */}
        <div className="flex justify-center px-4 py-3">
          <TelegramReactions
            reactions={reactions}
            userReactions={userReactions}
            onToggleReaction={handleReaction}
            size="lg"
            darkMode
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-center gap-3 px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            className="gap-2 text-white hover:bg-white/10"
            onClick={() => setShowComments(!showComments)}
          >
            <MessageCircle className="h-4 w-4" />
            {currentStory._count.comments} Comments
          </Button>
          
          <div className="relative" ref={shareMenuRef}>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 text-white hover:bg-white/10"
              onClick={() => setShowShareMenu(!showShareMenu)}
            >
              <Share2 className="h-4 w-4" />
              Share
            </Button>
            
            {showShareMenu && (
              <div className="absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-xl bg-white/95 p-2 shadow-xl backdrop-blur-sm">
                <div className="flex flex-col gap-1 whitespace-nowrap">
                  <button
                    onClick={handleShareToInstagram}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-gray-800 transition-colors hover:bg-purple-100"
                  >
                    <Instagram className="h-5 w-5 text-pink-600" />
                    <span className="font-medium">Share to Instagram</span>
                  </button>
                  <button
                    onClick={handleShareToWhatsApp}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-gray-800 transition-colors hover:bg-green-100"
                  >
                    <svg className="h-5 w-5 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                    </svg>
                    <span className="font-medium">Share to WhatsApp</span>
                  </button>
                  <button
                    onClick={handleCopyLink}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-gray-800 transition-colors hover:bg-blue-100"
                  >
                    {linkCopied ? (
                      <Check className="h-5 w-5 text-green-600" />
                    ) : (
                      <LinkIcon className="h-5 w-5 text-blue-600" />
                    )}
                    <span className="font-medium">{linkCopied ? 'Link Copied!' : 'Copy Link'}</span>
                  </button>
                  <button
                    onClick={handleDownloadImage}
                    className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left text-gray-800 transition-colors hover:bg-gray-100"
                  >
                    <Download className="h-5 w-5 text-gray-600" />
                    <span className="font-medium">Download Image</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Comment section */}
        {showComments && (
          <div className="mx-4 mb-4 rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
            <form onSubmit={handleSubmitComment} className="flex flex-col gap-2">
              <Input
                placeholder="Your name (optional)"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                className="border-white/20 bg-white/10 text-white placeholder:text-white/50"
              />
              <div className="flex gap-2">
                <Input
                  placeholder="Write a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-1 border-white/20 bg-white/10 text-white placeholder:text-white/50"
                />
                <Button 
                  type="submit" 
                  size="sm"
                  disabled={isSubmittingComment || !commentText.trim()}
                  className="bg-white text-purple-700 hover:bg-white/90"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Navigation arrows */}
        <div className="flex items-center justify-between px-4 pb-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={goToPrevious}
            disabled={currentIndex === 0}
            className="text-white disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <span className="rounded-full bg-white/20 px-4 py-1 text-sm text-white backdrop-blur-sm">
            {currentIndex + 1} / {stories.length}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={goToNext}
            disabled={currentIndex === stories.length - 1}
            className="text-white disabled:opacity-30 hover:bg-white/10"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
