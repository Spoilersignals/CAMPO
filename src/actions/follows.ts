"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function followUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to follow users" };
  }

  if (session.user.id === userId) {
    return { error: "You cannot follow yourself" };
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
    return { error: "You are already following this user" };
  }

  await prisma.follow.create({
    data: {
      followerId: session.user.id,
      followingId: userId,
    },
  });

  revalidatePath(`/profile/${userId}`);
  return { success: true };
}

export async function unfollowUser(userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "You must be logged in to unfollow users" };
  }

  await prisma.follow.deleteMany({
    where: {
      followerId: session.user.id,
      followingId: userId,
    },
  });

  revalidatePath(`/profile/${userId}`);
  return { success: true };
}

export async function getFollowers(userId: string) {
  const followers = await prisma.follow.findMany({
    where: { followingId: userId },
    include: {
      follower: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return followers.map((f) => f.follower);
}

export async function getFollowing(userId: string) {
  const following = await prisma.follow.findMany({
    where: { followerId: userId },
    include: {
      following: {
        select: {
          id: true,
          name: true,
          image: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return following.map((f) => f.following);
}

export async function isFollowing(userId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return false;
  }

  const follow = await prisma.follow.findUnique({
    where: {
      followerId_followingId: {
        followerId: session.user.id,
        followingId: userId,
      },
    },
  });

  return !!follow;
}

export async function getFollowStatus(userId: string) {
  return isFollowing(userId);
}

export async function getFollowCounts(userId: string) {
  const [followersCount, followingCount] = await Promise.all([
    prisma.follow.count({ where: { followingId: userId } }),
    prisma.follow.count({ where: { followerId: userId } }),
  ]);

  return { followersCount, followingCount };
}
