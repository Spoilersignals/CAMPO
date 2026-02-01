"use client";

import * as React from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  Send,
  Loader2,
  User,
  Phone,
  Mail,
  MessageCircle,
  Check,
  CheckCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  getOrCreateChatThread,
  sendMessage,
  getMessages,
  getListingForChat,
} from "@/actions/seller-chat";

const GUEST_INFO_KEY = "campus_marketplace_guest";
const GUEST_THREAD_PREFIX = "campus_marketplace_thread_";

interface GuestInfo {
  name: string;
  phone: string;
  email?: string;
}

interface Message {
  id: string;
  content: string;
  timestamp: Date;
  senderId: string | null;
  senderName: string;
  isRead: boolean;
  isFromSeller: boolean;
}

interface Listing {
  id: string;
  title: string;
  price: number;
  status: string;
  imageUrl: string | null;
  seller: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}

export default function MarketplaceChatPage() {
  const params = useParams();
  const router = useRouter();
  const listingId = params.id as string;

  const [listing, setListing] = React.useState<Listing | null>(null);
  const [guestInfo, setGuestInfo] = React.useState<GuestInfo | null>(null);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [messageInput, setMessageInput] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(true);
  const [isSending, setIsSending] = React.useState(false);
  const [showGuestForm, setShowGuestForm] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    const loadListing = async () => {
      try {
        const data = await getListingForChat(listingId);
        if (!data || data.status !== "ACTIVE") {
          router.push(`/marketplace/${listingId}`);
          return;
        }
        setListing(data);
      } catch {
        router.push(`/marketplace/${listingId}`);
      }
    };
    loadListing();
  }, [listingId, router]);

  React.useEffect(() => {
    const stored = localStorage.getItem(GUEST_INFO_KEY);
    if (stored) {
      try {
        setGuestInfo(JSON.parse(stored));
      } catch {
        localStorage.removeItem(GUEST_INFO_KEY);
      }
    }

    const storedThreadId = localStorage.getItem(GUEST_THREAD_PREFIX + listingId);
    if (storedThreadId) {
      setThreadId(storedThreadId);
    }
    setIsLoading(false);
  }, [listingId]);

  React.useEffect(() => {
    if (!threadId) return;

    const fetchMessages = async () => {
      try {
        const data = await getMessages(threadId);
        setMessages(
          data.messages.map((msg) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          }))
        );
      } catch {
        console.error("Failed to fetch messages");
      }
    };

    fetchMessages();
    const interval = setInterval(fetchMessages, 3000);
    return () => clearInterval(interval);
  }, [threadId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGuestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;

    if (!name.trim() || !phone.trim()) return;

    setIsLoading(true);
    try {
      const thread = await getOrCreateChatThread(listingId, {
        name: name.trim(),
        phone: phone.trim(),
        email: email?.trim() || undefined,
      });

      const info = { name: name.trim(), phone: phone.trim(), email: email?.trim() };
      setGuestInfo(info);
      localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(info));
      localStorage.setItem(GUEST_THREAD_PREFIX + listingId, thread.id);
      setThreadId(thread.id);
      setShowGuestForm(false);
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!guestInfo) {
      setShowGuestForm(true);
      return;
    }

    setIsLoading(true);
    try {
      const thread = await getOrCreateChatThread(listingId, guestInfo);
      localStorage.setItem(GUEST_THREAD_PREFIX + listingId, thread.id);
      setThreadId(thread.id);
    } catch (error) {
      console.error("Failed to start chat:", error);
      setShowGuestForm(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !threadId || isSending) return;

    const content = messageInput.trim();
    setMessageInput("");
    setIsSending(true);

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date(),
      senderId: null,
      senderName: guestInfo?.name || "You",
      isRead: false,
      isFromSeller: false,
    };
    setMessages((prev) => [...prev, optimisticMessage]);

    try {
      await sendMessage(threadId, content, false, guestInfo?.name);
      const data = await getMessages(threadId);
      setMessages(
        data.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMessage.id));
      setMessageInput(content);
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(date);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: "NGN",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (!listing) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <Loader2 className="h-8 w-8 animate-spin text-purple-400" />
      </div>
    );
  }

  if (showGuestForm) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowGuestForm(false)}
              className="h-10 w-10 p-0 text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-lg font-semibold text-white">Your Details</h1>
          </div>
        </header>

        <div className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-md">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                  <MessageCircle className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-white">Start a conversation</h2>
                <p className="mt-2 text-sm text-gray-400">
                  Enter your details to message the seller about this listing
                </p>
              </div>

              <form onSubmit={handleGuestSubmit} className="space-y-4">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Your Name *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      name="name"
                      required
                      placeholder="Enter your name"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      name="phone"
                      type="tel"
                      required
                      placeholder="Enter your phone number"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-300">
                    Email (optional)
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                    <Input
                      name="email"
                      type="email"
                      placeholder="Enter your email"
                      className="border-white/10 bg-white/5 pl-10 text-white placeholder:text-gray-500"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Starting...
                    </>
                  ) : (
                    <>
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Start Chat
                    </>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!threadId) {
    return (
      <div className="flex min-h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
          <div className="mx-auto flex max-w-2xl items-center gap-3 px-4 py-3">
            <Link href={`/marketplace/${listingId}`}>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <h1 className="text-lg font-semibold text-white">Contact Seller</h1>
          </div>
        </header>

        <div className="flex-1 px-4 py-8">
          <div className="mx-auto max-w-md">
            <Link
              href={`/marketplace/${listingId}`}
              className="mb-6 flex items-center gap-4 rounded-xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                {listing.imageUrl ? (
                  <Image
                    src={listing.imageUrl}
                    alt={listing.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <MessageCircle className="h-6 w-6 text-gray-600" />
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="truncate font-medium text-white">{listing.title}</h3>
                <p className="text-lg font-bold text-purple-400">
                  {formatPrice(listing.price)}
                </p>
              </div>
            </Link>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-center backdrop-blur-sm">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-semibold text-white">
                Message {listing.seller.name}
              </h2>
              <p className="mt-2 text-sm text-gray-400">
                Ask about the product, negotiate the price, or arrange pickup
              </p>

              <Button
                onClick={handleStartChat}
                disabled={isLoading}
                className="mt-6 w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  <>
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Start Conversation
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-3 px-4 py-3">
            <Link href={`/marketplace/${listingId}`}>
              <Button variant="ghost" size="sm" className="h-10 w-10 p-0 text-white hover:bg-white/10">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="truncate font-semibold text-white">{listing.seller.name}</h1>
              <p className="truncate text-xs text-gray-400">{listing.title}</p>
            </div>
          </div>

          <Link
            href={`/marketplace/${listingId}`}
            className="flex items-center gap-3 border-t border-white/5 bg-white/5 px-4 py-2 transition-colors hover:bg-white/10"
          >
            <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
              {listing.imageUrl ? (
                <Image
                  src={listing.imageUrl}
                  alt={listing.title}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <MessageCircle className="h-4 w-4 text-gray-600" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-white">{listing.title}</p>
              <p className="text-sm font-bold text-purple-400">{formatPrice(listing.price)}</p>
            </div>
          </Link>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto max-w-2xl space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <MessageCircle className="h-8 w-8 text-gray-500" />
              </div>
              <p className="text-gray-400">No messages yet</p>
              <p className="mt-1 text-sm text-gray-500">
                Send a message to start the conversation
              </p>
            </div>
          )}

          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                "flex w-full",
                message.isFromSeller ? "justify-start" : "justify-end"
              )}
            >
              <div
                className={cn(
                  "max-w-[80%] rounded-2xl px-4 py-2.5",
                  message.isFromSeller
                    ? "rounded-bl-md bg-white/10 text-white"
                    : "rounded-br-md bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                )}
              >
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div
                  className={cn(
                    "mt-1 flex items-center justify-end gap-1 text-xs",
                    message.isFromSeller ? "text-gray-400" : "text-white/70"
                  )}
                >
                  <span>{formatTime(message.timestamp)}</span>
                  {!message.isFromSeller && (
                    <span className="ml-0.5">
                      {message.isRead ? (
                        <CheckCheck className="h-3.5 w-3.5" />
                      ) : (
                        <Check className="h-3.5 w-3.5" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="border-t border-white/10 bg-gray-900/80 backdrop-blur-xl">
        <div className="mx-auto max-w-2xl p-4">
          <div className="flex items-end gap-3">
            <div className="relative flex-1">
              <textarea
                ref={textareaRef}
                value={messageInput}
                onChange={(e) => {
                  setMessageInput(e.target.value);
                  if (textareaRef.current) {
                    textareaRef.current.style.height = "auto";
                    textareaRef.current.style.height = `${Math.min(
                      textareaRef.current.scrollHeight,
                      120
                    )}px`;
                  }
                }}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                rows={1}
                className="w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20"
              />
            </div>
            <Button
              onClick={handleSendMessage}
              disabled={!messageInput.trim() || isSending}
              className="h-11 w-11 shrink-0 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 p-0 hover:from-purple-700 hover:to-pink-700"
            >
              {isSending ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
              <span className="sr-only">Send message</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
