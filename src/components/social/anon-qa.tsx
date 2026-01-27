"use client";

import { useState } from "react";
import { MessageCircleQuestion, Send, Check, X } from "lucide-react";
import { askQuestion } from "@/actions/anon-qa";

interface AskQuestionFormProps {
  recipientCode?: string;
  recipientId?: string;
  onSuccess?: () => void;
}

export function AskQuestionForm({ recipientCode, recipientId, onSuccess }: AskQuestionFormProps) {
  const [question, setQuestion] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!question.trim()) return;

    setSubmitting(true);
    const result = await askQuestion(question.trim(), recipientCode, recipientId);
    
    if (result.success) {
      setSubmitted(true);
      setQuestion("");
      setTimeout(() => setSubmitted(false), 3000);
      onSuccess?.();
    }
    setSubmitting(false);
  }

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20 border border-violet-100 dark:border-violet-800">
      <div className="flex items-center gap-2 mb-3">
        <MessageCircleQuestion className="h-5 w-5 text-violet-500" />
        <span className="font-bold text-gray-900 dark:text-white">Ask Anonymously</span>
      </div>

      {submitted ? (
        <div className="flex items-center gap-2 text-green-600 py-4 justify-center">
          <Check className="h-5 w-5" />
          <span className="font-medium">Question sent anonymously!</span>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <textarea
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask anything... they won't know it's you 👀"
            className="w-full p-3 text-sm border border-violet-200 dark:border-violet-700 rounded-xl bg-white dark:bg-gray-800 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
            rows={3}
            maxLength={500}
          />
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-gray-400">{question.length}/500</span>
            <button
              type="submit"
              disabled={!question.trim() || submitting}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-500 text-white rounded-full text-sm font-medium hover:opacity-90 disabled:opacity-50 transition-all"
            >
              <Send className="h-4 w-4" />
              {submitting ? "Sending..." : "Send"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface QuestionCardProps {
  question: {
    id: string;
    question: string;
    createdAt: Date;
    status: string;
    answer?: {
      content: string;
      createdAt: Date;
    } | null;
  };
  onAnswer?: (questionId: string, content: string) => void;
  onIgnore?: (questionId: string) => void;
  isOwner?: boolean;
}

export function QuestionCard({ question, onAnswer, onIgnore, isOwner }: QuestionCardProps) {
  const [answering, setAnswering] = useState(false);
  const [answerText, setAnswerText] = useState("");

  function handleSubmitAnswer() {
    if (!answerText.trim() || !onAnswer) return;
    onAnswer(question.id, answerText.trim());
    setAnswering(false);
    setAnswerText("");
  }

  return (
    <div className="p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-full bg-violet-100 dark:bg-violet-900/30">
          <MessageCircleQuestion className="h-4 w-4 text-violet-500" />
        </div>
        <div className="flex-1">
          <p className="text-gray-800 dark:text-gray-200 font-medium">
            {question.question}
          </p>
          
          {question.answer && (
            <div className="mt-3 p-3 rounded-xl bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-900/20 dark:to-purple-900/20">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {question.answer.content}
              </p>
            </div>
          )}

          {isOwner && !question.answer && question.status === "PENDING" && (
            <div className="mt-3">
              {answering ? (
                <div className="space-y-2">
                  <textarea
                    value={answerText}
                    onChange={(e) => setAnswerText(e.target.value)}
                    placeholder="Type your answer..."
                    className="w-full p-3 text-sm border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-700 focus:ring-2 focus:ring-violet-500 resize-none"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSubmitAnswer}
                      className="px-4 py-1.5 bg-violet-500 text-white rounded-full text-sm font-medium hover:bg-violet-600"
                    >
                      Reply
                    </button>
                    <button
                      onClick={() => setAnswering(false)}
                      className="px-4 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full text-sm hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setAnswering(true)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-violet-100 dark:bg-violet-900/30 text-violet-600 rounded-full text-sm font-medium hover:bg-violet-200"
                  >
                    <Check className="h-4 w-4" />
                    Answer
                  </button>
                  <button
                    onClick={() => onIgnore?.(question.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-500 rounded-full text-sm hover:bg-gray-200"
                  >
                    <X className="h-4 w-4" />
                    Ignore
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
