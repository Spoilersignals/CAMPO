"use client";

import { useState, useEffect, useTransition } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { formatRelativeTime } from "@/lib/utils";
import {
  getGroupMessages,
  adminDeleteMessage,
  getBannedWords,
  addBannedWord,
  removeBannedWord,
} from "@/actions/group-chat";

type Message = {
  id: string;
  content: string;
  authorName: string | null;
  createdAt: Date;
  isOwn: boolean;
};

type BannedWord = {
  id: string;
  word: string;
  isDefault: boolean;
};

export default function AdminGroupChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [bannedWords, setBannedWords] = useState<BannedWord[]>([]);
  const [newWord, setNewWord] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    const [messagesResult, wordsResult] = await Promise.all([
      getGroupMessages(100),
      getBannedWords(),
    ]);

    if (messagesResult.success && messagesResult.data) {
      setMessages(messagesResult.data.messages);
    }
    if (wordsResult.success && wordsResult.data) {
      setBannedWords(wordsResult.data.words);
    }
  }

  function handleDeleteMessage(messageId: string) {
    startTransition(async () => {
      setError(null);
      const result = await adminDeleteMessage(messageId);
      if (result.success) {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      } else {
        setError(result.error || "Failed to delete message");
      }
    });
  }

  function handleAddBannedWord() {
    if (!newWord.trim()) return;

    startTransition(async () => {
      setError(null);
      const result = await addBannedWord(newWord);
      if (result.success && result.data) {
        setBannedWords((prev) => [
          { id: result.data!.id, word: newWord.trim().toLowerCase(), isDefault: false },
          ...prev,
        ]);
        setNewWord("");
      } else {
        setError(result.error || "Failed to add banned word");
      }
    });
  }

  function handleRemoveBannedWord(id: string) {
    startTransition(async () => {
      setError(null);
      const result = await removeBannedWord(id);
      if (result.success) {
        setBannedWords((prev) => prev.filter((w) => w.id !== id));
      } else {
        setError(result.error || "Failed to remove banned word");
      }
    });
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Group Chat Moderation</h1>

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Messages Moderation</CardTitle>
          </CardHeader>
          <CardContent>
            {messages.length === 0 ? (
              <p className="text-center text-gray-500">No messages found</p>
            ) : (
              <div className="max-h-[600px] space-y-3 overflow-y-auto">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className="flex items-start justify-between gap-3 rounded-lg border p-3"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">
                          {message.authorName || "Anonymous"}
                        </span>
                        <span className="text-gray-500">
                          {formatRelativeTime(message.createdAt)}
                        </span>
                      </div>
                      <p className="mt-1 break-words text-sm text-gray-700">
                        {message.content}
                      </p>
                    </div>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                      disabled={isPending}
                    >
                      Delete
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Banned Words Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Add banned word..."
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleAddBannedWord();
                    }
                  }}
                />
                <Button
                  onClick={handleAddBannedWord}
                  disabled={isPending || !newWord.trim()}
                >
                  Add
                </Button>
              </div>

              <div className="max-h-[500px] space-y-2 overflow-y-auto">
                {bannedWords.map((word) => (
                  <div
                    key={word.id}
                    className="flex items-center justify-between rounded-lg border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-sm">{word.word}</span>
                      {word.isDefault && (
                        <Badge variant="default">Default</Badge>
                      )}
                    </div>
                    {!word.isDefault && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveBannedWord(word.id)}
                        disabled={isPending}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
