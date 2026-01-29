"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Types
export type DatingProfileData = {
  displayName: string;
  bio?: string;
  age: number;
  gender: string;
  lookingFor: string[];
  course?: string;
  yearOfStudy?: number;
  faculty?: string;
  interests: string[];
  height?: string;
  relationshipGoal?: string;
  instagramHandle?: string;
  spotifyArtists?: string;
  prompt1Question?: string;
  prompt1Answer?: string;
  prompt2Question?: string;
  prompt2Answer?: string;
  prompt3Question?: string;
  prompt3Answer?: string;
  minAge?: number;
  maxAge?: number;
};

// Get current user's dating profile
export async function getMyDatingProfile() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      user: { select: { name: true, email: true, image: true } },
    },
  });

  return { success: true, data: profile };
}

// Create or update dating profile
export async function upsertDatingProfile(data: DatingProfileData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (data.age < 18) {
    return { success: false, error: "You must be at least 18 years old" };
  }

  // Calculate profile completeness
  let completeness = 0;
  if (data.displayName) completeness += 10;
  if (data.bio && data.bio.length > 20) completeness += 15;
  if (data.age) completeness += 10;
  if (data.gender) completeness += 10;
  if (data.lookingFor?.length > 0) completeness += 10;
  if (data.interests?.length >= 3) completeness += 15;
  if (data.course) completeness += 5;
  if (data.prompt1Answer) completeness += 10;
  if (data.prompt2Answer) completeness += 10;
  if (data.relationshipGoal) completeness += 5;

  const profile = await prisma.datingProfile.upsert({
    where: { userId: session.user.id },
    create: {
      userId: session.user.id,
      ...data,
      profileCompleteness: Math.min(completeness, 100),
    },
    update: {
      ...data,
      profileCompleteness: Math.min(completeness, 100),
    },
  });

  revalidatePath("/dating");
  return { success: true, data: profile };
}

// Add photo to dating profile
export async function addDatingPhoto(url: string, isMain: boolean = false) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: { photos: true },
  });

  if (!profile) {
    return { success: false, error: "Create a profile first" };
  }

  if (profile.photos.length >= 6) {
    return { success: false, error: "Maximum 6 photos allowed" };
  }

  // If this is set as main, unset others
  if (isMain) {
    await prisma.datingPhoto.updateMany({
      where: { datingProfileId: profile.id },
      data: { isMain: false },
    });
  }

  const photo = await prisma.datingPhoto.create({
    data: {
      url,
      isMain: isMain || profile.photos.length === 0,
      sortOrder: profile.photos.length,
      datingProfileId: profile.id,
    },
  });

  // Update completeness
  const newPhotoCount = profile.photos.length + 1;
  let photoBonus = 0;
  if (newPhotoCount >= 1) photoBonus = 10;
  if (newPhotoCount >= 3) photoBonus = 20;
  if (newPhotoCount >= 5) photoBonus = 25;

  await prisma.datingProfile.update({
    where: { id: profile.id },
    data: {
      profileCompleteness: Math.min(profile.profileCompleteness + photoBonus, 100),
    },
  });

  revalidatePath("/dating/profile");
  return { success: true, data: photo };
}

// Delete photo
export async function deleteDatingPhoto(photoId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const photo = await prisma.datingPhoto.findUnique({
    where: { id: photoId },
    include: { datingProfile: true },
  });

  if (!photo || photo.datingProfile.userId !== session.user.id) {
    return { success: false, error: "Photo not found" };
  }

  await prisma.datingPhoto.delete({ where: { id: photoId } });
  revalidatePath("/dating/profile");
  return { success: true };
}

// Get profiles for browsing (guests can browse, but need account to interact)
export async function getBrowseProfiles(limit: number = 10) {
  const profiles = await prisma.datingProfile.findMany({
    where: {
      isActive: true,
      showMe: true,
    },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
    take: limit,
    orderBy: [{ profileCompleteness: "desc" }, { createdAt: "desc" }],
  });

  return { success: true, data: profiles };
}

