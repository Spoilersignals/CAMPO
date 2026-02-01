"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  HelpCircle,
  Sparkles,
  CheckCircle2,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Spinner } from "@/components/ui/spinner";
import { createGame } from "@/actions/two-truths";
import { cn } from "@/lib/utils";

export default function NewTwoTruthsPage() {
  const router = useRouter();
  const [statements, setStatements] = useState(["", "", ""]);
  const [lieIndex, setLieIndex] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  function updateStatement(index: number, value: string) {
    const newStatements = [...statements];
    newStatements[index] = value;
    setStatements(newStatements);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (statements.some((s) => !s.trim())) {
      setError("Please fill in all three statements");
      return;
    }

    if (lieIndex === null) {
      setError("Please select which statement is the lie");
      return;
    }

    setIsSubmitting(true);

    const result = await createGame(
      statements[0],
      statements[1],
      statements[2],
      lieIndex
    );

    setIsSubmitting(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/games/two-truths");
      }, 1500);
    } else {
      setError(result.error || "Failed to create game");
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Card className="overflow-hidden">
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 p-8 text-center text-white">
            <CheckCircle2 className="mx-auto h-16 w-16 mb-4" />
            <h2 className="text-2xl font-bold">Game Created!</h2>
            <p className="mt-2 opacity-90">
              Your Two Truths, One Lie game is now live
            </p>
          </div>
          <CardContent className="p-6 text-center">
            <p className="text-gray-600">
              Redirecting you to see other games...
            </p>
            <Spinner className="mx-auto mt-4" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/games/two-truths"
        className="mb-6 inline-flex items-center text-sm text-gray-500 hover:text-gray-900"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Back to games
      </Link>

      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3">
          <HelpCircle className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Create Your Game</h1>
          <p className="text-gray-500">Share 2 truths and 1 lie</p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100 p-4">
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-amber-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-amber-800">
              Games expire after 24 hours
            </p>
            <p className="text-sm text-amber-600 mt-1">
              Your game will be active for others to guess for the next 24 hours
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50 border-b">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Write Your Statements
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-sm text-gray-600">
              Enter 3 statements about yourself. Two should be true and one
              should be a lie. Then select which one is the lie!
            </p>

            {[1, 2, 3].map((num) => (
              <div key={num} className="space-y-2">
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-lg font-bold transition-all",
                      lieIndex === num
                        ? "bg-red-500 text-white ring-4 ring-red-100"
                        : statements[num - 1].trim()
                        ? "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                        : "bg-gray-100 text-gray-400"
                    )}
                  >
                    {num}
                  </div>
                  <div className="flex-1">
                    <Textarea
                      placeholder={`Statement ${num}...`}
                      value={statements[num - 1]}
                      onChange={(e) => updateStatement(num - 1, e.target.value)}
                      rows={2}
                      className="resize-none"
                    />
                  </div>
                </div>
              </div>
            ))}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Which statement is the LIE? 🎭
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[1, 2, 3].map((num) => (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setLieIndex(num)}
                    disabled={!statements[num - 1].trim()}
                    className={cn(
                      "flex flex-col items-center gap-2 rounded-xl border-2 p-4 transition-all",
                      lieIndex === num
                        ? "border-red-500 bg-red-50 text-red-700"
                        : statements[num - 1].trim()
                        ? "border-gray-200 hover:border-red-300 hover:bg-red-50 cursor-pointer"
                        : "border-gray-100 bg-gray-50 text-gray-300 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-full font-bold",
                        lieIndex === num
                          ? "bg-red-500 text-white"
                          : "bg-gray-200 text-gray-600"
                      )}
                    >
                      {num}
                    </div>
                    <span className="text-sm font-medium">
                      {lieIndex === num ? "THE LIE" : `Statement ${num}`}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 border border-red-200 p-3 text-red-700">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              >
                {isSubmitting ? (
                  <>
                    <Spinner size="sm" className="mr-2" />
                    Creating...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="mr-2 h-4 w-4" />
                    Create Game
                  </>
                )}
              </Button>
              <Link href="/games/two-truths">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="mt-6 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100 p-4">
        <p className="text-sm font-medium text-blue-800">💡 Pro tips:</p>
        <ul className="mt-2 space-y-1 text-sm text-blue-600">
          <li>• Make your lie believable - that&apos;s what makes it fun!</li>
          <li>• Include surprising truths that might seem like lies</li>
          <li>• Keep statements about the same length for fairness</li>
        </ul>
      </div>
    </div>
  );
}
