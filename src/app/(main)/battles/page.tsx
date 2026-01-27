import { Suspense } from "react";
import { Swords, Info } from "lucide-react";
import { BattlesList } from "@/components/social/confession-battle";

export default function BattlesPage() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <Swords className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Confession Battles
          </h1>
          <p className="text-gray-500">Vote for your favorite!</p>
        </div>
      </div>

      <div className="mb-6 p-4 rounded-xl bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-800">
        <div className="flex items-start gap-3">
          <Info className="h-5 w-5 text-purple-500 mt-0.5" />
          <div>
            <p className="text-sm text-purple-800 dark:text-purple-200 font-medium">
              How it works
            </p>
            <p className="text-sm text-purple-600 dark:text-purple-300 mt-1">
              Two confessions go head-to-head. Vote for the one you find more relatable, 
              funny, or shocking. Results are revealed when the battle ends!
            </p>
          </div>
        </div>
      </div>

      <Suspense fallback={<div className="animate-pulse h-48 bg-gray-100 dark:bg-gray-800 rounded-2xl" />}>
        <BattlesList />
      </Suspense>
    </div>
  );
}