// Get profiles to swipe on
export async function getDiscoveryProfiles(limit: number = 10) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated", needsAuth: true };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: {
      sentSwipes: { select: { swipedId: true } },
      blocks: { select: { blockedId: true } },
      blockedBy: { select: { blockerId: true } },
    },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first", needsProfile: true };
  }

  // Get IDs to exclude (already swiped, blocked, or blocked by)
  const excludeIds = [
    myProfile.id,
    ...myProfile.sentSwipes.map((s) => s.swipedId),
    ...myProfile.blocks.map((b) => b.blockedId),
    ...myProfile.blockedBy.map((b) => b.blockerId),
  ];

  const profiles = await prisma.datingProfile.findMany({
    where: {
      id: { notIn: excludeIds },
      isActive: true,
      showMe: true,
      gender: { in: myProfile.lookingFor },
      lookingFor: { has: myProfile.gender },
      age: { gte: myProfile.minAge, lte: myProfile.maxAge },
    },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
    take: limit,
    orderBy: [{ profileCompleteness: "desc" }, { createdAt: "desc" }],
  });

  return { success: true, data: profiles };
}

// Swipe on a profile
export async function swipeProfile(
  profileId: string,
  type: "LIKE" | "PASS" | "SUPER_LIKE"
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  if (myProfile.id === profileId) {
    return { success: false, error: "Cannot swipe on yourself" };
  }

  // Check super like limit
  if (type === "SUPER_LIKE") {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (myProfile.lastSuperLikeReset < today) {
      // Reset super likes for new day
      await prisma.datingProfile.update({
        where: { id: myProfile.id },
        data: { superLikesRemaining: 3, lastSuperLikeReset: new Date() },
      });
    } else if (myProfile.superLikesRemaining <= 0) {
      return { success: false, error: "No super likes remaining today" };
    }
  }

  // Create the swipe
  await prisma.datingSwipe.upsert({
    where: {
      swiperId_swipedId: {
        swiperId: myProfile.id,
        swipedId: profileId,
      },
    },
    create: {
      swiperId: myProfile.id,
      swipedId: profileId,
      type,
    },
    update: { type },
  });

  // Decrement super likes if used
  if (type === "SUPER_LIKE") {
    await prisma.datingProfile.update({
      where: { id: myProfile.id },
      data: { superLikesRemaining: { decrement: 1 } },
    });
  }

  // Check for match (if they also liked us)
  let isMatch = false;
  if (type === "LIKE" || type === "SUPER_LIKE") {
    const theirSwipe = await prisma.datingSwipe.findUnique({
      where: {
        swiperId_swipedId: {
          swiperId: profileId,
          swipedId: myProfile.id,
        },
      },
    });

    if (
      theirSwipe &&
      (theirSwipe.type === "LIKE" || theirSwipe.type === "SUPER_LIKE")
    ) {
      // It's a match! Create the match record
      const existingMatch = await prisma.datingMatch.findFirst({
        where: {
          OR: [
            { profile1Id: myProfile.id, profile2Id: profileId },
            { profile1Id: profileId, profile2Id: myProfile.id },
          ],
        },
      });

      if (!existingMatch) {
        await prisma.datingMatch.create({
          data: {
            profile1Id: myProfile.id,
            profile2Id: profileId,
          },
        });
        isMatch = true;
      }
    }
  }

  return { success: true, isMatch };
}

// Get all matches
export async function getMatches() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  const matches = await prisma.datingMatch.findMany({
    where: {
      OR: [{ profile1Id: myProfile.id }, { profile2Id: myProfile.id }],
      isActive: true,
    },
    include: {
      profile1: {
        include: { photos: { where: { isMain: true }, take: 1 } },
      },
      profile2: {
        include: { photos: { where: { isMain: true }, take: 1 } },
      },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { lastMessageAt: { sort: "desc", nulls: "last" } },
  });

  // Format matches to show the other person
  const formattedMatches = matches.map((match) => {
    const otherProfile =
      match.profile1Id === myProfile.id ? match.profile2 : match.profile1;
    return {
      matchId: match.id,
      matchedAt: match.matchedAt,
      lastMessage: match.messages[0] || null,
      profile: otherProfile,
    };
  });

  return { success: true, data: formattedMatches, myProfileId: myProfile.id };
}

