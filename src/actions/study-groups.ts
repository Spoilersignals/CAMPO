"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createStudyGroup(data: {
  courseCode: string;
  courseName?: string;
  topic?: string;
  location?: string;
  meetingTime?: Date;
  maxMembers?: number;
  description?: string;
  contactInfo: string;
}): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to create a study group" };
    }

    const studyGroup = await prisma.studyGroup.create({
      data: {
        courseCode: data.courseCode,
        courseName: data.courseName || null,
        topic: data.topic || null,
        location: data.location || null,
        meetingTime: data.meetingTime || null,
        maxMembers: data.maxMembers || null,
        description: data.description || null,
        contactInfo: data.contactInfo,
        userId: session.user.id,
        status: "OPEN",
      },
    });

    await prisma.studyGroupMember.create({
      data: {
        studyGroupId: studyGroup.id,
        userId: session.user.id,
      },
    });

    revalidatePath("/study-groups");
    return { success: true, data: studyGroup };
  } catch (error) {
    console.error("Failed to create study group:", error);
    return { success: false, error: "Failed to create study group" };
  }
}

export async function getStudyGroups(filters?: {
  courseCode?: string;
  status?: string;
}): Promise<ActionResult> {
  try {
    const where: Record<string, unknown> = {
      status: filters?.status || "OPEN",
    };

    if (filters?.courseCode) {
      where.courseCode = { contains: filters.courseCode };
    }

    const studyGroups = await prisma.studyGroup.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
        _count: {
          select: { members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: studyGroups };
  } catch (error) {
    console.error("Failed to get study groups:", error);
    return { success: false, error: "Failed to get study groups" };
  }
}

export async function getStudyGroupById(id: string): Promise<ActionResult> {
  try {
    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
              },
            },
          },
          orderBy: { joinedAt: "asc" },
        },
      },
    });

    if (!studyGroup) {
      return { success: false, error: "Study group not found" };
    }

    return { success: true, data: studyGroup };
  } catch (error) {
    console.error("Failed to get study group:", error);
    return { success: false, error: "Failed to get study group" };
  }
}

export async function joinStudyGroup(groupId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to join a study group" };
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: groupId },
      include: {
        _count: { select: { members: true } },
      },
    });

    if (!studyGroup) {
      return { success: false, error: "Study group not found" };
    }

    if (studyGroup.status !== "OPEN") {
      return { success: false, error: "This study group is not accepting new members" };
    }

    if (studyGroup.maxMembers && studyGroup._count.members >= studyGroup.maxMembers) {
      return { success: false, error: "This study group is full" };
    }

    const existingMember = await prisma.studyGroupMember.findUnique({
      where: {
        studyGroupId_userId: {
          studyGroupId: groupId,
          userId: session.user.id,
        },
      },
    });

    if (existingMember) {
      return { success: false, error: "You are already a member of this study group" };
    }

    const member = await prisma.studyGroupMember.create({
      data: {
        studyGroupId: groupId,
        userId: session.user.id,
      },
    });

    if (studyGroup.maxMembers && studyGroup._count.members + 1 >= studyGroup.maxMembers) {
      await prisma.studyGroup.update({
        where: { id: groupId },
        data: { status: "FULL" },
      });
    }

    revalidatePath("/study-groups");
    revalidatePath(`/study-groups/${groupId}`);
    return { success: true, data: member };
  } catch (error) {
    console.error("Failed to join study group:", error);
    return { success: false, error: "Failed to join study group" };
  }
}

export async function leaveStudyGroup(groupId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in to leave a study group" };
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id: groupId },
    });

    if (!studyGroup) {
      return { success: false, error: "Study group not found" };
    }

    if (studyGroup.userId === session.user.id) {
      return { success: false, error: "Group owners cannot leave. Close the group instead." };
    }

    const member = await prisma.studyGroupMember.findUnique({
      where: {
        studyGroupId_userId: {
          studyGroupId: groupId,
          userId: session.user.id,
        },
      },
    });

    if (!member) {
      return { success: false, error: "You are not a member of this study group" };
    }

    await prisma.studyGroupMember.delete({
      where: { id: member.id },
    });

    if (studyGroup.status === "FULL") {
      await prisma.studyGroup.update({
        where: { id: groupId },
        data: { status: "OPEN" },
      });
    }

    revalidatePath("/study-groups");
    revalidatePath(`/study-groups/${groupId}`);
    return { success: true };
  } catch (error) {
    console.error("Failed to leave study group:", error);
    return { success: false, error: "Failed to leave study group" };
  }
}

export async function updateStudyGroupStatus(
  id: string,
  status: "OPEN" | "FULL" | "CLOSED"
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in" };
    }

    const studyGroup = await prisma.studyGroup.findUnique({
      where: { id },
    });

    if (!studyGroup) {
      return { success: false, error: "Study group not found" };
    }

    if (studyGroup.userId !== session.user.id) {
      return { success: false, error: "Only the group owner can update the status" };
    }

    const updated = await prisma.studyGroup.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/study-groups");
    revalidatePath(`/study-groups/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Failed to update study group status:", error);
    return { success: false, error: "Failed to update study group status" };
  }
}

export async function getMyStudyGroups(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "You must be logged in" };
    }

    const [created, joined] = await Promise.all([
      prisma.studyGroup.findMany({
        where: { userId: session.user.id },
        include: {
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.studyGroup.findMany({
        where: {
          members: {
            some: { userId: session.user.id },
          },
          userId: { not: session.user.id },
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              image: true,
            },
          },
          _count: { select: { members: true } },
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return { success: true, data: { created, joined } };
  } catch (error) {
    console.error("Failed to get my study groups:", error);
    return { success: false, error: "Failed to get your study groups" };
  }
}
