"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { ArrowLeft, Heart, Star, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getWhoLikedMe } from "@/actions/dating";

type LikeProfile = {
  id: string;
  displayName: string;
  age: number;
  course: string | null;
  photos: { url: string }[];
  isSuperLike: boolean;
};

export default function LikesPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<LikeProfile[]>([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isBlurred, setIsBlurred] = useState(true); // Premium feature simulation

  useEffect(() => {
    loadLikes();
  }, []);

  async function loadLikes() {
    setIsLoading(true);
    const result = await getWhoLikedMe();
    if (result.success && result.data) {
      setProfiles(result.data);
      setCount(result.count || 0);
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Header */}
      <div className="mb-6 flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => router.push("/dating")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Who Likes You</h1>
          <p className="text-sm text-gray-500">{count} people like you</p>
        </div>
      </div>

      {profiles.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-100">
            <Heart className="h-8 w-8 text-pink-500" />
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">No likes yet</h2>
          <p className="mb-6 text-gray-500">
            Keep your profile active and complete to attract more likes!
          </p>
          <Button
            onClick={() => router.push("/dating")}
            className="bg-gradient-to-r from-pink-500 to-rose-500"
          >
            Keep Swiping
          </Button>
        </Card>
      ) : (
        <>
          {/* Premium Banner */}
          {isBlurred && (
            <Card className="mb-6 bg-gradient-to-r from-amber-100 to-yellow-100 p-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-amber-500 p-2">
                  <Lock className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-amber-900">See who likes you</p>
                  <p className="text-sm text-amber-700">Upgrade to see clearly and match instantly</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => setIsBlurred(false)}
                  className="bg-amber-500 hover:bg-amber-600"
                >
                  Reveal
                </Button>
              </div>
            </Card>
          )}

          {/* Likes Grid */}
          <div className="grid grid-cols-2 gap-3">
            {profiles.map((profile) => (
              <Card
                key={profile.id}
                className="group relative cursor-pointer overflow-hidden"
                onClick={() => !isBlurred && router.push("/dating")}
              >
                <div className="relative aspect-[3/4] bg-gray-100">
                  {profile.photos[0] ? (
                    <Image
                      src={profile.photos[0].url}
                      alt={profile.displayName}
                      fill
                      className={`object-cover transition-all ${isBlurred ? "blur-lg scale-110" : ""}`}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <Heart className="h-12 w-12 text-gray-300" />
                    </div>
                  )}
                  
                  {/* Super Like badge */}
                  {profile.isSuperLike && (
                    <div className="absolute left-2 top-2">
                      <Badge className="bg-blue-500 text-white">
                        <Star className="mr-1 h-3 w-3" />
                        Super Like
                      </Badge>
                    </div>
                  )}
                  
                  {/* Gradient overlay */}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/70 to-transparent" />
                  
                  {/* Profile info */}
                  <div className={`absolute inset-x-0 bottom-0 p-3 text-white ${isBlurred ? "blur-sm" : ""}`}>
                    <p className="font-semibold">{profile.displayName}, {profile.age}</p>
                    {profile.course && (
                      <p className="text-xs text-white/80">{profile.course}</p>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
