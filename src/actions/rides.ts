"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type RideType = "OFFERING" | "LOOKING";
type RideStatus = "ACTIVE" | "FULL" | "CANCELLED" | "COMPLETED";

interface CreateRideData {
  type: RideType;
  origin: string;
  destination: string;
  departureDate: Date;
  departureTime?: string;
  seatsAvailable?: number;
  seatsNeeded?: number;
  pricePerSeat?: number;
  description?: string;
  contactPhone: string;
  contactName?: string;
}

interface RideFilters {
  type?: string;
  origin?: string;
  destination?: string;
  fromDate?: Date;
}

export async function createRide(data: CreateRideData) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ride = await prisma.rideShare.create({
      data: {
        type: data.type,
        origin: data.origin,
        destination: data.destination,
        departureDate: data.departureDate,
        departureTime: data.departureTime,
        seatsAvailable: data.seatsAvailable,
        seatsNeeded: data.seatsNeeded,
        pricePerSeat: data.pricePerSeat,
        description: data.description,
        contactPhone: data.contactPhone,
        contactName: data.contactName,
        userId: session.user.id,
      },
    });

    revalidatePath("/rides");
    return { success: true, data: ride };
  } catch (error) {
    console.error("Failed to create ride:", error);
    return { success: false, error: "Failed to create ride" };
  }
}

export async function getRides(filters?: RideFilters) {
  try {
    const where: Record<string, unknown> = {
      status: "ACTIVE",
      departureDate: {
        gte: new Date(),
      },
    };

    if (filters?.type) {
      where.type = filters.type;
    }

    if (filters?.origin) {
      where.origin = {
        contains: filters.origin,
      };
    }

    if (filters?.destination) {
      where.destination = {
        contains: filters.destination,
      };
    }

    if (filters?.fromDate) {
      where.departureDate = {
        gte: filters.fromDate,
      };
    }

    const rides = await prisma.rideShare.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        departureDate: "asc",
      },
    });

    return { success: true, data: rides };
  } catch (error) {
    console.error("Failed to get rides:", error);
    return { success: false, error: "Failed to get rides" };
  }
}

export async function getRideById(id: string) {
  try {
    const ride = await prisma.rideShare.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    if (!ride) {
      return { success: false, error: "Ride not found" };
    }

    return { success: true, data: ride };
  } catch (error) {
    console.error("Failed to get ride:", error);
    return { success: false, error: "Failed to get ride" };
  }
}

export async function updateRideStatus(id: string, status: RideStatus) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ride = await prisma.rideShare.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ride) {
      return { success: false, error: "Ride not found" };
    }

    if (ride.userId !== session.user.id) {
      return { success: false, error: "Not authorized to update this ride" };
    }

    const updatedRide = await prisma.rideShare.update({
      where: { id },
      data: { status },
    });

    revalidatePath("/rides");
    revalidatePath(`/rides/${id}`);
    return { success: true, data: updatedRide };
  } catch (error) {
    console.error("Failed to update ride status:", error);
    return { success: false, error: "Failed to update ride status" };
  }
}

export async function deleteRide(id: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const ride = await prisma.rideShare.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!ride) {
      return { success: false, error: "Ride not found" };
    }

    if (ride.userId !== session.user.id) {
      return { success: false, error: "Not authorized to delete this ride" };
    }

    await prisma.rideShare.delete({
      where: { id },
    });

    revalidatePath("/rides");
    return { success: true };
  } catch (error) {
    console.error("Failed to delete ride:", error);
    return { success: false, error: "Failed to delete ride" };
  }
}

export async function getMyRides() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Unauthorized" };
    }

    const rides = await prisma.rideShare.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, data: rides };
  } catch (error) {
    console.error("Failed to get user rides:", error);
    return { success: false, error: "Failed to get your rides" };
  }
}
