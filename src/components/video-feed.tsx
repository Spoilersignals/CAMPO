"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import {
  Heart,
  MessageCircle,
  Share2,
  Download,
  Bookmark,
  Music2,
  Volume2,
  VolumeX,
  Play,
  Plus,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

export interface VideoPostData {
  id: string;
  videoUrl: string;
  thumbnailUrl?: string | null;
  caption?: string | null;
  audioName?: string | null;
  audioArtist?: string | null;
  duration: number;
  user: {
    id: string;
    name: string | null;
    image: string | null;
  };
  likeCount: number;
  commentCount: number;
  isLiked: boolean;
  isSaved: boolean;
  isFollowing: boolean;
}

interface VideoFeedProps {
  videos: VideoPostData[];
  onLike?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onDownload?: (videoId: string) => void;
  onSave?: (videoId: string) => void;
  onFollow?: (userId: string) => void;
  onVideoView?: (videoId: string) => void;
}

interface VideoItemProps {
  video: VideoPostData;
  isActive: boolean;
  isMuted: boolean;
  onMuteToggle: () => void;
  onLike?: (videoId: string) => void;
  onComment?: (videoId: string) => void;
  onShare?: (videoId: string) => void;
  onDownload?: (videoId: string) => void;
  onSave?: (videoId: string) => void;
  onFollow?: (userId: string) => void;
}

