"use client";

import { useState, useEffect } from "react";
import { Swords, Clock, Crown } from "lucide-react";
import { getActiveBattles, voteBattle, getMyVote, getBattleResults } from "@/actions/battles";
import { formatDistanceToNow } from "date-fns";

type Battle = {
  id: string;
  confession1: { id: string; content: string; confessionNumber: number | null };
  confession2: { id: string; content: string; confessionNumber: number | null };
  winner1Votes: number;
  winner2Votes: number;
  endsAt: Date;
  status: string;
  _count: { votes: number };
};

export function ConfessionBattleCard({ battle: initialBattle }: { battle: Battle }) {
  const [battle, setBattle] = useState(initialBattle);
  const [myVote, setMyVote] = useState<number | null>(null);
  const [voting, setVoting] = useState(false);

  useEffect(() => {
    getMyVote(battle.id).then(setMyVote);
  }, [battle.id]);

  async function handleVote(choice: 1 | 2) {
    if (myVote) return;
    setVoting(true);
    const result = await voteBattle(battle.id, choice);
    if (result.success) {
      setMyVote(choice);
      const updated = await getBattleResults(battle.id);
      if (updated) {
        setBattle({ ...battle, winner1Votes: updated.winner1Votes, winner2Votes: updated.winner2Votes });
      }
    }
    setVoting(false);
  }

  const total = battle.winner1Votes + battle.winner2Votes;
  const percent1 = total > 0 ? Math.round((battle.winner1Votes / total) * 100) : 50;
  const percent2 = total > 0 ? Math.round((battle.winner2Votes / total) * 100) : 50;
  const isEnded = new Date(battle.endsAt) < new Date();
  const winner = isEnded ? (battle.winner1Votes > battle.winner2Votes ? 1 : battle.winner1Votes < battle.winner2Votes ? 2 : 0) : 0;

  return (
    <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-100 dark:border-purple-800">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Swords className="h-5 w-5 text-purple-500" />
          <span className="font-bold text-gray-900 dark:text-white">Confession Battle</span>
        </div>
        <div className="flex items-center gap-1 text-xs text-gray-500">
          <Clock className="h-3.5 w-3.5" />
          {isEnded ? "Ended" : formatDistanceToNow(new Date(battle.endsAt), { addSuffix: true })}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {[1, 2].map((num) => {
          const confession = num === 1 ? battle.confession1 : battle.confession2;
          const percent = num === 1 ? percent1 : percent2;
          const votes = num === 1 ? battle.winner1Votes : battle.winner2Votes;
          const isWinner = winner === num;
          const isVoted = myVote === num;

          return (
            <button
              key={num}
              onClick={() => !isEnded && !myVote && handleVote(num as 1 | 2)}
              disabled={!!myVote || isEnded || voting}
              className={`relative p-4 rounded-xl text-left transition-all ${
                isVoted 
                  ? "ring-2 ring-purple-500 bg-purple-100 dark:bg-purple-900/40"
                  : isWinner
                  ? "bg-gradient-to-br from-amber-100 to-yellow-100 dark:from-amber-900/40 dark:to-yellow-900/40"
                  : "bg-white dark:bg-gray-800 hover:shadow-md"
              } ${!myVote && !isEnded ? "cursor-pointer hover:scale-[1.02]" : "cursor-default"}`}
            >
              {isWinner && (
                <Crown className="absolute -top-2 -right-2 h-6 w-6 text-amber-500" />
              )}
              
              <span className="text-xs font-bold text-purple-500 mb-2 block">
                #{confession.confessionNumber || "?"}
              </span>
              
              <p className="text-sm text-gray-800 dark:text-gray-200 line-clamp-3 mb-3">
                {confession.content}
              </p>

              {(myVote || isEnded) && (
                <div className="mt-2">
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs">
                    <span className="text-gray-500">{votes} votes</span>
                    <span className="font-bold text-purple-600">{percent}%</span>
                  </div>
                </div>
              )}
            </button>
          );
        })}
      </div>

      <p className="text-center text-xs text-gray-500 mt-3">
        {total} total votes
      </p>
    </div>
  );
}

export function BattlesList() {
  const [battles, setBattles] = useState<Battle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getActiveBattles().then((b) => {
      setBattles(b as Battle[]);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return <div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />;
  }

  if (battles.length === 0) {
    return (
      <div className="text-center py-8">
        <Swords className="h-12 w-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500">No active battles right now</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {battles.map((battle) => (
        <ConfessionBattleCard key={battle.id} battle={battle} />
      ))}
    </div>
  );
}
