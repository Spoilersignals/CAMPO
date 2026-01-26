"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Link2, MessageCircle, RefreshCw, Share2, Sparkles, Instagram, Download, MoreVertical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  generatePersonalLink, 
  getMyPersonalLink, 
  shareToStories,
  updateDisplayName 
} from "@/actions/personal-confessions";
import { formatRelativeTime } from "@/lib/utils";

function createConfessionImage(content: string, userName?: string): Promise<Blob> {
  return new Promise((resolve) => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1920;
    const ctx = canvas.getContext("2d")!;

    // Black background
    ctx.fillStyle = "#000000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Card dimensions
    const cardX = 80;
    const cardY = 480;
    const cardWidth = canvas.width - 160;
    const cardHeight = 520;
    const cornerRadius = 40;

    // Draw gradient header (pink to orange) - top portion of card
    const headerHeight = 180;
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.clip();
    
    const headerGradient = ctx.createLinearGradient(cardX, cardY, cardX + cardWidth, cardY + headerHeight);
    headerGradient.addColorStop(0, "#ec4899");
    headerGradient.addColorStop(1, "#f97316");
    ctx.fillStyle = headerGradient;
    ctx.fillRect(cardX, cardY, cardWidth, headerHeight);

    // White bottom portion of card
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(cardX, cardY + headerHeight, cardWidth, cardHeight - headerHeight);
    ctx.restore();

    // Draw card border/shadow effect
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(cardX, cardY, cardWidth, cardHeight, cornerRadius);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    // Header text - "send me anonymous messages!"
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 42px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("send me anonymous", canvas.width / 2, cardY + 80);
    ctx.fillText("messages!", canvas.width / 2, cardY + 130);

    // Confession text on white background
    ctx.fillStyle = "#1a1a1a";
    ctx.font = "bold 38px system-ui";
    ctx.textAlign = "center";
    
    const maxWidth = cardWidth - 80;
    const lineHeight = 52;
    const words = content.split(" ");
    let line = "";
    let y = cardY + headerHeight + 80;
    const maxY = cardY + cardHeight - 40;
    
    for (const word of words) {
      const testLine = line + word + " ";
      const metrics = ctx.measureText(testLine);
      if (metrics.width > maxWidth && line !== "") {
        ctx.fillText(line.trim(), canvas.width / 2, y);
        line = word + " ";
        y += lineHeight;
        if (y > maxY) {
          ctx.fillText("...", canvas.width / 2, y);
          break;
        }
      } else {
        line = testLine;
      }
    }
    if (y <= maxY && line.trim()) {
      ctx.fillText(line.trim(), canvas.width / 2, y);
    }

    // Bottom branding - ConfessUNI logo style
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 56px system-ui";
    ctx.textAlign = "center";
    ctx.fillText("ComradeZone", canvas.width / 2, 1720);
    
    ctx.font = "28px system-ui";
    ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
    ctx.fillText("anonymous q&a", canvas.width / 2, 1770);

    // User's name/link at the very bottom if provided
    if (userName) {
      ctx.font = "24px system-ui";
      ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
      ctx.fillText(`@${userName}`, canvas.width / 2, 1820);
    }

    canvas.toBlob((blob) => resolve(blob!), "image/png");
  });
}

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

type PersonalConfession = {
  id: string;
  content: string;
  createdAt: Date;
  status: string;
  sharedToStories: boolean;
};

