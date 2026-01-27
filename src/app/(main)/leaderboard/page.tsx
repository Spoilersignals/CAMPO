import { Leaderboard } from "@/components/social/leaderboard";
import { Trophy } from "lucide-react";

export default function LeaderboardPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-amber-400 to-orange-500">
          <Trophy className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Leaderboard
          </h1>
          <p className="text-gray-500">Top contributors this week</p>
        </div>
      </div>

      <Leaderboard />
    </div>
  );
}
