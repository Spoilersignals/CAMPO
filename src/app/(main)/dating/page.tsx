"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, X, Star, ChevronLeft, ChevronRight, MapPin, GraduationCap, Sparkles, MessageCircle, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDiscoveryProfiles, getMyDatingProfile, swipeProfile, getBrowseProfiles } from "@/actions/dating";

type DatingProfileRaw = {
  id: string;
  displayName: string;
  bio: string | null;
  age: number;
  gender: string;
  course: string | null;
  yearOfStudy: number | null;
  faculty: string | null;
  interests: string; // JSON string from DB
  height: string | null;
  relationshipGoal: string | null;
  instagramHandle: string | null;
  prompt1Question: string | null;
  prompt1Answer: string | null;
  prompt2Question: string | null;
  prompt2Answer: string | null;
  prompt3Question: string | null;
  prompt3Answer: string | null;
  photos: { id: string; url: string; isMain: boolean }[];
};

type DatingProfile = Omit<DatingProfileRaw, 'interests'> & {
  interests: string[];
};

function parseProfile(raw: DatingProfileRaw): DatingProfile {
  return {
    ...raw,
    interests: typeof raw.interests === 'string' ? JSON.parse(raw.interests || '[]') : raw.interests,
  };
}

export default function DatingPage() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<DatingProfile[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [showMatch, setShowMatch] = useState(false);
  const [matchedProfile, setMatchedProfile] = useState<DatingProfile | null>(null);
  const [swipeAnimation, setSwipeAnimation] = useState<"left" | "right" | "super" | null>(null);
  const [superLikesRemaining, setSuperLikesRemaining] = useState(3);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    
    // Check if user has a dating profile
    const profileResult = await getMyDatingProfile();
    
    if (!profileResult.success && profileResult.error === "Not authenticated") {
      // User is a guest - show browse mode
      setIsGuest(true);
      const browseResult = await getBrowseProfiles(20);
      if (browseResult.success && browseResult.data) {
        setProfiles((browseResult.data as DatingProfileRaw[]).map(parseProfile));
      }
      setIsLoading(false);
      return;
    }
    
    if (!profileResult.data) {
      setHasProfile(false);
      setIsLoading(false);
      return;
    }
    
    setSuperLikesRemaining(profileResult.data.superLikesRemaining);
    
    // Load discovery profiles
    const result = await getDiscoveryProfiles(20);
    if (result.success && result.data) {
      setProfiles((result.data as DatingProfileRaw[]).map(parseProfile));
    } else if (result.needsProfile) {
      setHasProfile(false);
    }
    setIsLoading(false);
  }

  async function handleSwipe(type: "LIKE" | "PASS" | "SUPER_LIKE") {
    if (isGuest) {
      setShowAuthPrompt(true);
      return;
    }

    const currentProfile = profiles[currentIndex];
    if (!currentProfile) return;

    // Animate
    setSwipeAnimation(type === "PASS" ? "left" : type === "SUPER_LIKE" ? "super" : "right");
    
    setTimeout(async () => {
      const result = await swipeProfile(currentProfile.id, type);
      
      if (result.success) {
        if (type === "SUPER_LIKE") {
          setSuperLikesRemaining(prev => Math.max(0, prev - 1));
        }
        
        if (result.isMatch) {
          setMatchedProfile(currentProfile);
          setShowMatch(true);
        }
      }
      
      setSwipeAnimation(null);
      setCurrentPhotoIndex(0);
      setCurrentIndex(prev => prev + 1);
      
      // Load more profiles if running low
      if (currentIndex >= profiles.length - 3) {
        const moreProfiles = await getDiscoveryProfiles(10);
        if (moreProfiles.success && moreProfiles.data) {
          setProfiles(prev => [...prev, ...(moreProfiles.data as DatingProfileRaw[]).map(parseProfile)]);
        }
      }
    }, 300);
  }

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-pink-200 border-t-pink-600" />
          <p className="mt-4 text-gray-500">Finding your matches...</p>
        </div>
      </div>
    );
  }

  if (!hasProfile && !isGuest) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
            <Heart className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-2 text-2xl font-bold text-gray-900">Find Your Match</h1>
          <p className="mb-6 text-gray-600">
            Create your dating profile to start matching with other students on campus!
          </p>
          <Button
            onClick={() => router.push("/dating/profile/setup")}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600"
          >
            Create Profile
          </Button>
        </Card>
      </div>
    );
  }

  if (!currentProfile) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4">
        <Card className="max-w-md p-8 text-center">
          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Heart className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="mb-2 text-xl font-bold text-gray-900">No More Profiles</h2>
          <p className="mb-6 text-gray-600">
            {isGuest 
              ? "Create an account to start matching with people on campus!"
              : "You've seen everyone for now! Check back later for new matches."}
          </p>
          <div className="flex gap-3">
            {isGuest ? (
              <>
                <Link href="/register" className="flex-1">
                  <Button className="w-full bg-pink-600 hover:bg-pink-700">
                    Create Account
                  </Button>
                </Link>
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">
                    Log In
                  </Button>
                </Link>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={() => router.push("/dating/matches")} className="flex-1">
                  View Matches
                </Button>
                <Button onClick={loadData} className="flex-1 bg-pink-600 hover:bg-pink-700">
                  Refresh
                </Button>
              </>
            )}
          </div>
        </Card>
      </div>
    );
  }

  const photos = currentProfile.photos;
  const currentPhoto = photos[currentPhotoIndex] || photos[0];

  return (
    <div className="mx-auto max-w-lg px-4 py-6">
      {/* Guest Banner */}
      {isGuest && (
        <div className="mb-4 rounded-lg bg-gradient-to-r from-pink-500 to-rose-500 p-4 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Create an account to match!</p>
              <p className="text-sm text-white/80">Like, match, and chat with people on campus</p>
            </div>
            <Link href="/register">
              <Button size="sm" className="bg-white text-pink-600 hover:bg-white/90">
                Sign Up
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
          Campus Match
        </h1>
        {!isGuest && (
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dating/likes")}
              className="text-pink-600"
            >
              <Heart className="mr-1 h-4 w-4" />
              Likes
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push("/dating/matches")}
            >
              <MessageCircle className="mr-1 h-4 w-4" />
              Matches
            </Button>
          </div>
        )}
      </div>

      {/* Profile Card */}
      <div 
        className={`relative overflow-hidden rounded-2xl bg-white shadow-xl transition-transform duration-300 ${
          swipeAnimation === "left" ? "-translate-x-full rotate-[-20deg] opacity-0" :
          swipeAnimation === "right" ? "translate-x-full rotate-[20deg] opacity-0" :
          swipeAnimation === "super" ? "-translate-y-full opacity-0" : ""
        }`}
      >
        {/* Photo */}
        <div className="relative aspect-[3/4] w-full bg-gray-100">
          {currentPhoto ? (
            <Image
              src={currentPhoto.url}
              alt={currentProfile.displayName}
              fill
              className="object-cover"
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <Heart className="h-20 w-20 text-gray-300" />
            </div>
          )}
          
          {/* Photo indicators */}
          {photos.length > 1 && (
            <div className="absolute left-0 right-0 top-2 flex justify-center gap-1 px-2">
              {photos.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    idx === currentPhotoIndex ? "bg-white" : "bg-white/40"
                  }`}
                />
              ))}
            </div>
          )}
          
          {/* Photo navigation */}
          {photos.length > 1 && (
            <>
              <button
                onClick={() => setCurrentPhotoIndex(prev => Math.max(0, prev - 1))}
                className="absolute left-0 top-0 h-full w-1/3"
              />
              <button
                onClick={() => setCurrentPhotoIndex(prev => Math.min(photos.length - 1, prev + 1))}
                className="absolute right-0 top-0 h-full w-1/3"
              />
            </>
          )}
          
          {/* Gradient overlay */}
          <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          
          {/* Profile info overlay */}
          <div className="absolute inset-x-0 bottom-0 p-4 text-white">
            <h2 className="text-2xl font-bold">
              {currentProfile.displayName}, {currentProfile.age}
            </h2>
            {currentProfile.course && (
              <p className="flex items-center gap-1 text-sm text-white/80">
                <GraduationCap className="h-4 w-4" />
                {currentProfile.course}
                {currentProfile.yearOfStudy && ` • Year ${currentProfile.yearOfStudy}`}
              </p>
            )}
          </div>
        </div>
        
        {/* Profile details */}
        <div className="p-4 space-y-4">
          {currentProfile.bio && (
            <p className="text-gray-700">{currentProfile.bio}</p>
          )}
          
          {currentProfile.interests.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {currentProfile.interests.map((interest, idx) => (
                <Badge key={idx} className="bg-pink-50 text-pink-700">
                  {interest}
                </Badge>
              ))}
            </div>
          )}
          
          {currentProfile.relationshipGoal && (
            <p className="text-sm text-gray-500">
              Looking for: <span className="font-medium text-gray-700">{currentProfile.relationshipGoal}</span>
            </p>
          )}
          
          {/* Prompts */}
          {currentProfile.prompt1Question && currentProfile.prompt1Answer && (
            <div className="rounded-lg bg-gray-50 p-3">
              <p className="text-xs font-medium text-gray-500">{currentProfile.prompt1Question}</p>
              <p className="mt-1 text-gray-800">{currentProfile.prompt1Answer}</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex items-center justify-center gap-4">
        <Button
          onClick={() => handleSwipe("PASS")}
          size="lg"
          variant="outline"
          className="h-16 w-16 rounded-full border-2 border-gray-300 p-0 hover:border-red-500 hover:bg-red-50"
        >
          <X className="h-8 w-8 text-gray-400 hover:text-red-500" />
        </Button>
        
        <Button
          onClick={() => handleSwipe("SUPER_LIKE")}
          size="lg"
          disabled={!isGuest && superLikesRemaining <= 0}
          className="h-14 w-14 rounded-full bg-blue-500 p-0 hover:bg-blue-600 disabled:opacity-50"
        >
          <Star className="h-6 w-6 text-white" />
        </Button>
        
        <Button
          onClick={() => handleSwipe("LIKE")}
          size="lg"
          className="h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 p-0 hover:from-pink-600 hover:to-rose-600"
        >
          <Heart className="h-8 w-8 text-white" />
        </Button>
      </div>
      
      {!isGuest && (
        <p className="mt-2 text-center text-xs text-gray-400">
          {superLikesRemaining} Super Likes remaining today
        </p>
      )}

      {/* Auth Prompt Modal */}
      {showAuthPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm animate-in zoom-in-95 rounded-2xl bg-white p-6 text-center">
            <div className="mb-4">
              <LogIn className="mx-auto h-16 w-16 text-pink-500" />
            </div>
            <h2 className="mb-2 text-2xl font-bold text-gray-900">
              Create an Account
            </h2>
            <p className="mb-6 text-gray-600">
              Sign up with ComradeZone to like, match, and chat with people on campus!
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowAuthPrompt(false)}
                className="flex-1"
              >
                Maybe Later
              </Button>
              <Link href="/register" className="flex-1">
                <Button className="w-full bg-gradient-to-r from-pink-500 to-rose-500">
                  Sign Up
                </Button>
              </Link>
            </div>
            <p className="mt-4 text-sm text-gray-500">
              Already have an account?{" "}
              <Link href="/login" className="text-pink-600 hover:underline">
                Log in
              </Link>
            </p>
          </div>
        </div>
      )}

      {/* Match Modal */}
      {showMatch && matchedProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4">
          <div className="w-full max-w-sm animate-in zoom-in-95 rounded-2xl bg-white p-6 text-center">
            <div className="mb-4">
              <Sparkles className="mx-auto h-16 w-16 text-pink-500" />
            </div>
            <h2 className="mb-2 text-3xl font-bold bg-gradient-to-r from-pink-600 to-rose-600 bg-clip-text text-transparent">
              It&apos;s a Match!
            </h2>
            <p className="mb-6 text-gray-600">
              You and {matchedProfile.displayName} liked each other!
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowMatch(false)}
                className="flex-1"
              >
                Keep Swiping
              </Button>
              <Button
                onClick={() => router.push("/dating/matches")}
                className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500"
              >
                Send Message
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
