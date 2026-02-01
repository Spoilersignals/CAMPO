"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Upload, X, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createMeme } from "@/actions/memes";

export default function NewMemePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be less than 5MB");
      return;
    }

    setError("");
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith("image/")) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image must be less than 5MB");
        return;
      }
      setError("");
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }

  function clearImage() {
    setImagePreview(null);
    setImageFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!imageFile) {
      setError("Please select an image");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      setIsUploading(true);
      const uploadFormData = new FormData();
      uploadFormData.append("file", imageFile);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const { url: imageUrl } = await uploadRes.json();
      setIsUploading(false);

      const formData = new FormData();
      formData.append("imageUrl", imageUrl);
      if (title) formData.append("title", title);
      if (caption) formData.append("caption", caption);

      const result = await createMeme(formData);

      if (result.success) {
        setSuccessMessage("Your meme has been submitted for review! It will appear once approved. 🎉");
        setImagePreview(null);
        setImageFile(null);
        setTitle("");
        setCaption("");
        setTimeout(() => {
          router.push("/memes");
        }, 2000);
      } else {
        setError(result.error || "Failed to submit meme");
      }
    } catch (err) {
      setError("Failed to upload image. Please try again.");
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <Link
        href="/memes"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 transition-colors hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to memes
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
          <span className="text-3xl">🖼️</span> Post a Meme
        </h1>
        <p className="text-gray-600">Share your dankest meme with the campus</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Image <span className="text-red-500">*</span>
              </label>
              {imagePreview ? (
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <div className="relative aspect-square w-full bg-gray-100">
                    <Image
                      src={imagePreview}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute right-2 top-2 rounded-full bg-black/50 p-1 text-white transition-colors hover:bg-black/70"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  onDrop={handleDrop}
                  onDragOver={(e) => e.preventDefault()}
                  className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 transition-colors hover:border-indigo-400 hover:bg-indigo-50"
                >
                  <ImageIcon className="mb-2 h-12 w-12 text-gray-400" />
                  <p className="mb-1 text-sm font-medium text-gray-700">
                    Click or drag to upload
                  </p>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Title <span className="text-gray-400">(optional)</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your meme a catchy title..."
                maxLength={100}
              />
              <p className="mt-1 text-xs text-gray-500">{title.length}/100</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-700">
                Caption <span className="text-gray-400">(optional)</span>
              </label>
              <Textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Add some context or a funny caption..."
                maxLength={500}
                className="min-h-[100px]"
              />
              <p className="mt-1 text-xs text-gray-500">{caption.length}/500</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={!imageFile || isSubmitting}
              className="w-full gap-2 bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600"
            >
              {isUploading ? (
                <>
                  <Upload className="h-4 w-4 animate-bounce" />
                  Uploading...
                </>
              ) : isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Upload className="h-4 w-4" />
                  Submit Meme
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500">
              All memes are reviewed before being posted. Keep it fun and respectful! 🙏
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
