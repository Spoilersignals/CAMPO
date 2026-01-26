"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Send, User, CheckCircle, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { getPersonalLinkInfo, sendPersonalConfession } from "@/actions/personal-confessions";

type LinkInfo = {
  id: string;
  displayName: string | null;
};

export default function SendConfessionPage() {
  const params = useParams();
  const username = params.username as string;
  const [linkInfo, setLinkInfo] = useState<LinkInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    loadLinkInfo();
  }, [username]);

  async function loadLinkInfo() {
    const result = await getPersonalLinkInfo(username);
    if (result.success && result.data) {
      setLinkInfo(result.data);
    }
    setIsLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const result = await sendPersonalConfession(username, content);

    if (result.success) {
      setSent(true);
      setContent("");
    } else {
      setError(result.error || "Failed to send message");
    }

    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500">
        <div className="animate-pulse text-white">Loading...</div>
      </div>
    );
  }

  if (!linkInfo) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <h2 className="mb-2 text-xl font-bold text-gray-900">Link Not Found</h2>
            <p className="mb-4 text-gray-600">This confession link doesn&apos;t exist or has been removed.</p>
            <Link href="/confessions">
              <Button>Browse Confessions</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4">
        <Card className="w-full max-w-md text-center">
          <CardContent className="py-12">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Message Sent!</h2>
            <p className="mb-6 text-gray-600">
              Your anonymous message has been delivered.
            </p>
            <div className="space-y-3">
              <Button onClick={() => setSent(false)} className="w-full">
                Send Another Message
              </Button>
              <Link href="/confessions/my-link" className="block">
                <Button variant="outline" className="w-full">
                  Create Your Own Link
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 px-4 py-8">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6">
          {/* User Info */}
          <div className="mb-6 flex flex-col items-center">
            <div className="mb-3 flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-gradient-to-br from-indigo-400 to-purple-500 shadow-lg">
              <MessageCircle className="h-10 w-10 text-white" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">
              {linkInfo.displayName || "Anonymous"}
            </h2>
            <p className="text-sm text-gray-500">Send an anonymous message</p>
          </div>

          {/* Message Form */}
          <form onSubmit={handleSubmit}>
            <div className="relative mb-4">
              <Textarea
                placeholder="Write your anonymous message... 💭"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="min-h-[150px] resize-none pr-4"
                maxLength={2000}
              />
              <div className="absolute bottom-2 right-2 text-xs text-gray-400">
                {content.length}/2000
              </div>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting || content.trim().length < 10}
              className="w-full gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="h-4 w-4" />
                  Send Anonymously
                </>
              )}
            </Button>

            <p className="mt-3 text-center text-xs text-gray-500">
              Your identity is completely anonymous. They won&apos;t know who sent this.
            </p>
          </form>
        </CardContent>
      </Card>

      {/* CTA */}
      <div className="mt-6 text-center">
        <p className="mb-2 text-white/80">Want your own link?</p>
        <Link href="/confessions/my-link">
          <Button variant="outline" className="border-white/30 bg-white/10 text-white hover:bg-white/20">
            <MessageCircle className="mr-2 h-4 w-4" />
            Create Your Link
          </Button>
        </Link>
      </div>

      {/* Branding */}
      <div className="mt-8 text-center text-sm text-white/60">
        Powered by{" "}
        <Link href="/" className="font-semibold text-white hover:underline">
          ComradeZone
        </Link>
      </div>
    </div>
  );
}
