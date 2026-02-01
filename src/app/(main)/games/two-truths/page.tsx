"use client";

import { useState, useEffect, useTransition, useCallback } from "react";
import Link from "next/link";
import {
  Plus,
  HelpCircle,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  Trophy,
  Sparkles,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import {
  getActiveGames,
  makeGuess,
  getUserGuess,
  type TwoTruthsGame,
} from "@/actions/two-truths";
import { formatRelativeTime, cn } from "@/lib/utils";

interface GameCardProps {
  game: TwoTruthsGame;
  onGuessComplete: () => void;
}

function ConfettiParticle({ delay }: { delay: number }) {
  const colors = ["#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7", "#DDA0DD", "#98D8C8"];
  const color = colors[Math.floor(Math.random() * colors.length)];
  const left = Math.random() * 100;
  const animationDuration = 1 + Math.random() * 1;

  return (
    <div
      className="absolute w-2 h-2 rounded-full animate-confetti"
      style={{
        backgroundColor: color,
        left: `${left}%`,
        top: "-10px",
        animationDelay: `${delay}ms`,
        animationDuration: `${animationDuration}s`,
      }}
    />
  );
}

function Confetti() {
  const particles = Array.from({ length: 50 }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-50">
      {particles.map((i) => (
        <ConfettiParticle key={i} delay={i * 30} />
      ))}
    </div>
  );
}

function GameCard({ game, onGuessComplete }: GameCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [result, setResult] = useState<{
    lieIndex: number;
    isCorrect: boolean;
    guessedIndex: number;
  } | null>(null);
  const [isPending, startTransition] = useTransition();
  const [showConfetti, setShowConfetti] = useState(false);
  const [revealed, setRevealed] = useState(false);

  const statements = [
    { index: 1, text: game.statement1 },
    { index: 2, text: game.statement2 },
    { index: 3, text: game.statement3 },
  ];

  useEffect(() => {
    if (game.hasGuessed) {
      getUserGuess(game.id).then((res) => {
        if (res.success && res.data && res.data.guessedIndex !== null) {
          setResult({
            lieIndex: res.data.lieIndex!,
            isCorrect: res.data.isCorrect!,
            guessedIndex: res.data.guessedIndex,
          });
          setRevealed(true);
        }
      });
    }
  }, [game.hasGuessed, game.id]);

  function handleGuess(index: number) {
    if (result || isPending) return;
    setSelectedIndex(index);

    startTransition(async () => {
      const res = await makeGuess(game.id, index);
      if (res.success && res.data) {
        setResult({
          lieIndex: res.data.lieIndex,
          isCorrect: res.data.isCorrect,
          guessedIndex: index,
        });

        setTimeout(() => {
          setRevealed(true);
          if (res.data!.isCorrect) {
            setShowConfetti(true);
            setTimeout(() => setShowConfetti(false), 2000);
          }
          onGuessComplete();
        }, 500);
      }
    });
  }

  const successRate =
    game.totalGuesses > 0
      ? Math.round((game.correctGuesses / game.totalGuesses) * 100)
      : 0;

  return (
    <Card className="overflow-hidden">
      {showConfetti && <Confetti />}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <div className="flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            <span className="font-medium">Spot the Lie!</span>
          </div>
          <div className="flex items-center gap-4 text-sm opacity-90">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {formatRelativeTime(game.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {game.totalGuesses}
            </span>
          </div>
        </div>
      </div>

      <CardContent className="p-6">
        <p className="mb-4 text-sm text-gray-500">
          Which one is the lie? Click to guess!
        </p>

        <div className="space-y-3">
          {statements.map((statement) => {
            const isLie = result && statement.index === result.lieIndex;
            const wasGuessed = result && statement.index === result.guessedIndex;
            const isSelected = selectedIndex === statement.index;

            return (
              <button
                key={statement.index}
                onClick={() => handleGuess(statement.index)}
                disabled={!!result || isPending}
                className={cn(
                  "relative w-full rounded-xl border-2 p-4 text-left transition-all duration-300",
                  !result && !isPending && "hover:border-purple-400 hover:bg-purple-50 hover:scale-[1.02] cursor-pointer",
                  result && "cursor-default",
                  isSelected && !result && "border-purple-500 bg-purple-50",
                  revealed && isLie && "border-red-500 bg-red-50",
                  revealed && !isLie && "border-green-500 bg-green-50",
                  !revealed && !isSelected && "border-gray-200"
                )}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full font-bold transition-all duration-300",
                      revealed && isLie
                        ? "bg-red-500 text-white"
                        : revealed
                        ? "bg-green-500 text-white"
                        : "bg-gradient-to-br from-purple-500 to-pink-500 text-white"
                    )}
                  >
                    {revealed ? (
                      isLie ? (
                        <XCircle className="h-5 w-5" />
                      ) : (
                        <CheckCircle2 className="h-5 w-5" />
                      )
                    ) : (
                      statement.index
                    )}
                  </div>
                  <div className="flex-1">
                    <p
                      className={cn(
                        "font-medium transition-colors duration-300",
                        revealed && isLie ? "text-red-800" : revealed ? "text-green-800" : "text-gray-900"
                      )}
                    >
                      {statement.text}
                    </p>
                    {revealed && (
                      <div className="mt-1 flex items-center gap-2">
                        {isLie ? (
                          <span className="text-sm font-medium text-red-600">
                            This is the LIE! 🎭
                          </span>
                        ) : (
                          <span className="text-sm font-medium text-green-600">
                            Truth ✓
                          </span>
                        )}
                        {wasGuessed && (
                          <span
                            className={cn(
                              "text-xs px-2 py-0.5 rounded-full",
                              result.isCorrect
                                ? "bg-green-100 text-green-700"
                                : "bg-red-100 text-red-700"
                            )}
                          >
                            Your guess
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {isPending && isSelected && (
                  <div className="absolute inset-0 flex items-center justify-center bg-white/50 rounded-xl">
                    <Spinner />
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {revealed && result && (
          <div
            className={cn(
              "mt-6 flex items-center justify-center gap-2 rounded-xl p-4 transition-all",
              result.isCorrect
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200"
                : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200"
            )}
          >
            {result.isCorrect ? (
              <>
                <Trophy className="h-6 w-6 text-yellow-500" />
                <span className="font-bold text-green-800">
                  You spotted the lie! 🎉
                </span>
              </>
            ) : (
              <>
                <XCircle className="h-6 w-6 text-red-500" />
                <span className="font-bold text-red-800">
                  Oops! That was actually true 😅
                </span>
              </>
            )}
          </div>
        )}

        {game.totalGuesses > 0 && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
            <span>Success rate: {successRate}%</span>
            <span>
              {game.correctGuesses}/{game.totalGuesses} got it right
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function TwoTruthsPage() {
  const [games, setGames] = useState<TwoTruthsGame[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    const result = await getActiveGames();
    if (result.success && result.data) {
      setGames(result.data.games);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadGames();
  }, [loadGames]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <style jsx global>{`
        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
        .animate-confetti {
          animation: confetti 2s ease-out forwards;
        }
      `}</style>

      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-gradient-to-br from-purple-500 to-pink-500 p-3">
            <HelpCircle className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Two Truths, One Lie
            </h1>
            <p className="text-gray-500">Can you spot the lie?</p>
          </div>
        </div>
        <Link href="/games/two-truths/new">
          <Button className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
            <Plus className="mr-2 h-4 w-4" />
            Create Your Own
          </Button>
        </Link>
      </div>

      <div className="mb-6 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-100 p-4">
        <div className="flex items-start gap-3">
          <Sparkles className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-purple-800">How to play</p>
            <p className="text-sm text-purple-600 mt-1">
              Each game has 3 statements - two are true and one is a lie. Click
              the statement you think is the lie. Can you outsmart your fellow
              students?
            </p>
          </div>
        </div>
      </div>

      <Link href="/games/two-truths/new" className="block mb-6">
        <div className="group rounded-xl border-2 border-dashed border-purple-200 bg-gradient-to-r from-purple-50/50 to-pink-50/50 p-6 text-center transition-all hover:border-purple-400 hover:bg-purple-50">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <Plus className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-gray-900 group-hover:text-purple-600">
            Create Your Own Game
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Share 2 truths and 1 lie about yourself
          </p>
          <div className="mt-3 inline-flex items-center text-sm font-medium text-purple-600">
            Get started
            <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </div>
        </div>
      </Link>

      {games.length === 0 ? (
        <Card className="p-8 text-center">
          <HelpCircle className="mx-auto mb-4 h-12 w-12 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900">No games yet</h3>
          <p className="mt-1 text-gray-500">
            Be the first to create a Two Truths, One Lie game!
          </p>
          <Link href="/games/two-truths/new">
            <Button className="mt-4">Create Game</Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onGuessComplete={loadGames} />
          ))}
        </div>
      )}
    </div>
  );
}
