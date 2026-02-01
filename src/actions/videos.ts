"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export interface VideoPostWithDetails {
  id: string;
  videoUrl: string;
  thumbnailUrl: string | null;
  caption: string | null;
  audioName: string | null;
  audioArtist: string | null;
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

export async function getVideoPosts(limit: number = 20): Promise<{
  success: boolean;
  data?: VideoPostWithDetails[];
  error?: string;
}> {
  try {
    const session = await auth();
    const userId = session?.user?.id;

    const videos = await prisma.videoPost.findMany({
      where: { status: "ACTIVE" },
      orderBy: { createdAt: "desc" },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: {
            likes: true,
            comments: true,
          },
        },
        likes: userId
          ? {
              where: { userId },
              take: 1,
            }
          : false,
        saves: userId
          ? {
              where: { userId },
              take: 1,
            }
          : false,
      },
    });

    let followingIds: string[] = [];
    if (userId) {
      const following = await prisma.follow.findMany({
        where: { followerId: userId },
        select: { followingId: true },
      });
      followingIds = following.map((f) => f.followingId);
    }

    const formattedVideos: VideoPostWithDetails[] = videos.map((video) => ({
      id: video.id,
      videoUrl: video.videoUrl,
      thumbnailUrl: video.thumbnailUrl,
      caption: video.caption,
      audioName: video.audioName,
      audioArtist: video.audioArtist,
      duration: video.duration,
      user: video.user,
      likeCount: video._count.likes,
      commentCount: video._count.comments,
      isLiked: Array.isArray(video.likes) && video.likes.length > 0,
      isSaved: Array.isArray(video.saves) && video.saves.length > 0,
      isFollowing: followingIds.includes(video.user.id),
    }));

    return { success: true, data: formattedVideos };
  } catch (error) {
    console.error("getVideoPosts error:", error);
    return { success: false, error: "Failed to fetch videos" };
  }
}

export async function likeVideo(videoId: string): Promise<{
  success: boolean;
  liked?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to like videos" };
    }

    const existingLike = await prisma.videoLike.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId: session.user.id,
        },
      },
    });

    if (existingLike) {
      await prisma.videoLike.delete({
        where: { id: existingLike.id },
      });
      return { success: true, liked: false };
    }

    await prisma.videoLike.create({
      data: {
        videoId,
        userId: session.user.id,
      },
    });

    return { success: true, liked: true };
  } catch (error) {
    console.error("likeVideo error:", error);
    return { success: false, error: "Failed to like video" };
  }
}

export async function saveVideo(videoId: string): Promise<{
  success: boolean;
  saved?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to save videos" };
    }

    const existingSave = await prisma.videoSave.findUnique({
      where: {
        videoId_userId: {
          videoId,
          userId: session.user.id,
        },
      },
    });

    if (existingSave) {
      await prisma.videoSave.delete({
        where: { id: existingSave.id },
      });
      return { success: true, saved: false };
    }

    await prisma.videoSave.create({
      data: {
        videoId,
        userId: session.user.id,
      },
    });

    return { success: true, saved: true };
  } catch (error) {
    console.error("saveVideo error:", error);
    return { success: false, error: "Failed to save video" };
  }
}

export async function followUser(userId: string): Promise<{
  success: boolean;
  following?: boolean;
  error?: string;
}> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to follow users" };
    }

    if (session.user.id === userId) {
      return { success: false, error: "You cannot follow yourself" };
    }

    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: session.user.id,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      await prisma.follow.delete({
        where: { id: existingFollow.id },
      });
      revalidatePath("/videos");
      return { success: true, following: false };
    }

    await prisma.follow.create({
      data: {
        followerId: session.user.id,
        followingId: userId,
      },
    });

    revalidatePath("/videos");
    return { success: true, following: true };
  } catch (error) {
    console.error("followUser error:", error);
    return { success: false, error: "Failed to follow user" };
  }
}

export async function incrementVideoView(videoId: string): Promise<{
  success: boolean;
  error?: string;
}> {
  try {
    await prisma.videoPost.update({
      where: { id: videoId },
      data: {
        viewCount: { increment: 1 },
      },
    });

    return { success: true };
  } catch (error) {
    console.error("incrementVideoView error:", error);
    return { success: false, error: "Failed to increment view count" };
  }
}
