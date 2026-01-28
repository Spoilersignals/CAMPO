"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Send, AlertCircle, CheckCircle2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitSpotted } from "@/actions/spotted";

export default function NewSpottedPage() {
  const [content, setContent] = useState("");
  const [location, setLocation] = useState("");
  const [spottedDate, setSpottedDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !location.trim()) {
      setError("Please describe what you spotted and where");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setSuccessMessage("");

    const result = await submitSpotted({
      content,
      location,
      spottedAt: spottedDate ? new Date(spottedDate) : undefined,
    });

    if (result.success) {
      setContent("");
      setLocation("");
      setSpottedDate("");
      setSuccessMessage("Your sighting has been submitted! It will appear after moderation.");
    } else {
      setError(result.error || "Failed to submit");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/spotted"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to spotted
      </Link>

      <div className="mb-6">
        <h1 className="flex items-center gap-2 text-2xl font-bold text-amber-600">
          <Eye className="h-6 w-6" />
          Share a Sighting
        </h1>
        <p className="text-gray-600">Spotted something interesting on campus? Share it anonymously!</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Textarea
                placeholder="What did you spot? Describe the moment..."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none"
                maxLength={1000}
              />
              <div className="mt-2 text-right text-sm text-gray-500">
                {content.length}/1000
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                placeholder="Location (e.g., Library, Cafeteria)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                required
              />
              <Input
                type="datetime-local"
                value={spottedDate}
                onChange={(e) => setSpottedDate(e.target.value)}
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
              disabled={isSubmitting || !content.trim() || !location.trim()}
              className="w-full gap-2 bg-amber-600 hover:bg-amber-700"
            >
              {isSubmitting ? (
                "Submitting..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Submit Sighting
                </>
              )}
            </Button>

            <p className="text-center text-xs text-gray-500">
              All posts are reviewed before being published. Be respectful and don&apos;t include real names.
            </p>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-lg bg-amber-50 p-4">
        <h3 className="font-medium text-amber-900">What makes a great sighting:</h3>
        <ul className="mt-2 space-y-1 text-sm text-amber-700">
          <li>• Funny or wholesome campus moments</li>
          <li>• Interesting things you noticed</li>
          <li>• Random acts of kindness</li>
          <li>• Keep it positive and respectful!</li>
        </ul>
      </div>
    </div>
  );
}