export default function MyLinkPage() {
  const [link, setLink] = useState<string | null>(null);
  const [confessions, setConfessions] = useState<PersonalConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (shareMenuRef.current && !shareMenuRef.current.contains(event.target as Node)) {
        setActiveShareMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function handleShareToInstagram(confession: PersonalConfession) {
    setActiveShareMenu(null);
    const userName = displayName || link || undefined;
    const blob = await createConfessionImage(confession.content, userName);
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    
    if (isMobile) {
      // On mobile, use Web Share API which allows selecting Instagram Stories
      const file = new File([blob], "confession.png", { type: "image/png" });
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file] });
          return;
        } catch {}
      }
    }
    
    // Fallback: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confession-${userName || "story"}.png`;
    a.click();
    URL.revokeObjectURL(url);
    
    if (isMobile) {
      alert("Image saved! Open Instagram → Your Story → Select from gallery");
    } else {
      alert("Image downloaded! On your phone: Open Instagram → Your Story → Select the image from gallery");
    }
  }

  function handleShareToWhatsApp(confession: PersonalConfession) {
    setActiveShareMenu(null);
    const linkUrl = link ? `${window.location.origin}/u/${link}` : "";
    const text = `"${confession.content}"\n\nSend me anonymous messages: ${linkUrl}`;
    
    // Use WhatsApp status share intent on mobile
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    if (isMobile) {
      // This opens WhatsApp with share intent
      window.location.href = `whatsapp://send?text=${encodeURIComponent(text)}`;
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  }

  async function handleDownloadImage(confession: PersonalConfession) {
    setActiveShareMenu(null);
    const userName = displayName || link || undefined;
    const blob = await createConfessionImage(confession.content, userName);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confession-${userName || "story"}.png`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function handleCopyConfession(confession: PersonalConfession) {
    setActiveShareMenu(null);
    const linkUrl = link ? `${window.location.origin}/u/${link}` : "";
    const text = `"${confession.content}"\n\nSend me anonymous messages: ${linkUrl}`;
    await navigator.clipboard.writeText(text);
  }

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const result = await getMyPersonalLink();
    if (result.success && result.data) {
      setLink(result.data.link);
      setConfessions(result.data.confessions);
    }
    setIsLoading(false);
  }

  async function handleGenerateLink() {
    setIsGenerating(true);
    const result = await generatePersonalLink();
    if (result.success && result.data) {
      setLink(result.data.link);
    }
    setIsGenerating(false);
  }

  async function handleCopyLink() {
    if (!link) return;
    const fullUrl = `${window.location.origin}/u/${link}`;
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleShareToStories(confessionId: string) {
    setSharingId(confessionId);
    const result = await shareToStories(confessionId);
    if (result.success) {
      // Reload to update the UI
      await loadData();
    }
    setSharingId(null);
  }

  async function handleSaveDisplayName() {
    setIsSavingName(true);
    await updateDisplayName(displayName);
    setIsSavingName(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 w-48 rounded bg-gray-200" />
          <div className="h-32 rounded bg-gray-200" />
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Confession Link</h1>
        <p className="text-gray-600">Share your link to receive anonymous messages</p>
      </div>

      {/* Link Card */}
      <Card className="mb-6 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardContent className="pt-6">
          {link ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Link2 className="h-5 w-5 text-indigo-600" />
                <span className="font-medium text-indigo-900">Your personal link:</span>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex-1 rounded-lg border border-indigo-200 bg-white px-4 py-3">
                  <code className="text-sm text-indigo-700 break-all">
                    {typeof window !== "undefined" ? `${window.location.origin}/u/${link}` : `/u/${link}`}
                  </code>
                </div>
                <Button
                  onClick={handleCopyLink}
                  className="gap-2 bg-indigo-600 hover:bg-indigo-700"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" />
                      Copy
                    </>
                  )}
                </Button>
              </div>

              <p className="text-sm text-indigo-700">
                Share this link on Instagram, WhatsApp, Twitter, or anywhere! Anyone with this link can send you anonymous messages.
              </p>

              {/* Optional Display Name */}
              <div className="border-t border-indigo-200 pt-4">
                <label className="mb-2 block text-sm font-medium text-indigo-900">
                  Display Name (optional)
                </label>
                <div className="flex gap-2">
                  <Input
                    placeholder="e.g., Your name or nickname"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="flex-1"
                  />
                  <Button
                    variant="outline"
                    onClick={handleSaveDisplayName}
                    disabled={isSavingName}
                  >
                    {isSavingName ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100">
                <Link2 className="h-8 w-8 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Create Your Personal Link</h3>
                <p className="text-sm text-gray-600">
                  Generate a unique link to receive anonymous confessions. No login required!
                </p>
              </div>
              <Button
                onClick={handleGenerateLink}
                disabled={isGenerating}
                className="gap-2 bg-indigo-600 hover:bg-indigo-700"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate My Link
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Received Messages */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
            <MessageCircle className="h-5 w-5" />
            Received Messages ({confessions.length})
          </h2>
          <Button variant="ghost" size="sm" onClick={loadData}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>

        {confessions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <MessageCircle className="mx-auto mb-4 h-12 w-12 text-gray-300" />
              <p className="text-gray-500">No messages yet. Share your link to start receiving confessions!</p>
            </CardContent>
          </Card>
        ) : (
          confessions.map((confession) => (
            <Card key={confession.id} className="overflow-hidden">
              <CardContent className="pt-6">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {formatRelativeTime(confession.createdAt)}
                  </span>
                  <div className="flex items-center gap-2">
                    {confession.sharedToStories && (
                      <Badge variant="success" className="gap-1">
                        <Share2 className="h-3 w-3" />
                        On Stories
                      </Badge>
                    )}
                    <div className="relative" ref={activeShareMenu === confession.id ? shareMenuRef : null}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="gap-1"
                        onClick={() => setActiveShareMenu(activeShareMenu === confession.id ? null : confession.id)}
                      >
                        <Share2 className="h-3 w-3" />
                        Share
                      </Button>
                      
                      {activeShareMenu === confession.id && (
                        <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-lg border bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700">
                          <div className="p-1">
                            <button
                              onClick={() => handleShareToInstagram(confession)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Instagram className="h-4 w-4 text-pink-500" />
                              Add to IG Story
                            </button>
                            <button
                              onClick={() => handleShareToWhatsApp(confession)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <WhatsAppIcon className="h-4 w-4 text-green-500" />
                              Share to WhatsApp
                            </button>
                            <button
                              onClick={() => handleCopyConfession(confession)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Copy className="h-4 w-4 text-gray-500" />
                              Copy Text
                            </button>
                            <button
                              onClick={() => handleDownloadImage(confession)}
                              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                            >
                              <Download className="h-4 w-4 text-blue-500" />
                              Download Image
                            </button>
                            {!confession.sharedToStories && (
                              <>
                                <div className="my-1 border-t dark:border-gray-700" />
                                <button
                                  onClick={() => {
                                    setActiveShareMenu(null);
                                    handleShareToStories(confession.id);
                                  }}
                                  disabled={sharingId === confession.id}
                                  className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20"
                                >
                                  <Sparkles className="h-4 w-4" />
                                  {sharingId === confession.id ? "Sharing..." : "Share to Stories"}
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <p className="whitespace-pre-wrap text-gray-800">{confession.content}</p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
