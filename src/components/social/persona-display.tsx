"use client";

import { useState, useEffect } from "react";
import { getOrCreatePersona, regeneratePersona, updatePersona, AVATARS, COLORS } from "@/actions/personas";
import { RefreshCw, Check } from "lucide-react";

type Persona = {
  id: string;
  avatar: string;
  alias: string;
  color: string;
};

interface PersonaDisplayProps {
  size?: "sm" | "md" | "lg";
  showEdit?: boolean;
}

export function PersonaDisplay({ size = "md", showEdit = false }: PersonaDisplayProps) {
  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    getOrCreatePersona().then((p) => {
      setPersona(p);
      setLoading(false);
    });
  }, []);

  async function handleRegenerate() {
    setLoading(true);
    const p = await regeneratePersona();
    setPersona(p);
    setLoading(false);
  }

  async function handleColorChange(color: string) {
    if (!persona) return;
    const updated = await updatePersona({ color });
    setPersona(updated);
  }

  async function handleAvatarChange(avatar: string) {
    if (!persona) return;
    const updated = await updatePersona({ avatar });
    setPersona(updated);
  }

  const sizeClasses = {
    sm: "h-8 w-8 text-lg",
    md: "h-10 w-10 text-xl",
    lg: "h-14 w-14 text-3xl",
  };

  const textClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  if (loading || !persona) {
    return (
      <div className="flex items-center gap-2 animate-pulse">
        <div className={`${sizeClasses[size]} rounded-full bg-gray-200 dark:bg-gray-700`} />
        <div className="h-4 w-20 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="flex items-center gap-2">
        <div
          className={`${sizeClasses[size]} rounded-full flex items-center justify-center`}
          style={{ backgroundColor: persona.color + "30", borderColor: persona.color }}
        >
          {persona.avatar}
        </div>
        <span 
          className={`font-semibold ${textClasses[size]}`}
          style={{ color: persona.color }}
        >
          {persona.alias}
        </span>
        
        {showEdit && (
          <button
            onClick={() => setEditing(!editing)}
            className="ml-2 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <RefreshCw className="h-4 w-4 text-gray-400" />
          </button>
        )}
      </div>

      {editing && (
        <div className="absolute top-full left-0 mt-2 p-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 z-20 w-64">
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Choose Avatar</p>
            <div className="flex flex-wrap gap-1">
              {AVATARS.map((a) => (
                <button
                  key={a}
                  onClick={() => handleAvatarChange(a)}
                  className={`p-1.5 text-xl rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 ${
                    persona.avatar === a ? "ring-2 ring-rose-500" : ""
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div className="mb-4">
            <p className="text-xs font-medium text-gray-500 mb-2">Choose Color</p>
            <div className="flex flex-wrap gap-1">
              {COLORS.map((c) => (
                <button
                  key={c}
                  onClick={() => handleColorChange(c)}
                  className={`h-6 w-6 rounded-full ${
                    persona.color === c ? "ring-2 ring-offset-2 ring-gray-400" : ""
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          <button
            onClick={handleRegenerate}
            className="w-full flex items-center justify-center gap-2 py-2 bg-gray-100 dark:bg-gray-700 rounded-xl text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            <RefreshCw className="h-4 w-4" />
            Randomize All
          </button>

          <button
            onClick={() => setEditing(false)}
            className="w-full mt-2 flex items-center justify-center gap-2 py-2 bg-rose-500 text-white rounded-xl text-sm font-medium hover:bg-rose-600 transition-colors"
          >
            <Check className="h-4 w-4" />
            Done
          </button>
        </div>
      )}
    </div>
  );
}

export function PersonaBadge({ avatar, alias, color }: { avatar: string; alias: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span 
        className="h-6 w-6 rounded-full flex items-center justify-center text-sm"
        style={{ backgroundColor: color + "30" }}
      >
        {avatar}
      </span>
      <span className="text-sm font-medium" style={{ color }}>
        {alias}
      </span>
    </div>
  );
}
