"use client";

import { useState, useEffect } from "react";
import { Trophy, Flame, MessageCircle, Heart, Medal } from "lucide-react";
import { getLeaderboard } from "@/actions/leaderboard";

type Category = "top_poster" | "funniest" | "most_helpful" | "streak_master";
type Period = "weekly" | "monthly" | "alltime";

type LeaderboardEntry = {
  rank: number;
  score: number;
  persona: {
    avatar: string;
    alias: string;
    color: string;
  };
};

const CATEGORIES: { id: Category; label: string; icon: typeof Trophy; color: string }[] = [
  { id: "top_poster", label: "Top Posters", icon: MessageCircle, color: "text-blue-500" },
  { id: "streak_master", label: "Streak Masters", icon: Flame, color: "text-orange-500" },
  { id: "funniest", label: "Funniest", icon: Heart, color: "text-pink-500" },
  { id: "most_helpful", label: "Most Helpful", icon: Trophy, color: "text-amber-500" },
];

const PERIODS: { id: Period; label: string }[] = [
  { id: "weekly", label: "This Week" },
  { id: "monthly", label: "This Month" },
  { id: "alltime", label: "All Time" },
];

export function Leaderboard() {
  const [category, setCategory] = useState<Category>("top_poster");
  const [period, setPeriod] = useState<Period>("weekly");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getLeaderboard(category, period, 10).then((e) => {
      setEntries(e);
      setLoading(false);
    });
  }, [category, period]);

  const currentCategory = CATEGORIES.find((c) => c.id === category)!;
  const Icon = currentCategory.icon;

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 overflow-hidden">
      <div className="p-4 bg-gradient-to-r from-amber-500 to-orange-500">
        <div className="flex items-center gap-2 text-white mb-3">
          <Trophy className="h-6 w-6" />
          <h2 className="text-xl font-bold">Leaderboard</h2>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 -mb-2">
          {PERIODS.map((p) => (
            <button
              key={p.id}
              onClick={() => setPeriod(p.id)}
              className={`px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                period === p.id
                  ? "bg-white text-orange-600"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {CATEGORIES.map((c) => {
            const CatIcon = c.icon;
            return (
              <button
                key={c.id}
                onClick={() => setCategory(c.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  category === c.id
                    ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
                }`}
              >
                <CatIcon className="h-4 w-4" />
                {c.label}
              </button>
            );
          })}
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-gray-100 dark:bg-gray-700 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-8">
            <Medal className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No entries yet. Be the first!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <div
                key={index}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  index === 0
                    ? "bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 border border-amber-200 dark:border-amber-800"
                    : index === 1
                    ? "bg-gradient-to-r from-gray-100 to-gray-50 dark:from-gray-700 dark:to-gray-800 border border-gray-200 dark:border-gray-600"
                    : index === 2
                    ? "bg-gradient-to-r from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 border border-orange-200 dark:border-orange-800"
                    : "bg-gray-50 dark:bg-gray-700/50"
                }`}
              >
                <div className="w-8 text-center">
                  {index === 0 ? (
                    <span className="text-2xl">🥇</span>
                  ) : index === 1 ? (
                    <span className="text-2xl">🥈</span>
                  ) : index === 2 ? (
                    <span className="text-2xl">🥉</span>
                  ) : (
                    <span className="font-bold text-gray-400">{entry.rank}</span>
                  )}
                </div>

                <div
                  className="h-10 w-10 rounded-full flex items-center justify-center text-xl"
                  style={{ backgroundColor: entry.persona.color + "30" }}
                >
                  {entry.persona.avatar}
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="font-semibold truncate"
                    style={{ color: entry.persona.color }}
                  >
                    {entry.persona.alias}
                  </p>
                </div>

                <div className="flex items-center gap-1">
                  <Icon className={`h-4 w-4 ${currentCategory.color}`} />
                  <span className="font-bold text-gray-900 dark:text-white">
                    {entry.score}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
