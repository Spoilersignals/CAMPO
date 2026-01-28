"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Send, Heart, MoreVertical, Flag, UserX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getMatchMessages, sendDatingMessage, unmatch, blockProfile, reportProfile } from "@/actions/dating";
import { formatDistanceToNow } from "date-fns";

type Message = {
  id: string;
  content: string;
  senderId: string;
  createdAt: Date;
  isRead: boolean;
};

type Profile = {
  id: string;
  displayName: string;
  photos: { url: string }[];
};

export default function DatingChatPage() {
  const router = useRouter();
  const params = useParams();
  const matchId = params.matchId as string;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [otherProfile, setOtherProfile] = useState<Profile | null>(null);
  const [myProfileId, setMyProfileId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [matchId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const result = await getMatchMessages(matchId);
    if (result.success && result.data) {
      setMessages(result.data.messages);
      setOtherProfile(result.data.otherProfile);
      setMyProfileId(result.data.myProfileId);
    }
    setIsLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || isSending) return;

    setIsSending(true);
    const result = await sendDatingMessage(matchId, newMessage.trim());
    
    if (result.success && result.data) {
      setMessages(prev => [...prev, result.data!]);
      setNewMessage("");
    }
    setIsSending(false);
  }

  async function handleUnmatch() {
    if (!confirm("Are you sure you want to unmatch? This cannot be undone.")) return;
    await unmatch(matchId);
    router.push("/dating/matches");
  }

  async function handleBlock() {
    if (!otherProfile) return;
    if (!confirm("Block this user? They won't be able to see or contact you.")) return;
    await blockProfile(otherProfile.id);
    router.push("/dating/matches");
  }

  async function handleReport() {
    if (!otherProfile) return;
    const reason = prompt("Why are you reporting this profile?");
    if (reason) {
      await reportProfile(otherProfile.id, "OTHER", reason);
      alert("Report submitted. Thank you for keeping the community safe.");
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  if (!otherProfile) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-500">Match not found</p>
          <Button onClick={() => router.push("/dating/matches")} className="mt-4">
            Back to Matches
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b bg-white px-4 py-3 shadow-sm">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dating/matches")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        
        <div className="relative h-10 w-10 overflow-hidden rounded-full bg-gray-100">
          {otherProfile.photos[0] ? (
            <Image
              src={otherProfile.photos[0].url}
              alt={otherProfile.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Heart className="h-4 w-4 text-gray-300" />
            </div>
          )}
        </div>
        
        <div className="flex-1">
          <p className="font-semibold text-gray-900">{otherProfile.displayName}</p>
        </div>
        
        <div className="relative">
          <Button variant="ghost" size="sm" onClick={() => setShowMenu(!showMenu)}>
            <MoreVertical className="h-5 w-5" />
          </Button>
          
          {showMenu && (
            <div className="absolute right-0 top-full z-20 mt-1 w-48 rounded-lg border bg-white py-1 shadow-lg">
              <button
                onClick={() => { setShowMenu(false); handleReport(); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <Flag className="h-4 w-4" />
                Report
              </button>
              <button
                onClick={() => { setShowMenu(false); handleBlock(); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
              >
                <UserX className="h-4 w-4" />
                Block
              </button>
              <button
                onClick={() => { setShowMenu(false); handleUnmatch(); }}
                className="flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
              >
                <Heart className="h-4 w-4" />
                Unmatch
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-pink-100 p-4">
              <Heart className="h-8 w-8 text-pink-500" />
            </div>
            <p className="mb-2 font-semibold text-gray-900">You matched with {otherProfile.displayName}!</p>
            <p className="text-sm text-gray-500">Say something nice to break the ice 💬</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) => {
              const isMe = message.senderId === myProfileId;
              return (
                <div
                  key={message.id}
                  className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-2 ${
                      isMe
                        ? "bg-gradient-to-r from-pink-500 to-rose-500 text-white"
                        : "bg-white text-gray-900 shadow-sm"
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className={`mt-1 text-xs ${isMe ? "text-white/70" : "text-gray-400"}`}>
                      {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Message Input */}
      <div className="border-t bg-white p-4">
        <form onSubmit={handleSend} className="flex gap-2">
          <Input
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="flex-1"
          />
          <Button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className="bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            <Send className="h-5 w-5" />
          </Button>
        </form>
      </div>
    </div>
  );
}
