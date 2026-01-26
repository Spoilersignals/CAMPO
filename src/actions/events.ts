"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

type CreateEventData = {
  title: string;
  description?: string;
  location: string;
  startTime: Date;
  endTime?: Date;
  category: string;
  imageUrl?: string;
  ticketPrice?: number;
  ticketLink?: string;
  contactInfo?: string;
};

type EventFilters = {
  category?: string;
  fromDate?: Date;
  toDate?: Date;
};

const VALID_CATEGORIES = ["PARTY", "CLUB", "ACADEMIC", "SPORTS", "CAREER", "OTHER"];

export async function createEvent(data: CreateEventData): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (!data.title || !data.location || !data.startTime || !data.category) {
      return { success: false, error: "Missing required fields" };
    }

    if (!VALID_CATEGORIES.includes(data.category)) {
      return { success: false, error: "Invalid category" };
    }

    const event = await prisma.campusEvent.create({
      data: {
        title: data.title,
        description: data.description || null,
        location: data.location,
        startTime: data.startTime,
        endTime: data.endTime || null,
        category: data.category,
        imageUrl: data.imageUrl || null,
        ticketPrice: data.ticketPrice || null,
        ticketLink: data.ticketLink || null,
        contactInfo: data.contactInfo || null,
        status: "PENDING",
        userId: session.user.id,
      },
    });

    revalidatePath("/events");
    return { success: true, data: event };
  } catch (error) {
    console.error("Error creating event:", error);
    return { success: false, error: "Failed to create event" };
  }
}

export async function getApprovedEvents(filters?: EventFilters): Promise<ActionResult> {
  try {
    const now = new Date();

    const where: {
      status: string;
      startTime: { gte: Date; lte?: Date };
      category?: string;
    } = {
      status: "APPROVED",
      startTime: {
        gte: filters?.fromDate || now,
      },
    };

    if (filters?.category) {
      where.category = filters.category;
    }

    if (filters?.toDate) {
      where.startTime.lte = filters.toDate;
    }

    const events = await prisma.campusEvent.findMany({
      where,
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { interested: true },
        },
      },
      orderBy: { startTime: "asc" },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function getEventById(id: string): Promise<ActionResult> {
  try {
    const event = await prisma.campusEvent.findUnique({
      where: { id },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { interested: true },
        },
      },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    return { success: true, data: event };
  } catch (error) {
    console.error("Error fetching event:", error);
    return { success: false, error: "Failed to fetch event" };
  }
}

export async function toggleEventInterest(eventId: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await prisma.campusEvent.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    const existing = await prisma.eventInterest.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    });

    if (existing) {
      await prisma.eventInterest.delete({
        where: { id: existing.id },
      });
      revalidatePath(`/events/${eventId}`);
      return { success: true, data: { interested: false } };
    } else {
      await prisma.eventInterest.create({
        data: {
          eventId,
          userId: session.user.id,
        },
      });
      revalidatePath(`/events/${eventId}`);
      return { success: true, data: { interested: true } };
    }
  } catch (error) {
    console.error("Error toggling interest:", error);
    return { success: false, error: "Failed to toggle interest" };
  }
}

export async function getInterestedUsers(eventId: string): Promise<ActionResult> {
  try {
    const count = await prisma.eventInterest.count({
      where: { eventId },
    });

    return { success: true, data: { count } };
  } catch (error) {
    console.error("Error fetching interested users:", error);
    return { success: false, error: "Failed to fetch interested count" };
  }
}

export async function getMyEvents(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const events = await prisma.campusEvent.findMany({
      where: { userId: session.user.id },
      include: {
        _count: {
          select: { interested: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching my events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function getMyInterestedEvents(): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const interests = await prisma.eventInterest.findMany({
      where: { userId: session.user.id },
      include: {
        event: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
            _count: {
              select: { interested: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const events = interests.map((i) => i.event);
    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching interested events:", error);
    return { success: false, error: "Failed to fetch events" };
  }
}

export async function updateEvent(
  id: string,
  data: Partial<CreateEventData>
): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await prisma.campusEvent.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    if (event.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (event.status === "CANCELLED") {
      return { success: false, error: "Cannot update a cancelled event" };
    }

    if (data.category && !VALID_CATEGORIES.includes(data.category)) {
      return { success: false, error: "Invalid category" };
    }

    const updated = await prisma.campusEvent.update({
      where: { id },
      data: {
        ...(data.title && { title: data.title }),
        ...(data.description !== undefined && { description: data.description || null }),
        ...(data.location && { location: data.location }),
        ...(data.startTime && { startTime: data.startTime }),
        ...(data.endTime !== undefined && { endTime: data.endTime || null }),
        ...(data.category && { category: data.category }),
        ...(data.imageUrl !== undefined && { imageUrl: data.imageUrl || null }),
        ...(data.ticketPrice !== undefined && { ticketPrice: data.ticketPrice || null }),
        ...(data.ticketLink !== undefined && { ticketLink: data.ticketLink || null }),
        ...(data.contactInfo !== undefined && { contactInfo: data.contactInfo || null }),
      },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true, data: updated };
  } catch (error) {
    console.error("Error updating event:", error);
    return { success: false, error: "Failed to update event" };
  }
}

export async function isUserInterestedInEvent(eventId: string): Promise<ActionResult<{ interested: boolean }>> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: true, data: { interested: false } };
    }

    const existing = await prisma.eventInterest.findUnique({
      where: {
        eventId_userId: {
          eventId,
          userId: session.user.id,
        },
      },
    });

    return { success: true, data: { interested: !!existing } };
  } catch (error) {
    console.error("Error checking interest:", error);
    return { success: false, error: "Failed to check interest" };
  }
}

export async function getFeaturedEvents(): Promise<ActionResult> {
  try {
    const now = new Date();

    const events = await prisma.campusEvent.findMany({
      where: {
        status: "APPROVED",
        startTime: { gte: now },
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
        _count: {
          select: { interested: true },
        },
      },
      orderBy: { interested: { _count: "desc" } },
      take: 4,
    });

    return { success: true, data: events };
  } catch (error) {
    console.error("Error fetching featured events:", error);
    return { success: false, error: "Failed to fetch featured events" };
  }
}

export async function cancelEvent(id: string): Promise<ActionResult> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const event = await prisma.campusEvent.findUnique({
      where: { id },
      select: { userId: true, status: true },
    });

    if (!event) {
      return { success: false, error: "Event not found" };
    }

    if (event.userId !== session.user.id) {
      return { success: false, error: "Unauthorized" };
    }

    if (event.status === "CANCELLED") {
      return { success: false, error: "Event is already cancelled" };
    }

    await prisma.campusEvent.update({
      where: { id },
      data: { status: "CANCELLED" },
    });

    revalidatePath("/events");
    revalidatePath(`/events/${id}`);
    return { success: true };
  } catch (error) {
    console.error("Error cancelling event:", error);
    return { success: false, error: "Failed to cancel event" };
  }
}
