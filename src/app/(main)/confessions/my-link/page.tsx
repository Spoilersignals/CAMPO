"use client";

import { useState, useEffect, useRef } from "react";
import { Copy, Check, Link2, MessageCircle, RefreshCw, Share2, Sparkles, Instagram, Download, MoreVertical, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { 
  generatePersonalLink, 
  getMyPersonalLink, 
  shareToStories,
  updateDisplayName,
  updatePersonalLinkCode 
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

    // Card dimensions - calculate based on content length
    const cardX = 80;
    const cardWidth = canvas.width - 160;
    const cornerRadius = 40;
    const headerHeight = 180;
    const padding = 60;
    
    // Determine font size and line height based on content length
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

    // Draw gradient header (pink to orange) - top portion of card
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
    ctx.font = `bold ${fontSize}px system-ui`;
    ctx.textAlign = "center";
    
    let y = cardY + headerHeight + padding;
    for (const line of lines) {
      ctx.fillText(line, canvas.width / 2, y);
      y += lineHeight;
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
  const [linkCode, setLinkCode] = useState<string>("");
  const [confessions, setConfessions] = useState<PersonalConfession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sharingId, setSharingId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [activeShareMenu, setActiveShareMenu] = useState<string | null>(null);
  const shareMenuRef = useRef<HTMLDivElement>(null);
  
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [editCodeValue, setEditCodeValue] = useState("");
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isSavingCode, setIsSavingCode] = useState(false);

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
    const linkUrl = link ? `${window.location.origin}/u/${link}` : window.location.origin;
    
    const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const isAndroid = /Android/i.test(navigator.userAgent);
    
    if (isMobile) {
      // First, save image to device and copy link to clipboard
      const file = new File([blob], "confession.png", { type: "image/png" });
      
      // Copy link to clipboard so user can paste it as link sticker
      try {
        await navigator.clipboard.writeText(linkUrl);
      } catch {}
      
      // Try to share the image file first
      if (navigator.share && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ 
            files: [file],
            title: "Share to Instagram Story"
          });
          return;
        } catch {}
      }
      
      // Fallback: Download image then try to open Instagram Stories directly
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `confession-${userName || "story"}.png`;
      a.click();
      URL.revokeObjectURL(url);
      
      // Small delay then try opening Instagram Stories camera
      setTimeout(() => {
        if (isAndroid) {
          // Android intent for Instagram Stories
          window.location.href = "intent://story-camera#Intent;package=com.instagram.android;scheme=instagram;end";
        } else {
          // iOS deep link
          window.location.href = "instagram-stories://share";
        }
      }, 500);
      
      alert("Image saved & link copied! Select the image from your gallery and paste the link as a sticker.");
      return;
    }
    
    // Desktop: download the image
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `confession-${userName || "story"}.png`;
    a.click();
    URL.revokeObjectURL(url);
    
    alert("Image downloaded! On your phone: Open Instagram → Your Story → Select the image from gallery");
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
      setLinkCode(result.data.code || "");
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

  function validateCode(code: string): string | null {
    if (code.length < 3 || code.length > 20) {
      return "Code must be 3-20 characters";
    }
    if (!/^[a-z0-9_]+$/.test(code)) {
      return "Only lowercase letters, numbers, and underscores allowed";
    }
    return null;
  }

  function handleCodeInputChange(value: string) {
    const lowercased = value.toLowerCase().replace(/[^a-z0-9_]/g, "");
    setEditCodeValue(lowercased);
    if (lowercased.length > 0) {
      setCodeError(validateCode(lowercased));
    } else {
      setCodeError(null);
    }
  }

  async function handleSaveCode() {
    const error = validateCode(editCodeValue);
    if (error) {
      setCodeError(error);
      return;
    }

    setIsSavingCode(true);
    setCodeError(null);
    const result = await updatePersonalLinkCode(editCodeValue);
    if (result.success) {
      setLink(editCodeValue);
      setLinkCode(editCodeValue);
      setIsEditingCode(false);
    } else {
      setCodeError(result.error || "Failed to update code");
    }
    setIsSavingCode(false);
  }

  function handleStartEditCode() {
    setEditCodeValue(linkCode);
    setCodeError(null);
    setIsEditingCode(true);
  }

  function handleCancelEditCode() {
    setIsEditingCode(false);
    setEditCodeValue("");
    setCodeError(null);
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

              {/* Custom Link Code */}
              <div className="border-t border-indigo-200 pt-4">
                <label className="mb-2 block text-sm font-medium text-indigo-900">
                  Custom Link URL
                </label>
                {isEditingCode ? (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-lg border border-indigo-200 bg-white px-3 py-2 flex-1">
                        <span className="text-sm text-gray-500 mr-1">/u/</span>
                        <input
                          type="text"
                          value={editCodeValue}
                          onChange={(e) => handleCodeInputChange(e.target.value)}
                          className="flex-1 bg-transparent text-sm text-indigo-700 outline-none"
                          placeholder="your_custom_code"
                          maxLength={20}
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={handleSaveCode}
                        disabled={isSavingCode || !!codeError}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {isSavingCode ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleCancelEditCode}
                        disabled={isSavingCode}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    {codeError && (
                      <p className="text-sm text-red-600">{codeError}</p>
                    )}
                    <p className="text-xs text-gray-500">
                      3-20 characters, lowercase letters, numbers, and underscores only
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 rounded-lg border border-indigo-200 bg-white px-4 py-2">
                      <code className="text-sm text-indigo-700">/u/{linkCode}</code>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEditCode}
                      className="text-indigo-600 hover:text-indigo-700"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>

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
