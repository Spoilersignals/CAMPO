"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AudioRecorder } from "@/components/audio/audio-recorder";
import { createAudioConfession } from "@/actions/audio-confessions";

export default function NewAudioConfessionPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleRecordingComplete(audioBlob: Blob, duration: number) {
    setIsSubmitting(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        
        const result = await createAudioConfession(base64Audio, duration);
        
        if (result.success) {
          setSuccess(true);
          setTimeout(() => {
            router.push("/audio");
          }, 2000);
        } else {
          setError(result.error || "Failed to submit confession");
          setIsSubmitting(false);
        }
      };

      reader.onerror = () => {
        setError("Failed to process audio");
        setIsSubmitting(false);
      };
    } catch (err) {
      setError("Failed to submit confession");
      setIsSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-green-600">
              <Mic className="h-10 w-10 text-white" />
            </div>
          </div>
          <h2 className="mb-2 text-2xl font-bold text-white">Submitted!</h2>
          <p className="text-gray-400">
            Your voice confession is being reviewed...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950">
      <div className="mx-auto max-w-md px-4 py-8">
        <div className="mb-8">
          <Link
            href="/audio"
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to confessions
          </Link>
          
          <div className="mb-2 flex items-center gap-2">
            <Mic className="h-6 w-6 text-purple-400" />
            <h1 className="text-2xl font-bold text-white">Record Your Confession</h1>
          </div>
          <p className="text-gray-400">
            Share your confession anonymously with your voice
          </p>
        </div>

        <div className="rounded-2xl border border-gray-800 bg-gray-900/50 p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-900/50 p-4 text-center text-sm text-red-300">
              {error}
            </div>
          )}

          {isSubmitting ? (
            <div className="py-12 text-center">
              <div className="mb-4 flex justify-center">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
              </div>
              <p className="text-gray-400">Uploading your confession...</p>
            </div>
          ) : (
            <AudioRecorder
              maxDuration={60}
              onRecordingComplete={handleRecordingComplete}
            />
          )}
        </div>

        <div className="mt-6 rounded-xl border border-gray-800 bg-gray-900/30 p-4">
          <h3 className="mb-2 font-medium text-gray-300">Tips for recording:</h3>
          <ul className="space-y-1 text-sm text-gray-500">
            <li>• Find a quiet place for best audio quality</li>
            <li>• Hold your device close but not too close</li>
            <li>• You have up to 60 seconds to speak your truth</li>
            <li>• Your confession will be reviewed before posting</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
