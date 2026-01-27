"use client";

import { useState } from "react";

const MOODS = [
  { emoji: "😂", label: "Funny", color: "from-yellow-400 to-orange-400" },
  { emoji: "😭", label: "Sad", color: "from-blue-400 to-indigo-400" },
  { emoji: "🔥", label: "Spicy", color: "from-red-500 to-orange-500" },
  { emoji: "💀", label: "Dead", color: "from-gray-600 to-gray-800" },
  { emoji: "😳", label: "Awkward", color: "from-pink-400 to-rose-400" },
  { emoji: "🥺", label: "Wholesome", color: "from-pink-300 to-purple-300" },
  { emoji: "😤", label: "Angry", color: "from-red-600 to-red-800" },
  { emoji: "🤔", label: "Confused", color: "from-purple-400 to-indigo-400" },
  { emoji: "💕", label: "Romantic", color: "from-pink-400 to-red-400" },
  { emoji: "🎉", label: "Excited", color: "from-yellow-400 to-pink-400" },
];

interface MoodSelectorProps {
  value?: string;
  onChange: (mood: string | undefined) => void;
}

export function MoodSelector({ value, onChange }: MoodSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);

  const selectedMood = MOODS.find((m) => m.emoji === value);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
          selectedMood
            ? `bg-gradient-to-r ${selectedMood.color} text-white`
            : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200"
        }`}
      >
        {selectedMood ? (
          <>
            <span className="text-lg">{selectedMood.emoji}</span>
            <span>{selectedMood.label}</span>
          </>
        ) : (
          <>
            <span className="text-lg">😶</span>
            <span>Add mood</span>
          </>
        )}
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute bottom-full left-0 mb-2 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 min-w-[200px]">
            <div className="grid grid-cols-5 gap-1">
              {MOODS.map((mood) => (
                <button
                  key={mood.emoji}
                  type="button"
                  onClick={() => {
                    onChange(value === mood.emoji ? undefined : mood.emoji);
                    setIsOpen(false);
                  }}
                  className={`p-2 text-2xl rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all hover:scale-110 ${
                    value === mood.emoji ? "bg-gray-100 dark:bg-gray-700 ring-2 ring-rose-500" : ""
                  }`}
                  title={mood.label}
                >
                  {mood.emoji}
                </button>
              ))}
            </div>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange(undefined);
                  setIsOpen(false);
                }}
                className="w-full mt-2 py-1.5 text-xs text-gray-500 hover:text-red-500 transition-colors"
              >
                Clear mood
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export function MoodBadge({ mood }: { mood: string }) {
  const moodData = MOODS.find((m) => m.emoji === mood);
  if (!moodData) return null;

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r ${moodData.color} text-white`}
    >
      <span>{moodData.emoji}</span>
      <span>{moodData.label}</span>
    </span>
  );
}

export { MOODS };
