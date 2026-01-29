"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Send,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Video,
  Link as LinkIcon,
  X,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { submitConfession } from "@/actions/confessions";

const MAX_CHARS = 2000;

export default function NewConfessionPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  const [mediaUrl, setMediaUrl] = useState("");
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);

  const [showLinkInput, setShowLinkInput] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkTitle, setLinkTitle] = useState("");
  const [linkImage, setLinkImage] = useState("");
  const [isLoadingLink, setIsLoadingLink] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const charCount = content.length;
  const charPercentage = (charCount / MAX_CHARS) * 100;
  const charCountColor =
    charPercentage >= 90
      ? "text-red-500"
      : charPercentage >= 75
      ? "text-amber-500"
      : "text-gray-500";

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select an image or video file");
      return;
    }

    setMediaType(isImage ? "image" : "video");

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setMediaPreview(dataUrl);
      setMediaUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  }

  function clearMedia() {
    setMediaUrl("");
    setMediaType(null);
    setMediaPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleLinkPaste() {
    if (!linkUrl.trim()) return;

    setIsLoadingLink(true);
    try {
      const url = new URL(linkUrl);
      setLinkTitle(url.hostname);
      setLinkImage("");
    } catch {
      setLinkTitle(linkUrl);
    }
    setIsLoadingLink(false);
  }

  function clearLink() {
    setLinkUrl("");
    setLinkTitle("");
    setLinkImage("");
    setShowLinkInput(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write something to confess");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const result = await submitConfession(content, {
      mediaUrl: mediaUrl || undefined,
      mediaType: mediaType || undefined,
      linkUrl: linkUrl || undefined,
      linkTitle: linkTitle || undefined,
      linkImage: linkImage || undefined,
    });

    if (result.success) {
      setContent("");
      clearMedia();
      clearLink();
      setSuccessMessage(
        "Your confession has been submitted for review! It will appear once approved."
      );
    } else {
      setError(result.error || "Failed to submit confession");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/confessions"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to confessions
      </Link>

      <div className="mb-6 animate-fadeIn">
        <h1 className="text-2xl font-bold text-gray-900">Post a Confession</h1>
        <p className="text-gray-600">
          Share your thoughts anonymously with the campus
        </p>
      </div>

      <Card className="card-lift overflow-hidden border-0 shadow-lg animate-fadeInUp">
        <div className="h-1 w-full gradient-purple" />
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind? Share your confession anonymously..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none border-gray-200 transition-all focus:border-purple-400 focus:ring-purple-400"
                maxLength={MAX_CHARS}
              />
              <div className="mt-2 flex justify-between text-sm">
                <span className="text-gray-500">Be honest, be anonymous</span>
                <span className={`font-medium transition-colors ${charCountColor}`}>
                  {charCount}/{MAX_CHARS}
                </span>
              </div>
            </div>

            {mediaPreview && (
              <div className="relative overflow-hidden rounded-lg border border-gray-200 animate-fadeIn">
                {mediaType === "image" ? (
                  <Image
                    src={mediaPreview}
                    alt="Preview"
                    width={600}
                    height={400}
                    className="max-h-64 w-full object-cover"
                  />
                ) : (
                  <video
                    src={mediaPreview}
                    controls
                    className="max-h-64 w-full"
                  />
                )}
                <button
                  type="button"
                  onClick={clearMedia}
                  className="absolute right-2 top-2 rounded-full bg-black/50 p-1.5 text-white transition-colors hover:bg-black/70"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {showLinkInput && (
              <div className="space-y-2 animate-fadeIn">
                <div className="flex gap-2">
                  <Input
                    type="url"
                    placeholder="Paste a link..."
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    onBlur={handleLinkPaste}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={clearLink}
                    className="px-2"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                {isLoadingLink && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading preview...
                  </div>
                )}
                {linkTitle && !isLoadingLink && (
                  <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3">
                    <LinkIcon className="h-5 w-5 text-gray-400" />
                    <div className="flex-1 truncate">
                      <p className="font-medium text-gray-900 truncate">
                        {linkTitle}
                      </p>
                      <p className="text-sm text-gray-500 truncate">{linkUrl}</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center gap-2 border-t border-gray-100 pt-4">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/*,video/*"
                className="hidden"
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                disabled={!!mediaPreview}
              >
                <ImageIcon className="h-4 w-4" />
                Photo
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                disabled={!!mediaPreview}
              >
                <Video className="h-4 w-4" />
                Video
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setShowLinkInput(true)}
                className="gap-2 text-gray-600 hover:text-purple-600 transition-colors"
                disabled={showLinkInput}
              >
                <LinkIcon className="h-4 w-4" />
                Link
              </Button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600 animate-fadeIn">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600 animate-fadeIn">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {successMessage}
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Confession
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              All confessions are reviewed before being published. No personal
              information is stored.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg bg-gradient-to-br from-purple-50 to-indigo-50 p-4 border border-purple-100 animate-fadeIn">
        <h3 className="font-medium text-purple-900">
          Tips for a great confession:
        </h3>
        <ul className="mt-2 space-y-1 text-sm text-purple-700">
          <li>• Be honest and genuine</li>
          <li>• Don&apos;t include names or identifying information</li>
          <li>• Keep it respectful - no hate speech or harassment</li>
          <li>• Remember: everyone has secrets, you&apos;re not alone</li>
        </ul>
      </div>
    </div>
  );
}
