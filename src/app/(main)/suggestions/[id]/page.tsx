"use client";

import { useState, useEffect, useTransition } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  MessageCircle,
  User,
  CheckCircle,
  Loader2,
  ShoppingBag,
  ExternalLink,
  X,
  Send,
  Sparkles,
  Package,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  getSuggestionById,
  respondToSuggestion,
  fulfillSuggestion,
  getUserListings,
  type SuggestionDetailData,
} from "@/actions/suggestions";
import { cn, formatPrice } from "@/lib/utils";

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

export default function SuggestionDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session } = useSession();
  const [suggestion, setSuggestion] = useState<SuggestionDetailData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<Toast>(null);
  const [showResponseForm, setShowResponseForm] = useState(false);
  const [responseMessage, setResponseMessage] = useState("");
  const [selectedListing, setSelectedListing] = useState<string>("");
  const [userListings, setUserListings] = useState<{ id: string; title: string; price: number }[]>([]);
  const [isPending, startTransition] = useTransition();
  const [sessionId, setSessionId] = useState("");

  useEffect(() => {
    setSessionId(getSessionId());
    loadSuggestion();
  }, [id]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  useEffect(() => {
    if (showResponseForm && session?.user) {
      getUserListings().then((result) => {
        if (result.success) {
          setUserListings(result.listings);
        }
      });
    }
  }, [showResponseForm, session?.user]);

  async function loadSuggestion() {
    setIsLoading(true);
    const result = await getSuggestionById(id);
    if (result.success && result.suggestion) {
      setSuggestion(result.suggestion);
    }
    setIsLoading(false);
  }

  async function handleRespond() {
    if (!session?.user) {
      setToast({ message: "Please log in to respond", type: "error" });
      return;
    }

    startTransition(async () => {
      const result = await respondToSuggestion(
        id,
        responseMessage || undefined,
        selectedListing || undefined
      );
      if (result.success) {
        setShowResponseForm(false);
        setResponseMessage("");
        setSelectedListing("");
        setToast({ message: "Response sent! The requester will be notified.", type: "success" });
        loadSuggestion();
      } else {
        setToast({ message: result.error || "Failed to respond", type: "error" });
      }
    });
  }

  async function handleFulfill() {
    startTransition(async () => {
      const result = await fulfillSuggestion(id, sessionId);
      if (result.success) {
        setToast({ message: "Request marked as fulfilled!", type: "success" });
        loadSuggestion();
      } else {
        setToast({ message: result.error || "Failed to update", type: "error" });
      }
    });
  }

  const timeRemaining = (expiresAt: Date): string => {
    const now = new Date();
    const expires = new Date(expiresAt);
    const hours = Math.max(0, Math.floor((expires.getTime() - now.getTime()) / (1000 * 60 * 60)));
    if (hours > 24 * 30) {
      return "Permanent request";
    }
    if (hours > 24) {
      return `Expires in ${Math.floor(hours / 24)} days`;
    }
    return `Expires in ${hours} hours`;
  };

  const isOwner = suggestion
    ? session?.user?.id
      ? suggestion.userId === session.user.id
      : suggestion.sessionId === sessionId
    : false;

  const alreadyResponded = suggestion?.responses.some(
    (r) => r.sellerId === session?.user?.id
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-purple-400" />
      </div>
    );
  }

  if (!suggestion) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col items-center justify-center px-4">
        <div className="text-center">
          <Package className="mx-auto h-16 w-16 text-purple-400/50 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Suggestion Not Found</h1>
          <p className="text-purple-200/70 mb-6">This suggestion may have expired or been removed.</p>
          <Link
            href="/suggestions"
            className="inline-flex items-center gap-2 rounded-xl bg-purple-500 px-6 py-3 font-medium text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Suggestions
          </Link>
        </div>
      </div>
    );
  }

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
        <div className="absolute -top-40 -right-40 h-96 w-96 rounded-full bg-purple-500/10 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-pink-500/10 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-4xl px-4 py-8">
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
          <div className="p-8 border-b border-white/10">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-4">
                  {suggestion.userId ? (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/20 px-4 py-1.5 text-sm font-medium text-indigo-300">
                      <User className="h-4 w-4" />
                      {suggestion.userName || "Verified User"}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-gray-300">
                      Anonymous
                    </span>
                  )}
                  <span
                    className={cn(
                      "rounded-full px-4 py-1.5 text-sm font-medium",
                      suggestion.status === "ACTIVE"
                        ? "bg-emerald-500/20 text-emerald-300"
                        : "bg-purple-500/20 text-purple-300"
                    )}
                  >
                    {suggestion.status}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-white mb-4">
                  {suggestion.content}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-sm">
                  <span className="flex items-center gap-2 text-purple-300/70">
                    <Clock className="h-4 w-4" />
                    {timeRemaining(suggestion.expiresAt)}
                  </span>
                  <span className="flex items-center gap-2 text-purple-300/70">
                    <MessageCircle className="h-4 w-4" />
                    {suggestion.responseCount} response{suggestion.responseCount !== 1 ? "s" : ""}
                  </span>
                  <span className="text-purple-300/50">
                    Posted {formatDistanceToNow(new Date(suggestion.createdAt), { addSuffix: true })}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                {isOwner && suggestion.status === "ACTIVE" && (
                  <button
                    onClick={handleFulfill}
                    disabled={isPending}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-5 py-3 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle className="h-4 w-4" />
                    )}
                    Mark as Fulfilled
                  </button>
                )}
                {!isOwner && session?.user && suggestion.status === "ACTIVE" && !alreadyResponded && !showResponseForm && (
                  <button
                    onClick={() => setShowResponseForm(true)}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-5 py-3 font-medium text-white hover:opacity-90 transition-opacity"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    I Can Help
                  </button>
                )}
                {alreadyResponded && (
                  <span className="inline-flex items-center gap-2 rounded-xl bg-emerald-500/20 px-5 py-3 text-emerald-300">
                    <CheckCircle className="h-4 w-4" />
                    You responded
                  </span>
                )}
              </div>
            </div>

            {/* Response Form */}
            {showResponseForm && (
              <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6 animate-slide-up">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Send className="h-5 w-5 text-purple-400" />
                  Send Your Response
                </h3>
                <div className="space-y-4">
                  <textarea
                    value={responseMessage}
                    onChange={(e) => setResponseMessage(e.target.value)}
                    placeholder="Describe how you can help, your pricing, availability, etc."
                    className="w-full rounded-xl border border-white/20 bg-white/10 p-4 text-white placeholder:text-purple-300/50 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none min-h-[100px]"
                  />
                  {userListings.length > 0 && (
                    <div>
                      <label className="block text-sm text-purple-200/70 mb-2">
                        Link one of your listings (optional)
                      </label>
                      <select
                        value={selectedListing}
                        onChange={(e) => setSelectedListing(e.target.value)}
                        className="w-full rounded-xl border border-white/20 bg-white/10 p-3 text-white focus:border-purple-500 focus:ring-1 focus:ring-purple-500 focus:outline-none"
                      >
                        <option value="">No listing</option>
                        {userListings.map((l) => (
                          <option key={l.id} value={l.id} className="bg-slate-800">
                            {l.title} - {formatPrice(l.price)}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  <div className="flex gap-3 justify-end">
                    <button
                      onClick={() => {
                        setShowResponseForm(false);
                        setResponseMessage("");
                        setSelectedListing("");
                      }}
                      className="rounded-xl border border-white/20 px-6 py-2.5 text-white hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleRespond}
                      disabled={isPending}
                      className="rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-2.5 font-medium text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                    >
                      {isPending ? (
                        <Loader2 className="h-4 w-4 animate-spin mx-auto" />
                      ) : (
                        "Send Response"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Responses Section */}
          <div className="p-8">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              Responses ({suggestion.responses.length})
            </h2>

            {suggestion.responses.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/20 p-12 text-center">
                <MessageCircle className="mx-auto h-12 w-12 text-purple-400/30 mb-4" />
                <p className="text-purple-200/70">No responses yet. Be the first to help!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {suggestion.responses.map((response, index) => (
                  <div
                    key={response.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-5 transition-all hover:bg-white/10 animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        {response.sellerImage ? (
                          <img
                            src={response.sellerImage}
                            alt={response.sellerName || "Seller"}
                            className="h-12 w-12 rounded-full object-cover border-2 border-purple-500/30"
                          />
                        ) : (
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white font-semibold">
                            {response.sellerName?.[0]?.toUpperCase() || "S"}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-white">
                            {response.sellerName || "Seller"}
                          </span>
                          <span className="text-xs text-purple-300/50">
                            {formatDistanceToNow(new Date(response.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        {response.message && (
                          <p className="text-purple-100/80 mb-3">{response.message}</p>
                        )}
                        {response.listingId && response.listingTitle && (
                          <Link
                            href={`/listings/${response.listingId}`}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 px-4 py-2.5 text-sm text-purple-200 hover:bg-purple-500/30 transition-colors"
                          >
                            <Package className="h-4 w-4" />
                            <span className="font-medium">{response.listingTitle}</span>
                            {response.listingPrice && (
                              <span className="text-emerald-400 font-semibold">
                                {formatPrice(response.listingPrice)}
                              </span>
                            )}
                            <ExternalLink className="h-3 w-3 ml-1" />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Help CTA for non-logged users */}
        {!session?.user && suggestion.status === "ACTIVE" && (
          <div className="mt-8 rounded-2xl border border-purple-500/30 bg-purple-500/10 p-6 text-center">
            <h3 className="text-lg font-semibold text-white mb-2">Want to help?</h3>
            <p className="text-purple-200/70 mb-4">
              Log in to respond to this request and connect with the person.
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-6 py-3 font-medium text-white"
            >
              Log In to Respond
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
