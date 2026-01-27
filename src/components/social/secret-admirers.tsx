"use client";

import { useState, useEffect } from "react";
import { Heart, Eye, EyeOff, Send } from "lucide-react";
import { sendAdmiration, getAdmirerCount, hasAdmired } from "@/actions/admirers";

interface SendAdmirationFormProps {
  targetCode: string;
}

export function SendAdmirationForm({ targetCode }: SendAdmirationFormProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [alreadySent, setAlreadySent] = useState(false);

  useEffect(() => {
    hasAdmired(targetCode).then(setAlreadySent);
  }, [targetCode]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (alreadySent) return;

    setSending(true);
    const result = await sendAdmiration(targetCode, message.trim() || undefined);
    if (result.success) {
      setSent(true);
    }
    setSending(false);
  }

  if (alreadySent || sent) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border border-pink-100 dark:border-pink-800">
        <div className="flex items-center gap-2 text-pink-500 justify-center py-4">
          <Heart className="h-5 w-5 fill-current" />
          <span className="font-medium">
            {sent ? "Your admiration has been sent secretly! 💕" : "You already admire this person 💕"}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-pink-50 to-red-50 dark:from-pink-900/20 dark:to-red-900/20 border border-pink-100 dark:border-pink-800">
      <div className="flex items-center gap-2 mb-3">
        <Heart className="h-5 w-5 text-pink-500" />
        <span className="font-bold text-gray-900 dark:text-white">Secret Admirer</span>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Send a secret message... (optional)"
          className="w-full p-3 text-sm border border-pink-200 dark:border-pink-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
          rows={2}
          maxLength={200}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-gray-400">{message.length}/200</span>
          <button
            type="submit"
            disabled={sending}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-red-500 text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
          >
            <Send className="h-4 w-4" />
            {sending ? "Sending..." : "Send Secretly"}
          </button>
        </div>
      </form>

      <p className="text-xs text-center text-gray-500 mt-3">
        They&apos;ll see someone admires them, but not who 👀
      </p>
    </div>
  );
}

interface AdmirerCountDisplayProps {
  targetCode: string;
}

export function AdmirerCountDisplay({ targetCode }: AdmirerCountDisplayProps) {
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAdmirerCount(targetCode).then((c) => {
      setCount(c);
      setLoading(false);
    });
  }, [targetCode]);

  if (loading) return null;
  if (count === 0) return null;

  return (
    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-pink-100 to-red-100 dark:from-pink-900/30 dark:to-red-900/30 text-pink-600">
      <Heart className="h-4 w-4 fill-current" />
      <span className="text-sm font-medium">
        {count} secret {count === 1 ? "admirer" : "admirers"}
      </span>
    </div>
  );
}

interface AdmirerMessageProps {
  message?: string | null;
  revealed: boolean;
}

export function AdmirerMessage({ message, revealed }: AdmirerMessageProps) {
  const [showMessage, setShowMessage] = useState(revealed);

  if (!message) return null;

  return (
    <div className="p-3 rounded-xl bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-pink-500">Secret Message</span>
        <button
          onClick={() => setShowMessage(!showMessage)}
          className="p-1 rounded-full hover:bg-pink-100 dark:hover:bg-pink-800 transition-colors"
        >
          {showMessage ? (
            <EyeOff className="h-4 w-4 text-pink-400" />
          ) : (
            <Eye className="h-4 w-4 text-pink-400" />
          )}
        </button>
      </div>
      <p className={`text-sm text-gray-700 dark:text-gray-300 ${showMessage ? "" : "blur-sm select-none"}`}>
        {message}
      </p>
    </div>
  );
}