// Get match messages
export async function getMatchMessages(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  const match = await prisma.datingMatch.findFirst({
    where: {
      id: matchId,
      OR: [{ profile1Id: myProfile.id }, { profile2Id: myProfile.id }],
      isActive: true,
    },
    include: {
      profile1: { include: { photos: { where: { isMain: true }, take: 1 } } },
      profile2: { include: { photos: { where: { isMain: true }, take: 1 } } },
      messages: {
        orderBy: { createdAt: "asc" },
        take: 100,
      },
    },
  });

  if (!match) {
    return { success: false, error: "Match not found" };
  }

  // Mark messages as read
  await prisma.datingMessage.updateMany({
    where: {
      matchId,
      senderId: { not: myProfile.id },
      isRead: false,
    },
    data: { isRead: true },
  });

  const otherProfile =
    match.profile1Id === myProfile.id ? match.profile2 : match.profile1;

  return {
    success: true,
    data: {
      match,
      messages: match.messages,
      otherProfile,
      myProfileId: myProfile.id,
    },
  };
}

// Send a message
export async function sendDatingMessage(matchId: string, content: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  if (!content.trim()) {
    return { success: false, error: "Message cannot be empty" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  const match = await prisma.datingMatch.findFirst({
    where: {
      id: matchId,
      OR: [{ profile1Id: myProfile.id }, { profile2Id: myProfile.id }],
      isActive: true,
    },
  });

  if (!match) {
    return { success: false, error: "Match not found" };
  }

  const message = await prisma.datingMessage.create({
    data: {
      matchId,
      senderId: myProfile.id,
      content: content.trim(),
    },
  });

  // Update last message time
  await prisma.datingMatch.update({
    where: { id: matchId },
    data: { lastMessageAt: new Date() },
  });

  return { success: true, data: message };
}

// Unmatch
export async function unmatch(matchId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  await prisma.datingMatch.updateMany({
    where: {
      id: matchId,
      OR: [{ profile1Id: myProfile.id }, { profile2Id: myProfile.id }],
    },
    data: { isActive: false },
  });

  revalidatePath("/dating/matches");
  return { success: true };
}

// Block a profile
export async function blockProfile(profileId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  await prisma.datingBlock.create({
    data: {
      blockerId: myProfile.id,
      blockedId: profileId,
    },
  });

  // Also unmatch if matched
  await prisma.datingMatch.updateMany({
    where: {
      OR: [
        { profile1Id: myProfile.id, profile2Id: profileId },
        { profile1Id: profileId, profile2Id: myProfile.id },
      ],
    },
    data: { isActive: false },
  });

  return { success: true };
}

// Report a profile
export async function reportProfile(
  profileId: string,
  reason: string,
  details?: string
) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  await prisma.datingReport.create({
    data: {
      reporterId: myProfile.id,
      reportedId: profileId,
      reason,
      details,
    },
  });

  return { success: true };
}

// Get who liked me (shows profiles that swiped right on me but I haven't swiped on yet)
export async function getWhoLikedMe() {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const myProfile = await prisma.datingProfile.findUnique({
    where: { userId: session.user.id },
    include: { sentSwipes: { select: { swipedId: true } } },
  });

  if (!myProfile) {
    return { success: false, error: "Create a profile first" };
  }

  const swipedIds = myProfile.sentSwipes.map((s) => s.swipedId);

  const likes = await prisma.datingSwipe.findMany({
    where: {
      swipedId: myProfile.id,
      type: { in: ["LIKE", "SUPER_LIKE"] },
      swiperId: { notIn: swipedIds },
    },
    include: {
      swiper: {
        include: { photos: { where: { isMain: true }, take: 1 } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return {
    success: true,
    data: likes.map((l) => ({
      ...l.swiper,
      isSuperLike: l.type === "SUPER_LIKE",
    })),
    count: likes.length,
  };
}

// Toggle profile visibility
export async function toggleProfileVisibility(showMe: boolean) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  await prisma.datingProfile.update({
    where: { userId: session.user.id },
    data: { showMe },
  });

  return { success: true };
}

// Get a single profile by ID
export async function getProfileById(profileId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: "Not authenticated" };
  }

  const profile = await prisma.datingProfile.findUnique({
    where: { id: profileId },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
    },
  });

  if (!profile) {
    return { success: false, error: "Profile not found" };
  }

  return { success: true, data: profile };
}
