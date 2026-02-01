"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  X,
  Eye,
  Send,
  Calendar,
  BarChart3,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { createPoll } from "@/actions/polls";
import { cn } from "@/lib/utils";

const POLL_COLORS = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-pink-500",
  "bg-orange-500",
  "bg-green-500",
  "bg-teal-500",
];

const POLL_COLORS_LIGHT = [
  "bg-blue-100",
  "bg-purple-100",
  "bg-pink-100",
  "bg-orange-100",
  "bg-green-100",
  "bg-teal-100",
];

export default function NewPollPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [expiresIn, setExpiresIn] = useState<string>("");
  const [showPreview, setShowPreview] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const validOptions = options.filter((opt) => opt.trim());

  function addOption() {
    if (options.length < 6) {
      setOptions([...options, ""]);
    }
  }

  function removeOption(index: number) {
    if (options.length > 2) {
      setOptions(options.filter((_, i) => i !== index));
    }
  }

  function updateOption(index: number, value: string) {
    const newOptions = [...options];
    newOptions[index] = value;
    setOptions(newOptions);
  }

  function getExpiryDate(): Date | undefined {
    if (!expiresIn) return undefined;

    const now = new Date();
    switch (expiresIn) {
      case "1h":
        return new Date(now.getTime() + 60 * 60 * 1000);
      case "6h":
        return new Date(now.getTime() + 6 * 60 * 60 * 1000);
      case "12h":
        return new Date(now.getTime() + 12 * 60 * 60 * 1000);
      case "24h":
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case "3d":
        return new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
      case "7d":
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      default:
        return undefined;
    }
  }

  async function handleSubmit() {
    setError("");

    if (!question.trim()) {
      setError("Please enter a question");
      return;
    }

    if (validOptions.length < 2) {
      setError("Please provide at least 2 options");
      return;
    }

    setIsSubmitting(true);

    const result = await createPoll(
      question.trim(),
      validOptions,
      getExpiryDate()
    );

    setIsSubmitting(false);

    if (result.success && result.data) {
      router.push(`/polls/${result.data.id}`);
    } else {
      setError(result.error || "Failed to create poll");
    }
  }

  const canSubmit = question.trim() && validOptions.length >= 2;

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/polls"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Polls
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Create a Poll</h1>
        <p className="text-gray-600">Ask your campus community anything</p>
      </div>

      <div className="space-y-6">
        {/* Question */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Your Question</CardTitle>
          </CardHeader>
          <CardContent>
            <Input
              placeholder="What do you want to ask?"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="text-lg"
              maxLength={200}
            />
            <p className="mt-2 text-right text-sm text-gray-500">
              {question.length}/200
            </p>
          </CardContent>
        </Card>

        {/* Options */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center justify-between text-base">
              <span>Options</span>
              <span className="text-sm font-normal text-gray-500">
                {validOptions.length}/6 options
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div
                    className={cn(
                      "h-3 w-3 shrink-0 rounded-full",
                      POLL_COLORS[index % POLL_COLORS.length]
                    )}
                  />
                  <Input
                    placeholder={`Option ${index + 1}`}
                    value={option}
                    onChange={(e) => updateOption(index, e.target.value)}
                    maxLength={100}
                  />
                  {options.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      className="shrink-0 px-2 text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
            {options.length < 6 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addOption}
                className="mt-3 w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Option
              </Button>
            )}
          </CardContent>
        </Card>

        {/* Expiry */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Calendar className="h-4 w-4" />
              Poll Duration (Optional)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                { value: "", label: "No limit" },
                { value: "1h", label: "1 hour" },
                { value: "6h", label: "6 hours" },
                { value: "12h", label: "12 hours" },
                { value: "24h", label: "24 hours" },
                { value: "3d", label: "3 days" },
                { value: "7d", label: "7 days" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setExpiresIn(option.value)}
                  className={cn(
                    "rounded-full px-4 py-2 text-sm font-medium transition-all",
                    expiresIn === option.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Error */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
            disabled={!canSubmit}
            className="flex-1"
          >
            <Eye className="mr-2 h-4 w-4" />
            {showPreview ? "Hide Preview" : "Preview"}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!canSubmit || isSubmitting}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
          >
            {isSubmitting ? (
              <Spinner size="sm" className="mr-2" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Create Poll
          </Button>
        </div>

        {/* Preview */}
        {showPreview && canSubmit && (
          <Card className="border-2 border-dashed border-blue-300 bg-blue-50/50">
            <CardHeader className="pb-2">
              <div className="mb-1 flex items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  Preview
                </Badge>
                {expiresIn && (
                  <Badge variant="outline" className="text-xs">
                    Expires in {expiresIn}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg">{question}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {validOptions.map((option, index) => (
                  <div
                    key={index}
                    className="relative overflow-hidden rounded-xl border-2 border-gray-200 bg-white p-4"
                  >
                    <div
                      className={cn(
                        "absolute inset-y-0 left-0 opacity-30",
                        POLL_COLORS[index % POLL_COLORS.length]
                      )}
                      style={{ width: `${Math.random() * 60 + 20}%` }}
                    />
                    <div className="relative flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-gray-900">
                          {option}
                        </span>
                      </div>
                      <span className="text-lg font-bold text-gray-600">
                        {Math.floor(Math.random() * 50) + 10}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-gray-500">
                <BarChart3 className="h-4 w-4" />
                <span>Results will be visible after voting</span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
