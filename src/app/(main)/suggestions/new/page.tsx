"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Lightbulb,
  Clock,
  CheckCircle,
  User,
  Loader2,
  X,
  Sparkles,
  Shield,
} from "lucide-react";
import { createSuggestion } from "@/actions/suggestions";
import { cn } from "@/lib/utils";

function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("suggestion-session-id");
  if (!sessionId) {
    sessionId = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("suggestion-session-id", sessionId);
  }
  return sessionId;
}

type Toast = { message: string; type: "success" | "error" } | null;

export default function NewSuggestionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [content, setContent] = useState("");
  const [toast, setToast] = useState<Toast>(null);
  const [isPending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || isPending) return;

    startTransition(async () => {
      const result = await createSuggestion(content.trim(), sessionId);
      if (result.success) {
        setToast({ message: "Request posted successfully!", type: "success" });
        setTimeout(() => {
          router.push("/suggestions");
        }, 1000);
      } else {
        setToast({ message: result.error || "Failed to create request", type: "error" });
      }
    });
  }

  const isLoggedIn = !!session?.user;
  const charCount = content.length;
  const isValidLength = charCount >= 5 && charCount <= 200;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Toast Notification */}
      {toast && (
        <div
          className={cn(
            "fixed top-4 right-4 z-50 flex items-center gap-3 rounded-xl px-5 py-4 shadow-2xl backdrop-blur-sm transition-all animate-slide-up",
            toast.type === "success"
              ? "bg-emerald-500/90 text-white"
              : "bg-red-500/90 text-white"
          )}
        >
          {toast.type === "success" ? (
            <CheckCircle className="h-5 w-5" />
          ) : (
            <X className="h-5 w-5" />
          )}
          {toast.message}
          <button onClick={() => setToast(null)} className="ml-2 hover:opacity-70">
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <div className="relative z-10 mx-auto max-w-2xl px-4 py-8">
        {/* Back Link */}
        <Link
          href="/suggestions"
          className="inline-flex items-center gap-2 text-purple-300 hover:text-white transition-colors mb-8"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Suggestions
        </Link>

        {/* Main Card */}
        <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm overflow-hidden">
          {/* Header */}
          <div className="p-8 border-b border-white/10 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
              <Lightbulb className="h-10 w-10 text-yellow-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-3">
              What Do You Need?
            </h1>
            <p className="text-purple-200/70 max-w-md mx-auto">
              Describe what you&apos;re looking for and sellers on campus will come to you with offers.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-8">
            <div className="mb-6">
              <label className="block text-sm font-medium text-purple-200/90 mb-3">
                Describe what you need
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="e.g., House fan for my room, Laptop charger (HP), Used textbook for Physics 101..."
                className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/50 focus:outline-none min-h-[120px] transition-all"
                maxLength={200}
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-purple-300/50">
                  Be specific for better responses
                </span>
                <span
                  className={cn(
                    "text-sm",
                    charCount < 5 ? "text-amber-400" : charCount > 180 ? "text-amber-400" : "text-purple-300/50"
                  )}
                >
                  {charCount}/200
                </span>
              </div>
            </div>

            {/* Info Cards */}
            <div className="grid gap-4 sm:grid-cols-2 mb-8">
              <div
                className={cn(
                  "rounded-xl p-4 border transition-all",
                  isLoggedIn
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : "border-white/10 bg-white/5"
                )}
              >
                <div className="flex items-center gap-3 mb-2">
                  <div
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-full",
                      isLoggedIn ? "bg-emerald-500/20" : "bg-white/10"
                    )}
                  >
                    <User className={cn("h-4 w-4", isLoggedIn ? "text-emerald-400" : "text-purple-300")} />
                  </div>
                  <span className={cn("font-medium", isLoggedIn ? "text-emerald-300" : "text-purple-200")}>
                    {isLoggedIn ? "Logged In" : "Anonymous"}
                  </span>
                </div>
                <p className="text-sm text-purple-200/60">
                  {isLoggedIn
                    ? "Your request stays until you remove it"
                    : "Posting as anonymous user"}
                </p>
              </div>

              <div className="rounded-xl p-4 border border-white/10 bg-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-500/20">
                    <Clock className="h-4 w-4 text-amber-400" />
                  </div>
                  <span className="font-medium text-purple-200">Expires in</span>
                </div>
                <p className="text-sm text-purple-200/60">
                  {isLoggedIn ? "Never (until you remove)" : "36 hours from posting"}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!isValidLength || isPending}
              className="w-full rounded-xl bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 bg-[length:200%_100%] px-6 py-4 font-semibold text-white shadow-2xl shadow-purple-500/25 transition-all hover:bg-right hover:shadow-purple-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Posting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  Post My Request
                </span>
              )}
            </button>

            {!isLoggedIn && (
              <p className="mt-4 text-center text-sm text-purple-200/60">
                <Link href="/register" className="text-purple-300 hover:text-white underline">
                  Create an account
                </Link>{" "}
                for permanent requests and notifications
              </p>
            )}
          </form>
        </div>

        {/* How it Works */}
        <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="h-5 w-5 text-emerald-400" />
            How It Works
          </h3>
          <ul className="space-y-3">
            {[
              "Your request will be visible to all sellers on campus",
              "Sellers with matching items can respond with offers",
              "You'll get notified when someone responds (if logged in)",
              "Connect directly with sellers to complete your purchase",
            ].map((item, index) => (
              <li
                key={index}
                className="flex items-start gap-3 text-purple-200/70 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <CheckCircle className="h-5 w-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
