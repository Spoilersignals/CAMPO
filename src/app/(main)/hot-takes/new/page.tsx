"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Flame, Send, CheckCircle2, Lightbulb } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createHotTake } from "@/actions/hot-takes";
import { cn } from "@/lib/utils";

const EXAMPLE_TAKES = [
  "The library is overrated for studying",
  "8am classes should be banned",
  "Campus food is actually good",
  "Group projects are better than solo work",
  "Online classes were superior",
  "Finals week is not that stressful",
];

const MAX_CHARS = 280;

export default function NewHotTakePage() {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const charCount = content.length;
  const isOverLimit = charCount > MAX_CHARS;
  const charPercentage = Math.min((charCount / MAX_CHARS) * 100, 100);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isOverLimit) return;

    setIsSubmitting(true);
    setError("");

    const result = await createHotTake(content);
    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/hot-takes");
      }, 2000);
    } else {
      setError(result.error || "Failed to submit hot take");
    }
  }

  function useExample(example: string) {
    setContent(example);
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-orange-500 to-red-500 p-8 text-center text-white">
            <CheckCircle2 className="mx-auto mb-4 h-16 w-16" />
            <h2 className="text-2xl font-bold">Hot Take Submitted! 🔥</h2>
            <p className="mt-2 text-orange-100">
              Your take will be reviewed and posted soon.
            </p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/hot-takes"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Hot Takes
      </Link>

      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <Flame className="h-7 w-7" />
            Drop Your Hot Take
          </CardTitle>
          <p className="text-orange-100">Share your unpopular opinion with campus</p>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Text Area */}
            <div>
              <div className="relative">
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="What's your hot take? 🌶️"
                  className={cn(
                    "min-h-[150px] w-full resize-none rounded-xl border-2 p-4 text-lg font-medium placeholder:text-gray-400 focus:outline-none focus:ring-0",
                    isOverLimit
                      ? "border-red-400 focus:border-red-500"
                      : "border-orange-200 focus:border-orange-500"
                  )}
                />
                {/* Character count ring */}
                <div className="absolute bottom-4 right-4 flex items-center gap-2">
                  <svg className="h-8 w-8 -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke="#e5e7eb"
                      strokeWidth="3"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      fill="none"
                      stroke={isOverLimit ? "#ef4444" : charPercentage > 80 ? "#f97316" : "#22c55e"}
                      strokeWidth="3"
                      strokeDasharray={`${charPercentage * 0.88} 88`}
                      className="transition-all duration-200"
                    />
                  </svg>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      isOverLimit ? "text-red-500" : charPercentage > 80 ? "text-orange-500" : "text-gray-500"
                    )}
                  >
                    {MAX_CHARS - charCount}
                  </span>
                </div>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !content.trim() || isOverLimit}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 py-6 text-lg font-bold hover:from-orange-600 hover:to-red-600"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" className="mr-2" />
                  Submitting...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-5 w-5" />
                  Drop It Like It&apos;s Hot 🔥
                </>
              )}
            </Button>
          </form>

          {/* Examples */}
          <div className="mt-8 border-t border-gray-100 pt-6">
            <div className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
              <Lightbulb className="h-4 w-4 text-orange-500" />
              Need inspiration? Try one of these:
            </div>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_TAKES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => useExample(example)}
                  className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1.5 text-sm text-orange-700 transition-all hover:bg-orange-100 hover:border-orange-300"
                >
                  {example}
                </button>
              ))}
            </div>
          </div>

          {/* Guidelines */}
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-2 font-medium text-gray-900">Guidelines:</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Keep it campus-related and fun</li>
              <li>• No hate speech or personal attacks</li>
              <li>• Hot takes are anonymous</li>
              <li>• Your take will be reviewed before posting</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
