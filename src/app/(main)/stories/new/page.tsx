"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Image as ImageIcon,
  Video,
  Type,
  Clock,
  Loader2,
  X,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { createStory } from "@/actions/stories";
import { cn } from "@/lib/utils";

const BACKGROUND_OPTIONS = [
  { id: "purple", class: "bg-gradient-to-br from-purple-600 to-pink-500" },
  { id: "blue", class: "bg-gradient-to-br from-blue-600 to-cyan-500" },
  { id: "green", class: "bg-gradient-to-br from-green-600 to-emerald-500" },
  { id: "orange", class: "bg-gradient-to-br from-orange-500 to-red-500" },
  { id: "indigo", class: "bg-gradient-to-br from-indigo-600 to-purple-500" },
  { id: "pink", class: "bg-gradient-to-br from-pink-500 to-rose-500" },
  { id: "dark", class: "bg-gradient-to-br from-gray-800 to-gray-900" },
  { id: "teal", class: "bg-gradient-to-br from-teal-500 to-cyan-600" },
];

type StoryMode = "text" | "media";

export default function NewStoryPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [mode, setMode] = useState<StoryMode>("text");
  const [content, setContent] = useState("");
  const [selectedBg, setSelectedBg] = useState(BACKGROUND_OPTIONS[0]);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<"image" | "video" | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");

    if (!isImage && !isVideo) {
      setError("Please select an image or video file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File must be less than 10MB");
      return;
    }

    setMediaFile(file);
    setMediaType(isImage ? "image" : "video");
    setMediaPreview(URL.createObjectURL(file));
    setMode("media");
    setError("");
  }

  function clearMedia() {
    setMediaFile(null);
    setMediaPreview(null);
    setMediaType(null);
    setMode("text");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit() {
    setError("");

    if (mode === "text" && !content.trim()) {
      setError("Please enter some text for your story");
      return;
    }

    if (mode === "media" && !mediaFile) {
      setError("Please select an image or video");
      return;
    }

    setIsSubmitting(true);

    try {
      let mediaUrl: string | undefined;

      if (mediaFile) {
        const formData = new FormData();
        formData.append("file", mediaFile);

        const uploadRes = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error("Failed to upload media");
        }

        const uploadData = await uploadRes.json();
        mediaUrl = uploadData.url;
      }

      const result = await createStory(
        mode === "text" ? content.trim() : undefined,
        mediaUrl,
        mediaType || undefined
      );

      if (result.success) {
        router.push("/stories");
      } else {
        setError(result.error || "Failed to create story");
      }
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/stories"
          className="flex items-center gap-2 text-gray-600 transition hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Back</span>
        </Link>
        <div className="flex items-center gap-2 rounded-full bg-amber-100 px-3 py-1.5 text-sm text-amber-800">
          <Clock className="h-4 w-4" />
          <span>Disappears in 24 hours</span>
        </div>
      </div>

      <h1 className="mb-2 text-2xl font-bold text-gray-900">
        Create Your Story
      </h1>
      <p className="mb-8 text-gray-600">
        Share a moment with campus. It&apos;s anonymous and ephemeral.
      </p>

      <div className="mb-6 flex gap-2">
        <button
          onClick={() => {
            setMode("text");
            clearMedia();
          }}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition",
            mode === "text"
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <Type className="h-5 w-5" />
          <span className="font-medium">Text</span>
        </button>
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-1 items-center justify-center gap-2 rounded-xl border-2 p-4 transition",
            mode === "media"
              ? "border-purple-500 bg-purple-50 text-purple-700"
              : "border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50"
          )}
        >
          <ImageIcon className="h-5 w-5" />
          <span className="font-medium">Photo/Video</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*,video/*"
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      <div className="mb-6 overflow-hidden rounded-2xl border border-gray-200 bg-gray-100 shadow-lg">
        <div className="relative aspect-[9/16] max-h-[500px]">
          {mode === "text" ? (
            <div
              className={cn(
                "flex h-full w-full items-center justify-center p-6",
                selectedBg.class
              )}
            >
              {content ? (
                <p className="max-w-full break-words text-center text-2xl font-bold text-white drop-shadow-lg md:text-3xl">
                  {content}
                </p>
              ) : (
                <p className="text-center text-xl text-white/60">
                  Your story preview...
                </p>
              )}
            </div>
          ) : mediaPreview ? (
            <div className="relative h-full w-full bg-black">
              {mediaType === "video" ? (
                <video
                  src={mediaPreview}
                  className="h-full w-full object-contain"
                  controls
                  muted
                />
              ) : (
                <img
                  src={mediaPreview}
                  alt="Preview"
                  className="h-full w-full object-contain"
                />
              )}
              <button
                onClick={clearMedia}
                className="absolute right-3 top-3 rounded-full bg-black/50 p-2 text-white transition hover:bg-black/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex h-full w-full flex-col items-center justify-center gap-4 bg-gray-200 transition hover:bg-gray-300"
            >
              <div className="flex gap-4">
                <ImageIcon className="h-12 w-12 text-gray-400" />
                <Video className="h-12 w-12 text-gray-400" />
              </div>
              <span className="text-gray-600">
                Click to upload image or video
              </span>
            </button>
          )}
        </div>
      </div>

      {mode === "text" && (
        <>
          <div className="mb-4">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Your Message
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={4}
              maxLength={500}
              className="resize-none"
            />
            <p className="mt-1 text-right text-sm text-gray-500">
              {content.length}/500
            </p>
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-700">
              Background Color
            </label>
            <div className="flex flex-wrap gap-2">
              {BACKGROUND_OPTIONS.map((bg) => (
                <button
                  key={bg.id}
                  onClick={() => setSelectedBg(bg)}
                  className={cn(
                    "h-10 w-10 rounded-full transition",
                    bg.class,
                    selectedBg.id === bg.id
                      ? "ring-2 ring-gray-900 ring-offset-2"
                      : "hover:scale-110"
                  )}
                >
                  {selectedBg.id === bg.id && (
                    <Check className="h-full w-full p-2 text-white" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="flex gap-3">
        <Button
          onClick={handleSubmit}
          disabled={
            isSubmitting ||
            (mode === "text" && !content.trim()) ||
            (mode === "media" && !mediaFile)
          }
          className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 py-6 text-lg font-semibold hover:from-purple-700 hover:to-pink-700"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Posting...
            </>
          ) : (
            "Post Story"
          )}
        </Button>
        <Link href="/stories">
          <Button variant="outline" className="py-6">
            Cancel
          </Button>
        </Link>
      </div>

      <p className="mt-4 text-center text-sm text-gray-500">
        🔒 Your story is completely anonymous
      </p>
    </div>
  );
}
