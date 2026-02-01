"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Plus,
  Clock,
  MessageCircle,
  User,
  CheckCircle,
  Loader2,
  Lightbulb,
  ShoppingBag,
  ArrowRight,
  Sparkles,
  X,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getActiveSuggestions,
  respondToSuggestion,
  getUserListings,
  type ItemSuggestionData,
} from "@/actions/suggestions";
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

export default function SuggestionsPage() {
  const { data: session } = useSession();
  const [suggestions, setSuggestions] = useState<ItemSuggestionData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [userListings, setUserListings] = useState<{ id: string; title: string; price: number }[]>([]);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    getSessionId();
    loadSuggestions();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (respondingTo && session?.user) {
      getUserListings().then((result) => {
        if (result.success) {
          setUserListings(result.listings);
        }
      });
    }
  }, [respondingTo, session?.user]);

  async function loadSuggestions() {
    setIsLoading(true);
    const result = await getActiveSuggestions(50);
    if (result.success) {
      setSuggestions(result.suggestions);
    }
    setIsLoading(false);
  }

  async function handleRespond(suggestionId: string) {
    if (!session?.user) {
      setToast({ message: "Please log in to respond", type: "error" });
      return;
    }

    startTransition(async () => {
      const result = await respondToSuggestion(
        suggestionId,
        responseMessage || undefined,
        selectedListing || undefined
      );
      if (result.success) {
        setRespondingTo(null);
        setResponseMessage("");
        setSelectedListing("");
        setToast({ message: "Response sent! The requester will be notified.", type: "success" });
        loadSuggestions();
      } else {
        setToast({ message: result.error || "Failed to respond", type: "error" });
      }
    });
  }

  const timeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const hours = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
    if (hours > 24 * 30) {
      return "Permanent";
    }
    if (hours > 24) {
      return `${Math.floor(hours / 24)}d remaining`;
    }
    return `${hours}h remaining`;
  };

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

      {/* Hero Section */}
      <div className="relative overflow-hidden py-16">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/20 blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-500/20 blur-3xl animate-pulse" style={{ animationDelay: "1s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/10 px-5 py-2.5 backdrop-blur-sm border border-white/10">
            <Lightbulb className="h-5 w-5 text-yellow-400" />
            <span className="text-sm font-medium text-white/90">Community Requests</span>
          </div>

          <h1 className="mb-4 text-5xl font-bold bg-gradient-to-r from-white via-purple-200 to-pink-200 bg-clip-text text-transparent md:text-6xl">
            Need Something?
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg text-purple-200/80">
            Post what you&apos;re looking for and let sellers come to you. Someone on campus might have exactly what you need!
          </p>

          <Link
            href="/suggestions/new"
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 px-8 py-4 font-semibold text-white shadow-2xl shadow-purple-500/25 transition-all hover:shadow-purple-500/40 hover:scale-105 active:scale-95"
          >
            <Plus className="h-6 w-6" />
            Post What You Need
          </Link>
        </div>
      </div>

      {/* Suggestions Grid */}
      <div className="mx-auto max-w-6xl px-4 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white">Active Requests</h2>
          <span className="rounded-full bg-white/10 px-4 py-1.5 text-sm text-purple-200">
            {suggestions.length} requests
          </span>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-32">
            <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
          </div>
        ) : suggestions.length === 0 ? (
          <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur-sm p-16 text-center">
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
              <Lightbulb className="h-10 w-10 text-purple-300" />
            </div>
            <h3 className="text-xl font-semibold text-white mb-2">No requests yet</h3>
            <p className="text-purple-200/70 mb-6">Be the first to post what you need!</p>
            <Link
              href="/suggestions/new"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white"
            >
              <Plus className="h-5 w-5" />
              Create First Request
            </Link>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((suggestion, index) => (
              <div
                key={suggestion.id}
                className="group relative rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-6 transition-all hover:border-purple-500/50 hover:bg-white/10 animate-slide-up"
                style={{ animationDelay: `${index * 30}ms` }}
              >
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 transition-opacity group-hover:opacity-100" />
                
                <div className="relative">
                  <div className="mb-4 flex items-center gap-2">
                    {suggestion.userId ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-3 py-1 text-xs font-medium text-indigo-300">
                        <User className="h-3 w-3" />
                        {suggestion.userName || "Verified"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-gray-300">
                        Anonymous
                      </span>
                    )}
                    <span className="text-xs text-purple-300/60">
                      {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                    </span>
                  </div>

                  <Link href={`/suggestions/${suggestion.id}`}>
                    <p className="mb-4 text-lg font-semibold text-white hover:text-purple-300 transition-colors line-clamp-2">
                      {suggestion.content}
                    </p>
                  </Link>

                  <div className="mb-5 flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1.5 text-purple-300/70">
                      <Clock className="h-4 w-4" />
                      {timeRemaining(suggestion.expiresAt)}
                    </span>
                    {suggestion.responseCount > 0 && (
                      <span className="flex items-center gap-1.5 text-emerald-400">
                        <MessageCircle className="h-4 w-4" />
                        {suggestion.responseCount} offer{suggestion.responseCount > 1 ? "s" : ""}
                      </span>
                    )}
                  </div>

                  {respondingTo === suggestion.id ? (
                    <div className="space-y-3 animate-slide-up">
                      <textarea
                        value={responseMessage}
                        onChange={(e) => setResponseMessage(e.target.value)}
                        placeholder="Your message (optional)"
                        className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        rows={2}
                      />
                      {userListings.length > 0 && (
                        <select
                          value={selectedListing}
                          onChange={(e) => setSelectedListing(e.target.value)}
                          className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                        >
                          <option value="">Link a listing (optional)</option>
                          {userListings.map((l) => (
                            <option key={l.id} value={l.id} className="bg-slate-800">
                              {l.title} - ${l.price}
                            </option>
                          ))}
                        </select>
                      )}
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setRespondingTo(null);
                            setResponseMessage("");
                            setSelectedListing("");
                          }}
                          className="flex-1 rounded-xl border border-white/20 py-2.5 text-sm font-medium text-white hover:bg-white/10 transition-colors"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleRespond(suggestion.id)}
                          disabled={isPending}
                          className="flex-1 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                        >
                          {isPending ? (
                            <Loader2 className="mx-auto h-4 w-4 animate-spin" />
                          ) : (
                            "Send Offer"
                          )}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Link
                        href={`/suggestions/${suggestion.id}`}
                        className="flex-1 rounded-xl border border-white/20 py-2.5 text-center text-sm font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        View Details
                      </Link>
                      <button
                        onClick={() => {
                          if (!session?.user) {
                            setToast({ message: "Please log in to respond", type: "error" });
                            return;
                          }
                          setRespondingTo(suggestion.id);
                        }}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-indigo-500 py-2.5 text-sm font-medium text-white hover:opacity-90 transition-opacity"
                      >
                        <ShoppingBag className="h-4 w-4" />
                        I Can Help
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="border-t border-white/10 bg-black/20 py-16">
        <div className="mx-auto max-w-4xl px-4 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">
            Have items to sell?
          </h3>
          <p className="text-purple-200/70 mb-8">
            List your items on the marketplace and get discovered by students looking to buy.
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-4 font-semibold text-white shadow-xl transition-all hover:shadow-emerald-500/25 hover:scale-105"
          >
            <Sparkles className="h-5 w-5" />
            Start Selling
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
