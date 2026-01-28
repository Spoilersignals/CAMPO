"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitCrush } from "@/actions/crushes";

export default function NewCrushPage() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [seenAt, setSeenAt] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in the title and description");
      return;
    }

    setError("");
    setSuccessMessage("");

    startTransition(async () => {
      const result = await submitCrush({
        title,
        description,
        location: location || undefined,
        seenAt: seenAt ? new Date(seenAt) : undefined,
      });

      if (result.success) {
        setTitle("");
        setDescription("");
        setLocation("");
        setSeenAt("");
        setSuccessMessage("Your crush has been submitted! It will appear after moderation.");
      } else {
        setError(result.error || "Failed to submit crush");
      }
    });
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/crushes"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to crushes
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-pink-600">
          <Heart className="h-6 w-6" />
          Share Your Campus Crush
        </h1>
        <p className="text-gray-600">Describe someone who caught your eye anonymously</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="Give them a nickname (e.g., 'Library Cutie')"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                maxLength={100}
              />
            </div>

            <div>
              <Textarea
                placeholder="Describe what made them stand out... (hair, outfit, smile, vibe)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="min-h-[150px] resize-none"
                maxLength={1000}
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {description.length}/1000
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Where did you see them? (e.g., Library)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <Input
                type="datetime-local"
                value={seenAt}
                onChange={(e) => setSeenAt(e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 p-3 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                {successMessage}
              </div>
            )}

            <Button
              type="submit"
              disabled={isPending || !title.trim() || !description.trim()}
              className="w-full gap-2 bg-pink-600 hover:bg-pink-700"
            >
              {isPending ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Crush
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500">
              All posts are reviewed before being published. Be respectful and don&apos;t include real names.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg bg-pink-50 p-4">
        <h3 className="font-medium text-pink-900">Tips for a great crush post:</h3>
        <ul className="mt-2 space-y-1 text-sm text-pink-700">
          <li>• Describe their appearance, not their identity</li>
          <li>• Mention where and when you saw them</li>
          <li>• Keep it wholesome and respectful</li>
          <li>• Maybe they&apos;ll see it and reach out! 💕</li>
        </ul>
      </div>
    </div>
  );
}