function VideoItem({
  video,
  isActive,
  isMuted,
  onMuteToggle,
  onLike,
  onComment,
  onShare,
  onDownload,
  onSave,
  onFollow,
}: VideoItemProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [showHeartAnimation, setShowHeartAnimation] = useState(false);
  const [isLiked, setIsLiked] = useState(video.isLiked);
  const [likeCount, setLikeCount] = useState(video.likeCount);
  const [isSaved, setIsSaved] = useState(video.isSaved);
  const [isFollowing, setIsFollowing] = useState(video.isFollowing);
  const lastTapRef = useRef<number>(0);
  const heartAnimationTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    if (isActive) {
      videoEl.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoEl.pause();
      videoEl.currentTime = 0;
      setIsPlaying(false);
      setProgress(0);
    }
  }, [isActive]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    videoEl.muted = isMuted;
  }, [isMuted]);

  useEffect(() => {
    const videoEl = videoRef.current;
    if (!videoEl) return;

    const handleTimeUpdate = () => {
      const progressPercent = (videoEl.currentTime / videoEl.duration) * 100;
      setProgress(progressPercent);
    };

    videoEl.addEventListener("timeupdate", handleTimeUpdate);
    return () => videoEl.removeEventListener("timeupdate", handleTimeUpdate);
  }, []);

  const handleVideoClick = () => {
    const now = Date.now();
    const timeSinceLastTap = now - lastTapRef.current;
    lastTapRef.current = now;

    if (timeSinceLastTap < 300) {
      handleDoubleTap();
    } else {
      const videoEl = videoRef.current;
      if (!videoEl) return;

      if (videoEl.paused) {
        videoEl.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoEl.pause();
        setIsPlaying(false);
      }
    }
  };

  const handleDoubleTap = () => {
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
      onLike?.(video.id);
    }

    if (heartAnimationTimeoutRef.current) {
      clearTimeout(heartAnimationTimeoutRef.current);
    }
    setShowHeartAnimation(true);
    heartAnimationTimeoutRef.current = setTimeout(() => {
      setShowHeartAnimation(false);
    }, 1000);
  };

  const handleLike = () => {
    if (isLiked) {
      setIsLiked(false);
      setLikeCount((prev) => prev - 1);
    } else {
      setIsLiked(true);
      setLikeCount((prev) => prev + 1);
    }
    onLike?.(video.id);
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    onSave?.(video.id);
  };

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    onFollow?.(video.user.id);
  };

  const formatCount = (count: number): string => {
    if (count >= 1000000) {
      return (count / 1000000).toFixed(1) + "M";
    }
    if (count >= 1000) {
      return (count / 1000).toFixed(1) + "K";
    }
    return count.toString();
  };

  return (
    <div className="relative h-full w-full snap-start snap-always bg-black">
      <video
        ref={videoRef}
        src={video.videoUrl}
        poster={video.thumbnailUrl || undefined}
        loop
        playsInline
        muted={isMuted}
        className="h-full w-full object-cover"
        onClick={handleVideoClick}
      />

      {!isPlaying && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="rounded-full bg-black/30 p-4 backdrop-blur-sm">
            <Play className="h-12 w-12 text-white" fill="white" />
          </div>
        </div>
      )}

      {showHeartAnimation && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <div className="animate-heart-burst">
            <Heart className="h-24 w-24 text-red-500" fill="currentColor" />
          </div>
        </div>
      )}

      <button
        onClick={onMuteToggle}
        className="absolute right-4 top-4 rounded-full bg-black/30 p-2 backdrop-blur-sm transition-colors hover:bg-black/50"
      >
        {isMuted ? (
          <VolumeX className="h-5 w-5 text-white" />
        ) : (
          <Volume2 className="h-5 w-5 text-white" />
        )}
      </button>

      <div className="absolute bottom-20 right-3 flex flex-col items-center gap-5">
        <div className="relative">
          <button onClick={handleFollow} className="relative">
            <Avatar
              src={video.user.image}
              fallback={video.user.name || "U"}
              className="h-12 w-12 border-2 border-white"
            />
            {!isFollowing && (
              <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-red-500 p-0.5">
                <Plus className="h-3 w-3 text-white" />
              </div>
            )}
          </button>
        </div>

        <button
          onClick={handleLike}
          className="flex flex-col items-center gap-1"
        >
          <div
            className={cn(
              "rounded-full p-2 transition-all",
              isLiked ? "animate-like-pop" : ""
            )}
          >
            <Heart
              className={cn(
                "h-7 w-7 transition-colors",
                isLiked ? "text-red-500" : "text-white"
              )}
              fill={isLiked ? "currentColor" : "none"}
            />
          </div>
          <span className="text-xs font-semibold text-white">
            {formatCount(likeCount)}
          </span>
        </button>

        <button
          onClick={() => onComment?.(video.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="rounded-full p-2">
            <MessageCircle className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">
            {formatCount(video.commentCount)}
          </span>
        </button>

        <button
          onClick={() => onShare?.(video.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="rounded-full p-2">
            <Share2 className="h-7 w-7 text-white" />
          </div>
          <span className="text-xs font-semibold text-white">Share</span>
        </button>

        <button
          onClick={() => onDownload?.(video.id)}
          className="flex flex-col items-center gap-1"
        >
          <div className="rounded-full p-2">
            <Download className="h-7 w-7 text-white" />
          </div>
        </button>

        <button onClick={handleSave} className="flex flex-col items-center">
          <div className="rounded-full p-2">
            <Bookmark
              className={cn(
                "h-7 w-7 transition-colors",
                isSaved ? "text-yellow-400" : "text-white"
              )}
              fill={isSaved ? "currentColor" : "none"}
            />
          </div>
        </button>
      </div>

      <div className="absolute bottom-20 left-3 right-20 space-y-3">
        <div className="flex items-center gap-2">
          <span className="text-base font-bold text-white">
            @{video.user.name || "anonymous"}
          </span>
        </div>

        {video.caption && (
          <p className="line-clamp-2 text-sm text-white/90">{video.caption}</p>
        )}

        {(video.audioName || video.audioArtist) && (
          <div className="flex items-center gap-2">
            <div className="animate-spin-slow rounded-full bg-gradient-to-r from-gray-800 to-gray-600 p-2">
              <Music2 className="h-3 w-3 text-white" />
            </div>
            <div className="overflow-hidden">
              <p className="animate-marquee whitespace-nowrap text-sm text-white">
                {video.audioArtist && `${video.audioArtist} - `}
                {video.audioName || "Original Sound"}
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}

export function VideoFeed({
  videos,
  onLike,
  onComment,
  onShare,
  onDownload,
  onSave,
  onFollow,
  onVideoView,
}: VideoFeedProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  const handleIntersection = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const index = Number(entry.target.getAttribute("data-index"));
          if (!isNaN(index)) {
            setActiveIndex(index);
            onVideoView?.(videos[index]?.id);
          }
        }
      });
    },
    [videos, onVideoView]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(handleIntersection, {
      root: container,
      threshold: 0.5,
    });

    const videoItems = container.querySelectorAll("[data-video-item]");
    videoItems.forEach((item) => observer.observe(item));

    return () => observer.disconnect();
  }, [handleIntersection, videos]);

  const handleMuteToggle = () => {
    setIsMuted((prev) => !prev);
  };

  if (videos.length === 0) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <p className="text-white/60">No videos to show</p>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @keyframes heart-burst {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          50% {
            transform: scale(1.2);
            opacity: 1;
          }
          100% {
            transform: scale(1);
            opacity: 0;
          }
        }

        @keyframes like-pop {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.3);
          }
          100% {
            transform: scale(1);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }

        .animate-heart-burst {
          animation: heart-burst 1s ease-out forwards;
        }

        .animate-like-pop {
          animation: like-pop 0.3s ease-out;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-marquee {
          animation: marquee 10s linear infinite;
        }
      `}</style>
      <div
        ref={containerRef}
        className="h-screen w-full snap-y snap-mandatory overflow-y-scroll scroll-smooth bg-black"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {videos.map((video, index) => (
          <div
            key={video.id}
            data-video-item
            data-index={index}
            className="h-screen w-full"
          >
            <VideoItem
              video={video}
              isActive={index === activeIndex}
              isMuted={isMuted}
              onMuteToggle={handleMuteToggle}
              onLike={onLike}
              onComment={onComment}
              onShare={onShare}
              onDownload={onDownload}
              onSave={onSave}
              onFollow={onFollow}
            />
          </div>
        ))}
      </div>
    </>
  );
}
