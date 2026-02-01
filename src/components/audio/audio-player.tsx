"use client";

import { useState, useRef, useEffect } from "react";
import { Play, Pause } from "lucide-react";
import { cn } from "@/lib/utils";

interface AudioPlayerProps {
  src: string;
  duration: number;
  onPlay?: () => void;
  size?: "sm" | "md" | "lg";
  showWaveform?: boolean;
}

export function AudioPlayer({
  src,
  duration,
  onPlay,
  size = "md",
  showWaveform = true,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [hasPlayed, setHasPlayed] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("ended", handleEnded);
    };
  }, []);

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      await audio.play();
      setIsPlaying(true);
      if (!hasPlayed) {
        setHasPlayed(true);
        onPlay?.();
      }
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    audio.currentTime = percentage * duration;
    setCurrentTime(audio.currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = (currentTime / duration) * 100;

  const buttonSizes = {
    sm: "h-10 w-10",
    md: "h-14 w-14",
    lg: "h-20 w-20",
  };

  const iconSizes = {
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
  };

  return (
    <div className="flex items-center gap-4">
      <audio ref={audioRef} src={src} preload="metadata" />

      <button
        onClick={togglePlay}
        className={cn(
          "flex items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl active:scale-95",
          buttonSizes[size]
        )}
      >
        {isPlaying ? (
          <Pause className={iconSizes[size]} />
        ) : (
          <Play className={cn(iconSizes[size], "ml-1")} />
        )}
      </button>

      <div className="flex-1">
        {showWaveform && (
          <div
            className="relative mb-2 h-8 cursor-pointer overflow-hidden rounded-lg bg-gray-800"
            onClick={handleSeek}
          >
            <div className="absolute inset-0 flex items-center justify-around px-1">
              {Array.from({ length: 40 }).map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1 rounded-full transition-all",
                    i / 40 * 100 <= progress
                      ? "bg-purple-400"
                      : "bg-gray-600"
                  )}
                  style={{
                    height: `${20 + Math.sin(i * 0.5) * 15 + Math.random() * 10}px`,
                  }}
                />
              ))}
            </div>
            <div
              className="absolute bottom-0 left-0 top-0 bg-purple-500/20"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        {!showWaveform && (
          <div
            className="relative mb-2 h-2 cursor-pointer overflow-hidden rounded-full bg-gray-700"
            onClick={handleSeek}
          >
            <div
              className="absolute bottom-0 left-0 top-0 rounded-full bg-gradient-to-r from-purple-500 to-indigo-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
}
