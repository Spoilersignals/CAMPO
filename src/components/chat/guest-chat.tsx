"use client";

import * as React from "react";
import { MessageCircle, User, Phone, Mail, AlertCircle, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import {
  startGuestChatAction,
  sendGuestMessageAction,
  getThreadMessagesAction,
  requestSupportAction,
} from "@/actions/guest-chat";

const GUEST_INFO_KEY = "campus_guest_buyer";
const GUEST_THREAD_PREFIX = "campus_guest_thread_";

interface GuestInfo {
  name: string;
  phone: string;
  email: string;
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

interface GuestChatProps {
  listingId: string;
  sellerId: string;
  sellerName: string;
  listingTitle: string;
}

export function GuestChat({
  listingId,
  sellerId,
  sellerName,
  listingTitle,
}: GuestChatProps) {
  const [guestInfo, setGuestInfo] = React.useState<GuestInfo | null>(null);
  const [threadId, setThreadId] = React.useState<string | null>(null);
  const [messages, setMessages] = React.useState<Message[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [showSupportForm, setShowSupportForm] = React.useState(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const messagesEndRef = React.useRef<HTMLDivElement>(null);

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
  }, [listingId]);

  React.useEffect(() => {
    if (!threadId) return;

    const fetchMessages = async () => {
      try {
        const data = await getThreadMessagesAction(threadId);
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
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [threadId]);

  React.useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleGuestInfoSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const phone = formData.get("phone") as string;
    const email = formData.get("email") as string;
    const message = formData.get("message") as string;

    if (!name.trim() || !phone.trim() || !message.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      const thread = await startGuestChatAction(
        listingId,
        name,
        phone,
        email || undefined,
        message
      );

      const info = { name, phone, email };
      setGuestInfo(info);
      localStorage.setItem(GUEST_INFO_KEY, JSON.stringify(info));
      localStorage.setItem(GUEST_THREAD_PREFIX + listingId, thread.id);
      setThreadId(thread.id);

      const data = await getThreadMessagesAction(thread.id);
      setMessages(
        data.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    } catch (error) {
      console.error("Failed to start chat:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (content: string) => {
    if (!threadId || !guestInfo) return;

    try {
      await sendGuestMessageAction(threadId, guestInfo.name, content);
      const data = await getThreadMessagesAction(threadId);
      setMessages(
        data.messages.map((msg) => ({
          ...msg,
          timestamp: new Date(msg.timestamp),
        }))
      );
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  const handleSupportRequest = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!threadId) return;

    const formData = new FormData(e.currentTarget);
    const subject = formData.get("subject") as string;
    const description = formData.get("description") as string;

    if (!subject.trim() || !description.trim()) return;

    setIsLoading(true);
    try {
      await requestSupportAction(threadId, subject, description);
      setShowSupportForm(false);
    } catch (error) {
      console.error("Failed to request support:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isChatOpen) {
    return (
      <Button onClick={() => setIsChatOpen(true)} className="w-full">
        <MessageCircle className="mr-2 h-4 w-4" />
        Contact Seller
      </Button>
    );
  }

  if (!guestInfo || !threadId) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Contact {sellerName}
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          About: {listingTitle}
        </p>

        <form onSubmit={handleGuestInfoSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-gray-700">
              Your Name *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="name"
                name="name"
                required
                placeholder="Enter your name"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="phone" className="mb-1 block text-sm font-medium text-gray-700">
              Phone Number *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="phone"
                name="phone"
                type="tel"
                required
                placeholder="Enter your phone number"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">
              Email (optional)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <label htmlFor="message" className="mb-1 block text-sm font-medium text-gray-700">
              Message *
            </label>
            <textarea
              id="message"
              name="message"
              required
              rows={3}
              placeholder="Hi, I'm interested in this item..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Starting chat...
              </>
            ) : (
              <>
                <Send className="mr-2 h-4 w-4" />
                Start Chat
              </>
            )}
          </Button>
        </form>
      </div>
    );
  }

  if (showSupportForm) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h3 className="mb-4 text-lg font-semibold text-gray-900">
          Request Support
        </h3>
        <p className="mb-4 text-sm text-gray-600">
          Having an issue? Our team will review your request and get back to you.
        </p>

        <form onSubmit={handleSupportRequest} className="space-y-4">
          <div>
            <label htmlFor="subject" className="mb-1 block text-sm font-medium text-gray-700">
              Subject *
            </label>
            <Input
              id="subject"
              name="subject"
              required
              placeholder="Brief description of your issue"
            />
          </div>

          <div>
            <label htmlFor="description" className="mb-1 block text-sm font-medium text-gray-700">
              Description *
            </label>
            <textarea
              id="description"
              name="description"
              required
              rows={4}
              placeholder="Please provide details about your issue..."
              className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowSupportForm(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit Request"
              )}
            </Button>
          </div>
        </form>
      </div>
    );
  }

  return (
    <div className="flex h-[500px] flex-col rounded-lg border border-gray-200 bg-white">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div>
          <h3 className="font-semibold text-gray-900">{sellerName}</h3>
          <p className="text-xs text-gray-500">{listingTitle}</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowSupportForm(true)}
          className="text-orange-600 hover:text-orange-700"
        >
          <AlertCircle className="mr-1.5 h-4 w-4" />
          Request Support
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex flex-col gap-3">
          {messages.length === 0 && (
            <div className="flex h-full items-center justify-center py-12">
              <p className="text-sm text-gray-500">No messages yet.</p>
            </div>
          )}
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              content={message.content}
              timestamp={message.timestamp}
              isSent={!message.isFromSeller}
              isRead={message.isRead}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <ChatInput onSend={handleSendMessage} />
    </div>
  );
}
