"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Heart, X, Star, ChevronLeft, ChevronRight, MapPin, GraduationCap, Sparkles, MessageCircle, LogIn, Flame, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getDiscoveryProfiles, getMyDatingProfile, swipeProfile, getBrowseProfiles } from "@/actions/dating";

// Floating hearts component
function FloatingHearts() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(15)].map((_, i) => (
        <div
          key={i}
          className="absolute text-pink-500/20"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${Math.random() * 10 + 10}s`,
          }}
        >
          <Heart className="animate-float" fill="currentColor" />
        </div>
      ))}
    </div>
  );
}

// Confetti component for matches
function Confetti() {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(50)].map((_, i) => (
        <div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `-10px`,
            backgroundColor: ['#f472b6', '#a78bfa', '#60a5fa', '#fbbf24', '#34d399'][Math.floor(Math.random() * 5)],
            animation: `confetti-fall ${2 + Math.random() * 3}s linear ${Math.random() * 2}s forwards`,
          }}
        />
      ))}
      <style jsx>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
}

type DatingProfile = {
  id: string;
  displayName: string;
  bio: string | null;
  age: number;
  gender: string;
  course: string | null;
  yearOfStudy: number | null;
  faculty: string | null;
  interests: string[];
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

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseProfile(raw: any): DatingProfile {
  const interests = raw.interests;
  return {
    ...raw,
    interests: Array.isArray(interests) 
      ? interests 
      : typeof interests === 'string' 
        ? JSON.parse(interests || '[]') 
        : [],
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
        setProfiles(browseResult.data.map(parseProfile));
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
      setProfiles(result.data.map(parseProfile));
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
          setProfiles(prev => [...prev, ...moreProfiles.data.map(parseProfile)]);
        }
      }
    }, 300);
  }

  const currentProfile = profiles[currentIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center">
        <FloatingHearts />
        <div className="text-center relative z-10">
          <div className="relative">
            <div className="mx-auto h-16 w-16 animate-spin rounded-full border-4 border-pink-300/30 border-t-pink-500" />
            <Heart className="absolute inset-0 m-auto h-8 w-8 text-pink-500 animate-pulse" fill="currentColor" />
          </div>
          <p className="mt-6 text-white/70 text-lg">Finding your matches...</p>
          <div className="mt-2 flex justify-center gap-1">
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0s' }} />
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.1s' }} />
            <span className="h-2 w-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '0.2s' }} />
          </div>
        </div>
      </div>
    );
  }

  if (!hasProfile && !isGuest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900 flex items-center justify-center px-4">
        <FloatingHearts />
        <div className="relative z-10 max-w-md w-full">
          <div className="backdrop-blur-xl bg-white/10 rounded-3xl p-8 text-center border border-white/20 shadow-2xl">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30 animate-pulse-glow">
              <Heart className="h-12 w-12 text-white" fill="currentColor" />
            </div>
            <h1 className="mb-3 text-3xl font-bold text-white">Find Your Match</h1>
            <p className="mb-8 text-white/70">
              Create your dating profile to start matching with other students on campus!
            </p>
            <Button
              onClick={() => router.push("/dating/profile/setup")}
              className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 h-12 text-lg font-semibold shadow-lg shadow-pink-500/30 transition-all hover:shadow-xl hover:shadow-pink-500/40 hover:-translate-y-0.5"
            >
              <Sparkles className="mr-2 h-5 w-5" />
              Create Profile
            </Button>
            <p className="mt-6 text-sm text-white/50">
              Join {profiles.length > 0 ? `${profiles.length}+ students` : 'students'} already finding love
            </p>
          </div>
        </div>
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
    <div className="min-h-screen bg-gradient-to-br from-pink-900 via-purple-900 to-indigo-900">
      <FloatingHearts />
      
      <div className="relative z-10 mx-auto max-w-lg px-4 py-6">
        {/* Guest Banner */}
        {isGuest && (
          <div className="mb-4 rounded-2xl bg-gradient-to-r from-pink-500/80 to-rose-500/80 backdrop-blur-md p-4 text-white border border-white/20 animate-slide-up">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold flex items-center gap-2">
                  <Flame className="h-4 w-4" />
                  Create an account to match!
                </p>
                <p className="text-sm text-white/80">Like, match, and chat with people on campus</p>
              </div>
              <Link href="/register">
                <Button size="sm" className="bg-white text-pink-600 hover:bg-white/90 shadow-lg">
                  Sign Up
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center gap-2">
              <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">
                Campus Match
              </span>
              <Sparkles className="h-6 w-6 text-pink-400 animate-pulse" />
            </h1>
            <p className="text-white/50 text-sm mt-1">Swipe right to find love ❤️</p>
          </div>
          {!isGuest && (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dating/likes")}
                className="text-pink-300 hover:text-pink-200 hover:bg-pink-500/20"
              >
                <Heart className="mr-1 h-4 w-4" fill="currentColor" />
                Likes
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/dating/matches")}
                className="text-white/70 hover:text-white hover:bg-white/10"
              >
                <MessageCircle className="mr-1 h-4 w-4" />
                Matches
              </Button>
            </div>
          )}
        </div>

        {/* Profile Card */}
        <div 
          className={`relative overflow-hidden rounded-3xl bg-gradient-to-b from-white/10 to-white/5 backdrop-blur-xl shadow-2xl transition-all duration-500 border border-white/20 ${
            swipeAnimation === "left" ? "animate-swipe-left" :
            swipeAnimation === "right" ? "animate-swipe-right" :
            swipeAnimation === "super" ? "animate-swipe-up" : ""
          }`}
          style={{ 
            transform: swipeAnimation ? undefined : 'perspective(1000px) rotateY(0deg)',
            transformStyle: 'preserve-3d',
          }}
        >
          {/* Photo */}
          <div className="relative aspect-[3/4] w-full bg-gradient-to-br from-gray-800 to-gray-900">
            {currentPhoto ? (
              <Image
                src={currentPhoto.url}
                alt={currentProfile.displayName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center bg-gradient-to-br from-pink-500/20 to-purple-500/20">
                <Heart className="h-24 w-24 text-pink-500/50 animate-pulse" fill="currentColor" />
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
          <div className="p-5 space-y-4 bg-gradient-to-b from-transparent to-black/30">
            {currentProfile.bio && (
              <p className="text-white/90">{currentProfile.bio}</p>
            )}
            
            {currentProfile.interests.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {currentProfile.interests.map((interest, idx) => (
                  <Badge key={idx} className="bg-pink-500/20 text-pink-300 border border-pink-500/30 backdrop-blur-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            )}
            
            {currentProfile.relationshipGoal && (
              <p className="text-sm text-white/60">
                Looking for: <span className="font-medium text-white/90">{currentProfile.relationshipGoal}</span>
              </p>
            )}
            
            {/* Prompts */}
            {currentProfile.prompt1Question && currentProfile.prompt1Answer && (
              <div className="rounded-xl bg-white/10 backdrop-blur-sm p-4 border border-white/10">
                <p className="text-xs font-medium text-pink-300">{currentProfile.prompt1Question}</p>
                <p className="mt-2 text-white">{currentProfile.prompt1Answer}</p>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-center gap-5">
          {/* Nope Button */}
          <button
            onClick={() => handleSwipe("PASS")}
            className="group relative h-16 w-16 rounded-full bg-white/10 backdrop-blur-md border-2 border-red-500/50 transition-all hover:scale-110 hover:border-red-500 hover:bg-red-500/20 hover:shadow-lg hover:shadow-red-500/30"
          >
            <X className="absolute inset-0 m-auto h-8 w-8 text-red-400 group-hover:text-red-500 transition-colors" />
          </button>
          
          {/* Super Like Button */}
          <button
            onClick={() => handleSwipe("SUPER_LIKE")}
            disabled={!isGuest && superLikesRemaining <= 0}
            className="group relative h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 transition-all hover:scale-110 hover:shadow-lg hover:shadow-blue-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Star className="absolute inset-0 m-auto h-6 w-6 text-white" fill="currentColor" />
            {!isGuest && superLikesRemaining > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-yellow-400 text-[10px] font-bold text-black">
                {superLikesRemaining}
              </span>
            )}
          </button>
          
          {/* Like Button */}
          <button
            onClick={() => handleSwipe("LIKE")}
            className="group relative h-16 w-16 rounded-full bg-gradient-to-br from-pink-500 to-rose-500 transition-all hover:scale-110 hover:shadow-lg hover:shadow-pink-500/40 animate-pulse-glow"
          >
            <Heart className="absolute inset-0 m-auto h-8 w-8 text-white" fill="currentColor" />
          </button>
        </div>
        
        {!isGuest && (
          <p className="mt-4 text-center text-xs text-white/40">
            <Zap className="inline h-3 w-3 mr-1" />
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
            <Confetti />
            <div className="relative w-full max-w-sm animate-zoom-bounce">
              {/* Glow effect */}
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 animate-pulse" />
              
              <div className="relative backdrop-blur-xl bg-gradient-to-b from-white/20 to-white/10 rounded-3xl p-8 text-center border border-white/30 shadow-2xl">
                {/* Animated hearts */}
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="relative">
                    <Heart className="h-12 w-12 text-pink-500 animate-bounce" fill="currentColor" />
                    <Heart className="absolute -left-8 top-4 h-8 w-8 text-pink-400 animate-float" fill="currentColor" />
                    <Heart className="absolute -right-8 top-4 h-8 w-8 text-pink-400 animate-float-delayed" fill="currentColor" />
                  </div>
                </div>
                
                <div className="mt-8 mb-4">
                  <Sparkles className="mx-auto h-16 w-16 text-yellow-400 animate-pulse" />
                </div>
                
                <h2 className="mb-3 text-4xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-text-shimmer">
                  It&apos;s a Match!
                </h2>
                
                <p className="mb-8 text-white/80 text-lg">
                  You and <span className="font-semibold text-white">{matchedProfile.displayName}</span> liked each other! 💕
                </p>
                
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setShowMatch(false)}
                    className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20 hover:text-white"
                  >
                    Keep Swiping
                  </Button>
                  <Button
                    onClick={() => router.push("/dating/matches")}
                    className="flex-1 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-lg shadow-pink-500/30"
                  >
                    <MessageCircle className="mr-2 h-4 w-4" />
                    Send Message
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
