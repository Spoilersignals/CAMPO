"use client";

import { useState, useEffect, useRef } from "react";
import { Trash2, Reply, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { sendGroupMessage, getGroupMessages, deleteMyMessage } from "@/actions/group-chat";
import { formatRelativeTime } from "@/lib/utils";

type Message = {
  id: string;
  content: string;
  authorName: string | null;
  anonymousId: string;
  createdAt: Date;
  isOwn: boolean;
  replyTo: {
    id: string;
    content: string;
    anonymousId: string;
  } | null;
};

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState("");
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadMessages();
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function loadMessages() {
    const result = await getGroupMessages();
    if (result.success && result.data) {
      setMessages(result.data.messages.reverse());
    }
    setIsLoading(false);
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!messageContent.trim()) return;

    setIsSending(true);
    setError("");

    const result = await sendGroupMessage(
      messageContent,
      authorName || undefined,
      replyingTo?.id
    );

    if (result.success) {
      setMessageContent("");
      setReplyingTo(null);
      await loadMessages();
    } else {
      setError(result.error || "Failed to send message");
    }

    setIsSending(false);
  }

  async function handleDelete(messageId: string) {
    const result = await deleteMyMessage(messageId);
    if (result.success) {
      setMessages((prev) => prev.filter((m) => m.id !== messageId));
    }
  }

  function handleReply(message: Message) {
    setReplyingTo(message);
    inputRef.current?.focus();
  }

  function scrollToMessage(messageId: string) {
    const element = document.getElementById(`message-${messageId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "center" });
      element.classList.add("bg-yellow-100");
      setTimeout(() => {
        element.classList.remove("bg-yellow-100");
      }, 2000);
    }
  }

  function renderContentWithMentions(content: string, isOwn: boolean) {
    const mentionRegex = /@(Anon#\d{4})/g;
    const parts = content.split(mentionRegex);

    return parts.map((part, index) => {
      if (part.match(/^Anon#\d{4}$/)) {
        return (
          <span
            key={index}
            className={`font-semibold ${
              isOwn ? "text-blue-200" : "text-blue-600"
            } cursor-pointer hover:underline`}
            onClick={() => {
              const mentionedMessage = messages.find(
                (m) => m.anonymousId === part
              );
              if (mentionedMessage) {
                scrollToMessage(mentionedMessage.id);
              }
            }}
          >
            @{part}
          </span>
        );
      }
      return part;
    });
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-4rem)] max-w-2xl flex-col px-4 py-8">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900">Campus Chat</h1>
        <p className="text-gray-600">Chat anonymously with fellow students</p>
      </div>

      <Card className="flex flex-1 flex-col overflow-hidden">
        <CardContent className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="mb-1 h-4 w-24 rounded bg-gray-200" />
                  <div className="h-10 w-3/4 rounded bg-gray-200" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <p className="text-gray-500">No messages yet. Start the conversation!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {messages.map((message) => (
                <div
                  key={message.id}
                  id={`message-${message.id}`}
                  className={`flex transition-colors duration-500 ${message.isOwn ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`group max-w-[80%] rounded-lg px-3 py-2 ${
                      message.isOwn
                        ? "bg-blue-500 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    {message.replyTo && (
                      <div
                        className={`mb-2 cursor-pointer rounded border-l-2 pl-2 text-xs ${
                          message.isOwn
                            ? "border-blue-300 bg-blue-400/50 text-blue-100"
                            : "border-gray-400 bg-gray-200 text-gray-600"
                        }`}
                        onClick={() => scrollToMessage(message.replyTo!.id)}
                      >
                        <span className="font-medium">{message.replyTo.anonymousId}</span>
                        <p className="truncate">{message.replyTo.content}</p>
                      </div>
                    )}
                    <div className="mb-1 flex items-center gap-2">
                      <span
                        className={`text-xs font-bold ${
                          message.isOwn ? "text-blue-100" : "text-blue-600"
                        }`}
                      >
                        {message.anonymousId}
                      </span>
                      {message.authorName && (
                        <span
                          className={`text-xs ${
                            message.isOwn ? "text-blue-200" : "text-gray-500"
                          }`}
                        >
                          ({message.authorName})
                        </span>
                      )}
                      <span
                        className={`text-xs ${
                          message.isOwn ? "text-blue-200" : "text-gray-400"
                        }`}
                      >
                        {formatRelativeTime(message.createdAt)}
                      </span>
                      <button
                        onClick={() => handleReply(message)}
                        className={`ml-1 opacity-0 transition-opacity group-hover:opacity-100 ${
                          message.isOwn ? "text-blue-200 hover:text-white" : "text-gray-400 hover:text-gray-600"
                        }`}
                        title="Reply"
                      >
                        <Reply className="h-3 w-3" />
                      </button>
                      {message.isOwn && (
                        <button
                          onClick={() => handleDelete(message.id)}
                          className="ml-1 opacity-0 transition-opacity group-hover:opacity-100"
                          title="Delete message"
                        >
                          <Trash2 className="h-3 w-3 text-blue-200 hover:text-white" />
                        </button>
                      )}
                    </div>
                    <p className="whitespace-pre-wrap break-words">
                      {renderContentWithMentions(message.content, message.isOwn)}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </CardContent>

        <div className="border-t bg-gray-50 p-4">
          {error && (
            <div className="mb-3 rounded-lg bg-red-50 p-2 text-sm text-red-700">
              {error}
            </div>
          )}
          {replyingTo && (
            <div className="mb-3 flex items-center justify-between rounded-lg bg-gray-100 p-2 text-sm">
              <div className="flex-1 truncate">
                <span className="font-medium text-gray-700">Replying to {replyingTo.anonymousId}: </span>
                <span className="text-gray-500">{replyingTo.content}</span>
              </div>
              <button
                onClick={() => setReplyingTo(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <form onSubmit={handleSend} className="flex gap-2">
            <Input
              placeholder="Name (optional)"
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className="w-28 flex-shrink-0"
              maxLength={30}
            />
            <Input
              ref={inputRef}
              placeholder={replyingTo ? `Reply to ${replyingTo.anonymousId}...` : "Type a message... (use @Anon#XXXX to mention)"}
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              className="flex-1"
              maxLength={500}
            />
            <Button type="submit" disabled={isSending || !messageContent.trim()}>
              {isSending ? "..." : "Send"}
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
