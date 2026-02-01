"use client";

import { useState, useEffect, useCallback } from "react";
import { VideoFeed, VideoPostData } from "@/components/video-feed";
import { Spinner } from "@/components/ui/spinner";
import {
  getVideoPosts,
  likeVideo,
  saveVideo,
  followUser,
  incrementVideoView,
} from "@/actions/videos";

export default function VideosPage() {
  const [videos, setVideos] = useState<VideoPostData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadVideos();
  }, []);

  async function loadVideos() {
    setLoading(true);
    const result = await getVideoPosts(50);
    if (result.success && result.data) {
      setVideos(result.data);
    }
    setLoading(false);
  }

  const handleLike = useCallback(async (videoId: string) => {
    const result = await likeVideo(videoId);
    if (!result.success) {
      console.error(result.error);
    }
  }, []);

  const handleSave = useCallback(async (videoId: string) => {
    const result = await saveVideo(videoId);
    if (!result.success) {
      console.error(result.error);
    }
  }, []);

  const handleFollow = useCallback(async (userId: string) => {
    const result = await followUser(userId);
    if (!result.success) {
      console.error(result.error);
    }
  }, []);

  const handleVideoView = useCallback(async (videoId: string) => {
    await incrementVideoView(videoId);
  }, []);

  const handleComment = useCallback((videoId: string) => {
    console.log("Open comments for:", videoId);
  }, []);

  const handleShare = useCallback(async (videoId: string) => {
    const url = `${window.location.origin}/videos/${videoId}`;
    if (navigator.share) {
      try {
        await navigator.share({ url });
      } catch {
        await navigator.clipboard.writeText(url);
      }
    } else {
      await navigator.clipboard.writeText(url);
    }
  }, []);

  const handleDownload = useCallback(
    async (videoId: string) => {
      const video = videos.find((v) => v.id === videoId);
      if (video?.videoUrl) {
        const link = document.createElement("a");
        link.href = video.videoUrl;
        link.download = `video-${videoId}.mp4`;
        link.click();
      }
    },
    [videos]
  );

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-black">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black">
      <div className="absolute left-0 right-0 top-0 z-10 flex items-center justify-center py-4">
        <h1 className="text-lg font-bold text-white">For You</h1>
      </div>

      <VideoFeed
        videos={videos}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onDownload={handleDownload}
        onSave={handleSave}
        onFollow={handleFollow}
        onVideoView={handleVideoView}
      />
    </div>
  );
}
