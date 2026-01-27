"use client";

import { useState, useEffect } from "react";
import { Flame, Trophy, Zap } from "lucide-react";
import { getMyStreak } from "@/actions/streaks";

type Streak = {
  currentStreak: number;
  longestStreak: number;
  totalPosts: number;
  lastPostDate: Date | null;
};

export function StreakDisplay() {
  const [streak, setStreak] = useState<Streak | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStreak().then((s) => {
      setStreak(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="animate-pulse h-24 bg-gray-100 dark:bg-gray-800 rounded-2xl" />
    );
  }

  if (!streak) {
    return (
      <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800">
        <div className="flex items-center gap-2 mb-2">
          <Flame className="h-5 w-5 text-orange-500" />
          <span className="font-bold text-gray-900 dark:text-white">Start your streak!</span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Post daily to build your streak and climb the leaderboard 🔥
        </p>
      </div>
    );
  }

  const streakColor = streak.currentStreak >= 7 
    ? "from-orange-500 to-red-500" 
    : streak.currentStreak >= 3 
    ? "from-yellow-500 to-orange-500"
    : "from-gray-400 to-gray-500";

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 border border-orange-100 dark:border-orange-800">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className={`p-2 rounded-full bg-gradient-to-br ${streakColor}`}>
            <Flame className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {streak.currentStreak}
            </p>
            <p className="text-xs text-gray-500">day streak</p>
          </div>
        </div>

        {streak.currentStreak >= 7 && (
          <span className="text-2xl">🔥</span>
        )}
      </div>

      <div className="flex items-center gap-4 text-sm">
        <div className="flex items-center gap-1.5">
          <Trophy className="h-4 w-4 text-amber-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Best: <span className="font-semibold text-gray-900 dark:text-white">{streak.longestStreak}</span>
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="h-4 w-4 text-purple-500" />
          <span className="text-gray-600 dark:text-gray-400">
            Total: <span className="font-semibold text-gray-900 dark:text-white">{streak.totalPosts}</span>
          </span>
        </div>
      </div>

      {streak.currentStreak > 0 && (
        <div className="mt-3 pt-3 border-t border-orange-200 dark:border-orange-800">
          <p className="text-xs text-center text-gray-500">
            {streak.currentStreak >= 30 ? "🏆 Legend status!" :
             streak.currentStreak >= 14 ? "💪 Two weeks strong!" :
             streak.currentStreak >= 7 ? "🔥 On fire!" :
             streak.currentStreak >= 3 ? "⚡ Keep going!" :
             "📈 Building momentum!"}
          </p>
        </div>
      )}
    </div>
  );
}

export function StreakBadge({ streak }: { streak: number }) {
  if (streak === 0) return null;

  return (
    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium">
      <Flame className="h-3 w-3" />
      <span>{streak}</span>
    </div>
  );
}
