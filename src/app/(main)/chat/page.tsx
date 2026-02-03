"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import {
  Send,
  Smile,
  MessageCircle,
  Shield,
  Users,
  AlertCircle,
  CheckCircle,
  Loader2,
  Info,
  LogIn,
  Trash2,
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import {
  sendChatMessage,
  getChatMessages,
  getNewMessages,
  getAnonymousChatLimit,
  deleteChatMessage,
  type CampusChatMessage,
} from "@/actions/campus-chat";

// Generate a consistent color from a string
function stringToColor(str: string): string {
  const colors = [
    "from-purple-500 to-indigo-600",
    "from-pink-500 to-rose-600",
    "from-blue-500 to-cyan-600",
    "from-green-500 to-emerald-600",
    "from-yellow-500 to-orange-600",
    "from-red-500 to-pink-600",
    "from-indigo-500 to-purple-600",
    "from-teal-500 to-green-600",
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

// Get session ID from localStorage
function getSessionId(): string {
  if (typeof window === "undefined") return "";
  let sessionId = localStorage.getItem("chat-session-id");
  if (!sessionId) {
    sessionId = `anon-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem("chat-session-id", sessionId);
  }
  return sessionId;
}

export default function CampusChatPage() {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<CampusChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [messagesRemaining, setMessagesRemaining] = useState<number>(10);
  const [showLimitWarning, setShowLimitWarning] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const pollIntervalRef = useRef<NodeJS.Timeout>();

  // Initialize session ID
  useEffect(() => {
    setSessionId(getSessionId());
  }, []);

  // Load initial messages
  useEffect(() => {
    loadMessages();
    loadChatLimit();
  }, []);

  // Poll for new messages
  useEffect(() => {
    pollIntervalRef.current = setInterval(pollNewMessages, 3000);
    return () => {
      if (pollIntervalRef.current) {
        clearInterval(pollIntervalRef.current);
      }
    };
  }, [messages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    setIsLoading(true);
    const result = await getChatMessages(50);
    if (result.success) {
      setMessages(result.messages);
    }
    setIsLoading(false);
  }

  async function loadChatLimit() {
    if (session?.user) return; // Registered users have no limit
    const limit = await getAnonymousChatLimit();
    setMessagesRemaining(limit.messagesRemaining);
    if (limit.isLimited) {
      setShowLimitWarning(true);
    }
  }

  async function pollNewMessages() {
    if (messages.length === 0) return;
    const lastMessage = messages[messages.length - 1];
    const result = await getNewMessages(lastMessage.id);
    if (result.success && result.messages.length > 0) {
      setMessages((prev) => [...prev, ...result.messages]);
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    if (!session?.user && messagesRemaining <= 0) {
      setShowLimitWarning(true);
      return;
    }

    setIsSending(true);
    setError(null);

    const result = await sendChatMessage(
      newMessage.trim(),
      sessionId,
      session?.user?.id
    );

    if (result.success && result.message) {
      setMessages((prev) => [...prev, result.message!]);
      setNewMessage("");
      if (result.messagesRemaining !== undefined) {
        setMessagesRemaining(result.messagesRemaining);
        if (result.messagesRemaining <= 3 && !session?.user) {
          setShowLimitWarning(true);
        }
      }
    } else {
      setError(result.error || "Failed to send message");
    }

    setIsSending(false);
    inputRef.current?.focus();
  }

  const isOwnMessage = (msg: CampusChatMessage) => {
    if (session?.user?.id && msg.isRegistered) {
      return msg.userName === session.user.name;
    }
    return msg.sessionId === sessionId;
  };

  async function handleDeleteMessage(messageId: string) {
    if (!confirm("Delete this message?")) return;
    
    const result = await deleteChatMessage(
      messageId,
      sessionId,
      session?.user?.id
    );
    
    if (result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    } else {
      setError(result.error || "Failed to delete message");
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col bg-gradient-to-br from-purple-900 via-indigo-900 to-purple-900">
      {/* Animated background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 h-64 w-64 rounded-full bg-pink-500/10 blur-3xl animate-float" />
        <div className="absolute bottom-20 right-10 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl animate-float-delayed" />
        <div className="absolute top-1/2 left-1/3 h-48 w-48 rounded-full bg-purple-500/10 blur-3xl animate-float-slow" />
      </div>

      {/* Header */}
      <div className="relative z-10 border-b border-white/10 bg-black/20 backdrop-blur-lg px-4 py-4">
        <div className="mx-auto max-w-2xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
              <MessageCircle className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white">Campus Chat</h1>
              <p className="text-xs text-white/60 flex items-center gap-1">
                <Users className="h-3 w-3" />
                Kabarak University Community
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500/20">
              <div className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            </div>
            <span className="text-xs text-green-400">Live</span>
          </div>
        </div>
      </div>

      {/* Anonymous limit warning */}
      {!session?.user && messagesRemaining <= 5 && (
        <div className="relative z-10 border-b border-yellow-500/20 bg-yellow-500/10 backdrop-blur-sm px-4 py-2">
          <div className="mx-auto max-w-2xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-yellow-200 text-sm">
              <AlertCircle className="h-4 w-4" />
              <span>
                {messagesRemaining > 0
                  ? `${messagesRemaining} messages remaining today`
                  : "Daily limit reached"}
              </span>
            </div>
            <Link
              href="/register"
              className="text-sm font-medium text-yellow-300 hover:text-yellow-200 flex items-center gap-1"
            >
              <LogIn className="h-4 w-4" />
              Sign up for unlimited
            </Link>
          </div>
        </div>
      )}

      {/* Messages area */}
      <div className="relative z-10 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-white/50" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-20">
              <MessageCircle className="mx-auto h-12 w-12 text-white/20" />
              <p className="mt-4 text-white/40">
                No messages yet. Be the first to say hi!
              </p>
            </div>
          ) : (
            messages.map((msg, index) => {
              const isOwn = isOwnMessage(msg);
              const avatarGradient = stringToColor(msg.sessionId);

              return (
                <div
                  key={msg.id}
                  className={`flex items-end gap-2 animate-slide-up ${
                    isOwn ? "flex-row-reverse" : ""
                  }`}
                  style={{ animationDelay: `${Math.min(index * 30, 300)}ms` }}
                >
                  {/* Avatar */}
                  <div
                    className={`flex-shrink-0 h-8 w-8 rounded-full bg-gradient-to-br ${avatarGradient} flex items-center justify-center`}
                  >
                    <span className="text-xs font-bold text-white">
                      {msg.isRegistered && msg.userName
                        ? msg.userName.charAt(0).toUpperCase()
                        : "?"}
                    </span>
                  </div>

                  {/* Message bubble */}
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 backdrop-blur-md ${
                      isOwn
                        ? "bg-gradient-to-br from-purple-500/80 to-pink-500/80 rounded-br-sm"
                        : "bg-white/10 rounded-bl-sm"
                    }`}
                  >
                    {/* Username and badges */}
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`text-xs font-semibold ${
                          isOwn ? "text-white/80" : "text-white/60"
                        }`}
                      >
                        {msg.isRegistered && msg.userName
                          ? msg.userName
                          : "Anonymous"}
                      </span>
                      {msg.isRegistered && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-blue-500/20 px-1 py-0.5 text-[10px] text-blue-300">
                          <CheckCircle className="h-2.5 w-2.5" />
                          Verified
                        </span>
                      )}
                      {msg.isFiltered && (
                        <span className="inline-flex items-center gap-0.5 rounded bg-yellow-500/20 px-1 py-0.5 text-[10px] text-yellow-300">
                          <Shield className="h-2.5 w-2.5" />
                          Filtered
                        </span>
                      )}
                    </div>

                    {/* Message content */}
                    <p className="text-sm text-white break-words">{msg.content}</p>

                    {/* Timestamp and Delete */}
                    <div className="flex items-center justify-between mt-1">
                      <p
                        className={`text-[10px] ${
                          isOwn ? "text-white/50" : "text-white/30"
                        }`}
                      >
                        {formatDistanceToNow(new Date(msg.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                      {isOwn && (
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="text-white/30 hover:text-red-400 transition-colors ml-2"
                          title="Delete message"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Error display */}
      {error && (
        <div className="relative z-10 border-t border-red-500/20 bg-red-500/10 backdrop-blur-sm px-4 py-2">
          <div className="mx-auto max-w-2xl flex items-center gap-2 text-red-300 text-sm">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Limit reached modal */}
      {showLimitWarning && messagesRemaining <= 0 && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm rounded-2xl glass p-6 text-center animate-zoom-bounce">
            <AlertCircle className="mx-auto h-12 w-12 text-yellow-400 mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">
              Daily Limit Reached
            </h2>
            <p className="text-white/70 mb-6">
              Anonymous users can send 10 messages per day. Create an account to
              chat unlimited!
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowLimitWarning(false)}
                className="flex-1 rounded-lg bg-white/10 px-4 py-2 text-white hover:bg-white/20 transition-colors"
              >
                Close
              </button>
              <Link
                href="/register"
                className="flex-1 rounded-lg bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 text-white font-medium hover:from-purple-600 hover:to-pink-600 transition-colors"
              >
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="relative z-10 border-t border-white/10 bg-black/30 backdrop-blur-lg px-4 py-4">
        <div className="mx-auto max-w-2xl">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white/60 hover:bg-white/20 hover:text-white transition-colors"
            >
              <Smile className="h-5 w-5" />
            </button>

            <div className="relative flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder={
                  messagesRemaining <= 0 && !session?.user
                    ? "Sign up to send more messages..."
                    : "Type a message..."
                }
                disabled={isSending || (messagesRemaining <= 0 && !session?.user)}
                maxLength={500}
                className="w-full rounded-full bg-white/10 px-4 py-2.5 text-white placeholder-white/40 outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <button
              type="submit"
              disabled={
                !newMessage.trim() ||
                isSending ||
                (messagesRemaining <= 0 && !session?.user)
              }
              className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </button>
          </form>

          {/* Rules reminder */}
          <div className="flex items-center justify-center gap-2 mt-3 text-xs text-white/40">
            <Info className="h-3 w-3" />
            <span>Be respectful. No hate speech or harassment.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
