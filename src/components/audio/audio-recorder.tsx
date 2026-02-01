"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Mic, Square, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  maxDuration?: number;
  onRecordingComplete: (audioBlob: Blob, duration: number) => void;
}

export function AudioRecorder({
  maxDuration = 60,
  onRecordingComplete,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const cleanup = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
  }, [audioUrl]);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= maxDuration - 1) {
            stopRecording();
            return prev;
          }
          return prev + 1;
        });
      }, 1000);
    } catch (err) {
      console.error("Failed to start recording:", err);
      setError("Could not access microphone. Please grant permission.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setIsPaused(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
    }
  };

  const resetRecording = () => {
    cleanup();
    setAudioBlob(null);
    setAudioUrl(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setIsPaused(false);
    setIsRecording(false);
  };

  const togglePlayback = () => {
    if (!audioRef.current || !audioUrl) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSubmit = () => {
    if (audioBlob && recordingTime > 0) {
      onRecordingComplete(audioBlob, recordingTime);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col items-center">
      {error && (
        <div className="mb-4 rounded-lg bg-red-900/50 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {!audioBlob ? (
        <>
          <div className="relative mb-6">
            {isRecording && (
              <div className="absolute inset-0 animate-ping rounded-full bg-red-500/30" />
            )}
            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={cn(
                "relative flex h-32 w-32 items-center justify-center rounded-full transition-all",
                isRecording
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-gradient-to-br from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800"
              )}
            >
              {isRecording ? (
                <Square className="h-12 w-12 text-white" />
              ) : (
                <Mic className="h-12 w-12 text-white" />
              )}
            </button>
          </div>

          <div className="mb-4 text-center">
            <div className="text-4xl font-bold text-white">
              {formatTime(recordingTime)}
            </div>
            <div className="mt-1 text-sm text-gray-400">
              {isRecording ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
                  Recording...
                </span>
              ) : (
                `Max ${maxDuration} seconds`
              )}
            </div>
          </div>

          {isRecording && (
            <div className="flex items-center gap-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div
                  key={i}
                  className="w-1 animate-pulse rounded-full bg-purple-500"
                  style={{
                    height: `${10 + Math.random() * 30}px`,
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              ))}
            </div>
          )}
        </>
      ) : (
        <>
          <div className="mb-6 w-full max-w-sm">
            <audio
              ref={audioRef}
              src={audioUrl || undefined}
              onEnded={() => setIsPlaying(false)}
            />

            <div className="mb-4 rounded-xl bg-gray-800 p-4">
              <div className="mb-2 flex items-center justify-around">
                {Array.from({ length: 30 }).map((_, i) => (
                  <div
                    key={i}
                    className="w-1 rounded-full bg-purple-500"
                    style={{
                      height: `${15 + Math.sin(i * 0.4) * 12 + Math.random() * 8}px`,
                    }}
                  />
                ))}
              </div>
              <div className="text-center text-sm text-gray-400">
                {formatTime(recordingTime)}
              </div>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                onClick={togglePlayback}
                className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-lg transition-all hover:scale-105"
              >
                {isPlaying ? (
                  <Pause className="h-6 w-6" />
                ) : (
                  <Play className="ml-1 h-6 w-6" />
                )}
              </button>

              <button
                onClick={resetRecording}
                className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-700 text-gray-300 transition-all hover:bg-gray-600"
              >
                <RotateCcw className="h-5 w-5" />
              </button>
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full max-w-sm bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
            size="lg"
          >
            Submit Voice Confession
          </Button>
        </>
      )}
    </div>
  );
}
