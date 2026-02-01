"use client";

import Link from "next/link";
import { Gamepad2, HelpCircle, Trophy, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const games = [
  {
    id: "two-truths",
    title: "Two Truths, One Lie",
    description: "Can you spot the lie? Create your own or guess others!",
    icon: HelpCircle,
    href: "/games/two-truths",
    gradient: "from-purple-500 to-pink-500",
    bgGradient: "from-purple-50 to-pink-50",
  },
];

export default function GamesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-3">
        <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3">
          <Gamepad2 className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Games</h1>
          <p className="text-gray-500">Fun games to play with your campus community</p>
        </div>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-100 p-4">
        <Sparkles className="h-5 w-5 text-yellow-500" />
        <p className="text-sm text-yellow-800">
          More games coming soon! Check back for new ways to have fun.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        {games.map((game) => {
          const Icon = game.icon;
          return (
            <Link key={game.id} href={game.href}>
              <Card className="group cursor-pointer overflow-hidden transition-all hover:shadow-lg hover:-translate-y-1">
                <div className={`bg-gradient-to-br ${game.bgGradient} p-6`}>
                  <div className={`inline-flex rounded-xl bg-gradient-to-br ${game.gradient} p-3`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-gray-900 group-hover:text-purple-600 transition-colors">
                      {game.title}
                    </h2>
                    <Trophy className="h-5 w-5 text-gray-400 group-hover:text-yellow-500 transition-colors" />
                  </div>
                  <p className="mt-2 text-gray-600">{game.description}</p>
                  <div className="mt-4 inline-flex items-center text-sm font-medium text-purple-600 group-hover:text-purple-700">
                    Play now
                    <svg
                      className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
