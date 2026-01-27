"use client";

import { useState, useEffect } from "react";
import { MessageCircleQuestion, Inbox } from "lucide-react";
import { getMyReceivedQuestions, answerQuestion, ignoreQuestion } from "@/actions/anon-qa";
import { QuestionCard } from "@/components/social/anon-qa";
import { useSession } from "next-auth/react";
import Link from "next/link";

type Question = {
  id: string;
  question: string;
  createdAt: Date;
  status: string;
  answer?: {
    content: string;
    createdAt: Date;
  } | null;
};

export default function QAPage() {
  const { data: session } = useSession();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "pending" | "answered">("all");

  useEffect(() => {
    if (session?.user) {
      loadQuestions();
    } else {
      setLoading(false);
    }
  }, [session]);

  async function loadQuestions() {
    const status = filter === "all" ? undefined : filter === "pending" ? "PENDING" : "ANSWERED";
    const data = await getMyReceivedQuestions(status);
    setQuestions(data as Question[]);
    setLoading(false);
  }

  async function handleAnswer(questionId: string, content: string) {
    await answerQuestion(questionId, content);
    loadQuestions();
  }

  async function handleIgnore(questionId: string) {
    await ignoreQuestion(questionId);
    loadQuestions();
  }

  if (!session?.user) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <MessageCircleQuestion className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Anonymous Q&A
        </h1>
        <p className="text-gray-500 mb-6">
          Sign in to receive anonymous questions from others
        </p>
        <Link
          href="/auth/signin"
          className="inline-block px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full font-medium hover:opacity-90"
        >
          Sign In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-violet-500 to-purple-500">
          <MessageCircleQuestion className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Questions
          </h1>
          <p className="text-gray-500">Answer anonymously asked questions</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        {(["all", "pending", "answered"] as const).map((f) => (
          <button
            key={f}
            onClick={() => {
              setFilter(f);
              setLoading(true);
              setTimeout(loadQuestions, 0);
            }}
            className={`px-4 py-2 rounded-full text-sm font-medium capitalize transition-all ${
              filter === f
                ? "bg-violet-600 text-white"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-16">
          <Inbox className="h-16 w-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No questions yet
          </h2>
          <p className="text-gray-500">
            Share your profile link to receive anonymous questions
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {questions.map((q) => (
            <QuestionCard
              key={q.id}
              question={q}
              isOwner
              onAnswer={handleAnswer}
              onIgnore={handleIgnore}
            />
          ))}
        </div>
      )}
    </div>
  );
}
