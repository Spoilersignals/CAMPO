"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Heart,
  Sparkles,
  ArrowLeft,
  Send,
  User,
  MapPin,
  MessageSquareHeart,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { createCompliment } from "@/actions/compliments";
import { cn } from "@/lib/utils";

export default function NewComplimentPage() {
  const router = useRouter();
  const [recipientName, setRecipientName] = useState("");
  const [recipientHint, setRecipientHint] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    const result = await createCompliment(
      recipientName,
      recipientHint || null,
      message
    );

    if (result.success) {
      router.push("/compliments?sent=true");
    } else {
      setError(result.error || "Failed to send compliment");
      setIsSubmitting(false);
    }
  }

  const isValid =
    recipientName.trim().length > 0 && message.trim().length >= 10;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      {/* Back Button */}
      <Link
        href="/compliments"
        className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-pink-600 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Compliments Wall
      </Link>

      {/* Header */}
      <div className="mb-8 text-center">
        <div className="mb-4 inline-flex items-center justify-center">
          <div className="relative">
            <Heart className="h-16 w-16 text-pink-500 animate-pulse" />
            <Sparkles className="absolute -top-1 -right-1 h-6 w-6 text-yellow-400" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Send a Secret Compliment
        </h1>
        <p className="text-gray-600">
          Brighten someone&apos;s day with anonymous kind words
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Form */}
        <Card className="border-pink-100">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Recipient Name */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <User className="h-4 w-4 text-pink-500" />
                  Who is this for?
                </label>
                <Input
                  placeholder="Their name or how people know them..."
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  maxLength={100}
                />
                <p className="mt-1 text-xs text-gray-400">
                  e.g., &quot;Sarah from CS class&quot;, &quot;The tall guy at
                  the gym&quot;
                </p>
              </div>

              {/* Hint */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MapPin className="h-4 w-4 text-rose-400" />
                  Any hints? (Optional)
                </label>
                <Input
                  placeholder="Help them find this..."
                  value={recipientHint}
                  onChange={(e) => setRecipientHint(e.target.value)}
                  className="border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  maxLength={150}
                />
                <p className="mt-1 text-xs text-gray-400">
                  e.g., &quot;Studies Engineering&quot;, &quot;Lives in Block
                  A&quot;, &quot;Works at the library&quot;
                </p>
              </div>

              {/* Message */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <MessageSquareHeart className="h-4 w-4 text-pink-500" />
                  Your message
                </label>
                <Textarea
                  placeholder="Write something sweet..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="min-h-[150px] border-pink-200 focus:border-pink-400 focus:ring-pink-400"
                  maxLength={1000}
                />
                <div className="mt-1 flex justify-between">
                  <p className="text-xs text-gray-400">
                    Min 10 characters. Be kind and genuine!
                  </p>
                  <span
                    className={cn(
                      "text-xs",
                      message.length < 10 ? "text-gray-400" : "text-pink-500"
                    )}
                  >
                    {message.length}/1000
                  </span>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowPreview(!showPreview)}
                  className="flex-1 border-pink-200 text-pink-600 hover:bg-pink-50"
                  disabled={!isValid}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  {showPreview ? "Hide Preview" : "Preview"}
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
                >
                  {isSubmitting ? (
                    <Spinner size="sm" className="mr-2" />
                  ) : (
                    <Send className="mr-2 h-4 w-4" />
                  )}
                  Send Anonymously
                </Button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Your identity remains completely anonymous. Compliments are
                reviewed before posting.
              </p>
            </form>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <div
          className={cn(
            "transition-all duration-300",
            showPreview && isValid
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-4 lg:opacity-100 lg:translate-y-0"
          )}
        >
          <p className="mb-3 text-sm font-medium text-gray-500 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-yellow-500" />
            Preview
          </p>
          <Card className="border-pink-200 bg-gradient-to-br from-white via-pink-50/30 to-rose-50/50 shadow-lg shadow-pink-100/50">
            <CardContent className="pt-6">
              {/* Decorative Hearts */}
              <div className="absolute top-2 right-2 flex gap-1">
                <Heart className="h-3 w-3 text-pink-200" />
                <Heart className="h-4 w-4 text-pink-300" />
                <Heart className="h-3 w-3 text-pink-200" />
              </div>

              {/* Recipient */}
              <div className="mb-4 flex items-center gap-2">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-100 to-rose-100">
                  <Heart className="h-5 w-5 text-pink-500" />
                </div>
                <div>
                  <p className="font-semibold text-pink-700">
                    To: {recipientName || "Someone special"}
                  </p>
                  {recipientHint && (
                    <p className="text-sm text-rose-400 italic">
                      &quot;{recipientHint}&quot;
                    </p>
                  )}
                </div>
              </div>

              {/* Message */}
              <div className="relative rounded-lg bg-white/70 p-4 shadow-inner">
                <p className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                  {message || "Your heartfelt message will appear here..."}
                </p>
              </div>

              {/* Reactions Preview */}
              <div className="mt-4 flex items-center gap-2 border-t border-pink-100 pt-4">
                <span className="text-xs text-gray-400">
                  People can react with:
                </span>
                <div className="flex gap-1">
                  {["❤️", "🥰", "😊", "💕", "✨"].map((emoji) => (
                    <span
                      key={emoji}
                      className="rounded-full bg-pink-50 px-2 py-1 text-sm"
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tips */}
          <div className="mt-6 rounded-lg bg-gradient-to-r from-pink-50 to-rose-50 p-4">
            <h3 className="mb-2 font-medium text-pink-700 flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              Tips for great compliments
            </h3>
            <ul className="space-y-1 text-sm text-gray-600">
              <li>• Be specific about what you appreciate</li>
              <li>• Focus on character traits or actions</li>
              <li>• Keep it genuine and respectful</li>
              <li>• Make it something they&apos;d want to read</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
