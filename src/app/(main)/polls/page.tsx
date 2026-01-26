"use client";

import { useState, useEffect, useTransition } from "react";
import Link from "next/link";
import { Plus, X, MessageCircle, BarChart3, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  submitPoll,
  getActivePolls,
  votePoll,
  getUserVote,
} from "@/actions/polls";
import { formatRelativeTime, cn } from "@/lib/utils";

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
}

interface Poll {
  id: string;
  question: string;
  pollNumber: number | null;
  createdAt: Date;
  options: PollOption[];
  totalVotes: number;
  commentCount: number;
}

export default function PollsPage() {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [userVotes, setUserVotes] = useState<Record<string, string | null>>({});
  const [votingPollId, setVotingPollId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadPolls();
  }, []);

  async function loadPolls() {
    setLoading(true);
    const result = await getActivePolls();
    if (result.success && result.data) {
      setPolls(result.data.polls);
      const votes: Record<string, string | null> = {};
      for (const poll of result.data.polls) {
        const voteResult = await getUserVote(poll.id);
        if (voteResult.success && voteResult.data) {
          votes[poll.id] = voteResult.data.optionId;
        }
      }
      setUserVotes(votes);
    }
    setLoading(false);
  }

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

  async function handleSubmitPoll(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError("");
    setIsSubmitting(true);

    const validOptions = options.filter((opt) => opt.trim());
    if (!question.trim()) {
      setSubmitError("Please enter a question");
      setIsSubmitting(false);
      return;
    }
    if (validOptions.length < 2) {
      setSubmitError("Please provide at least 2 options");
      setIsSubmitting(false);
      return;
    }

    const result = await submitPoll({ question: question.trim(), options: validOptions });
    setIsSubmitting(false);

    if (result.success) {
      setSubmitSuccess(true);
      setQuestion("");
      setOptions(["", ""]);
      setShowCreateForm(false);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } else {
      setSubmitError(result.error || "Failed to submit poll");
    }
  }

  async function handleVote(pollId: string, optionId: string) {
    if (userVotes[pollId]) return;
    setVotingPollId(pollId);

    startTransition(async () => {
      const result = await votePoll(optionId);
      if (result.success) {
        setUserVotes((prev) => ({ ...prev, [pollId]: optionId }));
        setPolls((prev) =>
          prev.map((poll) => {
            if (poll.id === pollId) {
              return {
                ...poll,
                totalVotes: poll.totalVotes + 1,
                options: poll.options.map((opt) =>
                  opt.id === optionId
                    ? { ...opt, voteCount: opt.voteCount + 1 }
                    : opt
                ),
              };
            }
            return poll;
          })
        );
      }
      setVotingPollId(null);
    });
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Campus Polls</h1>
          <p className="text-gray-600">Vote on polls and see what your campus thinks!</p>
        </div>
        <Button onClick={() => setShowCreateForm(!showCreateForm)}>
          <Plus className="mr-2 h-4 w-4" />
          Create Poll
        </Button>
      </div>

      {submitSuccess && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4 text-green-800">
          <CheckCircle2 className="h-5 w-5" />
          <span>Poll submitted successfully! It will appear once approved.</span>
        </div>
      )}

      {showCreateForm && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Create a New Poll</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmitPoll} className="space-y-4">
              <Input
                label="Question"
                placeholder="What do you want to ask?"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                error={submitError && !question.trim() ? "Required" : undefined}
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Options (min 2, max 6)
                </label>
                <div className="space-y-2">
                  {options.map((option, index) => (
                    <div key={index} className="flex gap-2">
                      <Input
                        placeholder={`Option ${index + 1}`}
                        value={option}
                        onChange={(e) => updateOption(index, e.target.value)}
                      />
                      {options.length > 2 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeOption(index)}
                          className="shrink-0 px-2"
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
                    variant="ghost"
                    size="sm"
                    onClick={addOption}
                    className="mt-2"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Add Option
                  </Button>
                )}
              </div>

              {submitError && (
                <p className="text-sm text-red-600">{submitError}</p>
              )}

              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? <Spinner size="sm" className="mr-2" /> : null}
                  Submit Poll
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {polls.length === 0 ? (
        <Card className="p-8 text-center">
          <BarChart3 className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No active polls</h3>
          <p className="mt-1 text-gray-500">Be the first to create a poll!</p>
        </Card>
      ) : (
        <div className="space-y-6">
          {polls.map((poll) => {
            const hasVoted = !!userVotes[poll.id];
            const isVoting = votingPollId === poll.id;

            return (
              <Card key={poll.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div>
                      {poll.pollNumber && (
                        <span className="text-sm font-medium text-blue-600">
                          Poll #{poll.pollNumber}
                        </span>
                      )}
                      <CardTitle className="text-lg">{poll.question}</CardTitle>
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatRelativeTime(poll.createdAt)}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {poll.options.map((option) => {
                      const percentage =
                        poll.totalVotes > 0
                          ? Math.round((option.voteCount / poll.totalVotes) * 100)
                          : 0;
                      const isSelected = userVotes[poll.id] === option.id;

                      return (
                        <button
                          key={option.id}
                          onClick={() => handleVote(poll.id, option.id)}
                          disabled={hasVoted || isVoting}
                          className={cn(
                            "relative w-full overflow-hidden rounded-lg border p-3 text-left transition-all",
                            hasVoted
                              ? "cursor-default"
                              : "cursor-pointer hover:border-blue-400 hover:bg-blue-50",
                            isSelected
                              ? "border-blue-500 bg-blue-50"
                              : "border-gray-200 bg-white"
                          )}
                        >
                          {hasVoted && (
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 transition-all",
                                isSelected ? "bg-blue-200" : "bg-gray-100"
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          )}
                          <div className="relative flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              {isSelected && (
                                <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              )}
                              <span
                                className={cn(
                                  "font-medium",
                                  isSelected ? "text-blue-900" : "text-gray-900"
                                )}
                              >
                                {option.text}
                              </span>
                            </div>
                            {hasVoted && (
                              <span className="text-sm font-medium text-gray-600">
                                {percentage}% ({option.voteCount})
                              </span>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <span>{poll.totalVotes} vote{poll.totalVotes !== 1 ? "s" : ""}</span>
                    <Link
                      href={`/polls/${poll.id}`}
                      className="flex items-center gap-1 text-blue-600 hover:underline"
                    >
                      <MessageCircle className="h-4 w-4" />
                      {poll.commentCount} comment{poll.commentCount !== 1 ? "s" : ""}
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
