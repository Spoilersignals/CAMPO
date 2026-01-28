"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { submitConfession } from "@/actions/confessions";

export default function NewConfessionPage() {
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) {
      setError("Please write something to confess");
      return;
    }
    
    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const result = await submitConfession(content);

    if (result.success) {
      setContent("");
      setSuccessMessage("Your confession has been submitted for review! It will appear once approved.");
    } else {
      setError(result.error || "Failed to submit confession");
    }

    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/confessions"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to confessions
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Post a Confession</h1>
        <p className="text-gray-600">Share your thoughts anonymously with the campus</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="What's on your mind? Share your confession anonymously..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[200px] resize-none"
                maxLength={2000}
              />
              <div className="mt-2 flex justify-between text-sm text-gray-500">
                <span>Be honest, be anonymous</span>
                <span>{content.length}/2000</span>
              </div>
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

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting || !content.trim()}
                className="flex-1 gap-2 bg-purple-600 hover:bg-purple-700"
              >
                {isSubmitting ? (
                  "Submitting..."
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Submit Confession
                  </>
                )}
              </Button>
            </div>

            <p className="text-center text-xs text-gray-500">
              All confessions are reviewed before being published. No personal information is stored.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg bg-purple-50 p-4">
        <h3 className="font-medium text-purple-900">Tips for a great confession:</h3>
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
