"use server";

import { prisma } from "@/lib/prisma";
import { getSessionId } from "@/lib/session";

type ActionResult<T = unknown> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function getCourses(
  search?: string,
  department?: string
): Promise<
  ActionResult<{
    courses: Array<{
      id: string;
      code: string;
      name: string;
      department: string | null;
      reviewCount: number;
      avgRating: number | null;
    }>;
  }>
> {
  try {
    const courses = await prisma.course.findMany({
      where: {
        AND: [
          department ? { department } : {},
          search
            ? {
                OR: [
                  { code: { contains: search } },
                  { name: { contains: search } },
                ],
              }
            : {},
        ],
      },
      orderBy: { code: "asc" },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    const formattedCourses = courses.map((course) => {
      const ratings = course.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      return {
        id: course.id,
        code: course.code,
        name: course.name,
        department: course.department,
        reviewCount: course.reviews.length,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      };
    });

    return { success: true, data: { courses: formattedCourses } };
  } catch (error) {
    console.error("getCourses error:", error);
    return { success: false, error: "Failed to fetch courses" };
  }
}

export async function getCourseById(id: string): Promise<
  ActionResult<{
    id: string;
    code: string;
    name: string;
    department: string | null;
    createdAt: Date;
    avgRating: number | null;
    avgDifficulty: number | null;
    avgWorkload: number | null;
    wouldTakeAgainPercent: number | null;
    reviews: Array<{
      id: string;
      rating: number;
      difficulty: number | null;
      workload: number | null;
      content: string | null;
      grade: string | null;
      wouldTakeAgain: boolean | null;
      tips: string | null;
      semester: string | null;
      isAnonymous: boolean;
      authorName: string | null;
      createdAt: Date;
      professor: { id: string; name: string } | null;
    }>;
  }>
> {
  try {
    const course = await prisma.course.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            professor: {
              select: { id: true, name: true },
            },
          },
        },
      },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    const ratings = course.reviews.map((r) => r.rating);
    const difficulties = course.reviews
      .map((r) => r.difficulty)
      .filter((d): d is number => d !== null);
    const workloads = course.reviews
      .map((r) => r.workload)
      .filter((w): w is number => w !== null);
    const wouldTakeAgainValues = course.reviews
      .map((r) => r.wouldTakeAgain)
      .filter((w): w is boolean => w !== null);

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
    const avgDifficulty =
      difficulties.length > 0
        ? Math.round((difficulties.reduce((a, b) => a + b, 0) / difficulties.length) * 10) / 10
        : null;
    const avgWorkload =
      workloads.length > 0
        ? Math.round((workloads.reduce((a, b) => a + b, 0) / workloads.length) * 10) / 10
        : null;
    const wouldTakeAgainPercent =
      wouldTakeAgainValues.length > 0
        ? Math.round(
            (wouldTakeAgainValues.filter((v) => v).length / wouldTakeAgainValues.length) * 100
          )
        : null;

    return {
      success: true,
      data: {
        id: course.id,
        code: course.code,
        name: course.name,
        department: course.department,
        createdAt: course.createdAt,
        avgRating,
        avgDifficulty,
        avgWorkload,
        wouldTakeAgainPercent,
        reviews: course.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          difficulty: r.difficulty,
          workload: r.workload,
          content: r.content,
          grade: r.grade,
          wouldTakeAgain: r.wouldTakeAgain,
          tips: r.tips,
          semester: r.semester,
          isAnonymous: r.isAnonymous,
          authorName: r.isAnonymous ? null : r.authorName,
          createdAt: r.createdAt,
          professor: r.professor,
        })),
      },
    };
  } catch (error) {
    console.error("getCourseById error:", error);
    return { success: false, error: "Failed to fetch course" };
  }
}

export async function getProfessors(
  search?: string,
  department?: string
): Promise<
  ActionResult<{
    professors: Array<{
      id: string;
      name: string;
      department: string | null;
      reviewCount: number;
      avgRating: number | null;
    }>;
  }>
> {
  try {
    const professors = await prisma.professor.findMany({
      where: {
        AND: [
          department ? { department } : {},
          search ? { name: { contains: search } } : {},
        ],
      },
      orderBy: { name: "asc" },
      include: {
        reviews: {
          select: { rating: true },
        },
      },
    });

    const formattedProfessors = professors.map((professor) => {
      const ratings = professor.reviews.map((r) => r.rating);
      const avgRating =
        ratings.length > 0
          ? ratings.reduce((a, b) => a + b, 0) / ratings.length
          : null;

      return {
        id: professor.id,
        name: professor.name,
        department: professor.department,
        reviewCount: professor.reviews.length,
        avgRating: avgRating ? Math.round(avgRating * 10) / 10 : null,
      };
    });

    return { success: true, data: { professors: formattedProfessors } };
  } catch (error) {
    console.error("getProfessors error:", error);
    return { success: false, error: "Failed to fetch professors" };
  }
}

export async function getProfessorById(id: string): Promise<
  ActionResult<{
    id: string;
    name: string;
    department: string | null;
    createdAt: Date;
    avgRating: number | null;
    avgDifficulty: number | null;
    wouldTakeAgainPercent: number | null;
    reviews: Array<{
      id: string;
      rating: number;
      difficulty: number | null;
      workload: number | null;
      content: string | null;
      grade: string | null;
      wouldTakeAgain: boolean | null;
      tips: string | null;
      semester: string | null;
      isAnonymous: boolean;
      authorName: string | null;
      createdAt: Date;
      course: { id: string; code: string; name: string };
    }>;
  }>
> {
  try {
    const professor = await prisma.professor.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: "desc" },
          include: {
            course: {
              select: { id: true, code: true, name: true },
            },
          },
        },
      },
    });

    if (!professor) {
      return { success: false, error: "Professor not found" };
    }

    const ratings = professor.reviews.map((r) => r.rating);
    const difficulties = professor.reviews
      .map((r) => r.difficulty)
      .filter((d): d is number => d !== null);
    const wouldTakeAgainValues = professor.reviews
      .map((r) => r.wouldTakeAgain)
      .filter((w): w is boolean => w !== null);

    const avgRating =
      ratings.length > 0
        ? Math.round((ratings.reduce((a, b) => a + b, 0) / ratings.length) * 10) / 10
        : null;
    const avgDifficulty =
      difficulties.length > 0
        ? Math.round((difficulties.reduce((a, b) => a + b, 0) / difficulties.length) * 10) / 10
        : null;
    const wouldTakeAgainPercent =
      wouldTakeAgainValues.length > 0
        ? Math.round(
            (wouldTakeAgainValues.filter((v) => v).length / wouldTakeAgainValues.length) * 100
          )
        : null;

    return {
      success: true,
      data: {
        id: professor.id,
        name: professor.name,
        department: professor.department,
        createdAt: professor.createdAt,
        avgRating,
        avgDifficulty,
        wouldTakeAgainPercent,
        reviews: professor.reviews.map((r) => ({
          id: r.id,
          rating: r.rating,
          difficulty: r.difficulty,
          workload: r.workload,
          content: r.content,
          grade: r.grade,
          wouldTakeAgain: r.wouldTakeAgain,
          tips: r.tips,
          semester: r.semester,
          isAnonymous: r.isAnonymous,
          authorName: r.isAnonymous ? null : r.authorName,
          createdAt: r.createdAt,
          course: r.course,
        })),
      },
    };
  } catch (error) {
    console.error("getProfessorById error:", error);
    return { success: false, error: "Failed to fetch professor" };
  }
}

export async function submitCourseReview(data: {
  courseId: string;
  professorId?: string;
  rating: number;
  difficulty?: number;
  workload?: number;
  content?: string;
  grade?: string;
  wouldTakeAgain?: boolean;
  tips?: string;
  semester?: string;
  isAnonymous?: boolean;
  authorName?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    const sessionId = await getSessionId();

    if (!data.courseId) {
      return { success: false, error: "Course is required" };
    }

    if (!data.rating || data.rating < 1 || data.rating > 5) {
      return { success: false, error: "Rating must be between 1 and 5" };
    }

    if (data.difficulty && (data.difficulty < 1 || data.difficulty > 5)) {
      return { success: false, error: "Difficulty must be between 1 and 5" };
    }

    if (data.workload && (data.workload < 1 || data.workload > 5)) {
      return { success: false, error: "Workload must be between 1 and 5" };
    }

    const course = await prisma.course.findUnique({
      where: { id: data.courseId },
    });

    if (!course) {
      return { success: false, error: "Course not found" };
    }

    if (data.professorId) {
      const professor = await prisma.professor.findUnique({
        where: { id: data.professorId },
      });
      if (!professor) {
        return { success: false, error: "Professor not found" };
      }
    }

    const review = await prisma.courseReview.create({
      data: {
        sessionId,
        courseId: data.courseId,
        professorId: data.professorId || null,
        rating: data.rating,
        difficulty: data.difficulty || null,
        workload: data.workload || null,
        content: data.content?.trim() || null,
        grade: data.grade?.trim() || null,
        wouldTakeAgain: data.wouldTakeAgain ?? null,
        tips: data.tips?.trim() || null,
        semester: data.semester?.trim() || null,
        isAnonymous: data.isAnonymous ?? true,
        authorName: data.isAnonymous === false ? data.authorName?.trim() || null : null,
      },
    });

    return { success: true, data: { id: review.id } };
  } catch (error) {
    console.error("submitCourseReview error:", error);
    return { success: false, error: "Failed to submit review" };
  }
}

export async function createCourse(data: {
  code: string;
  name: string;
  department?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.code?.trim()) {
      return { success: false, error: "Course code is required" };
    }

    if (!data.name?.trim()) {
      return { success: false, error: "Course name is required" };
    }

    const existingCourse = await prisma.course.findUnique({
      where: { code: data.code.trim().toUpperCase() },
    });

    if (existingCourse) {
      return { success: true, data: { id: existingCourse.id } };
    }

    const course = await prisma.course.create({
      data: {
        code: data.code.trim().toUpperCase(),
        name: data.name.trim(),
        department: data.department?.trim() || null,
      },
    });

    return { success: true, data: { id: course.id } };
  } catch (error) {
    console.error("createCourse error:", error);
    return { success: false, error: "Failed to create course" };
  }
}

export async function createProfessor(data: {
  name: string;
  department?: string;
}): Promise<ActionResult<{ id: string }>> {
  try {
    if (!data.name?.trim()) {
      return { success: false, error: "Professor name is required" };
    }

    const existingProfessor = await prisma.professor.findFirst({
      where: {
        name: { equals: data.name.trim() },
        department: data.department?.trim() || null,
      },
    });

    if (existingProfessor) {
      return { success: true, data: { id: existingProfessor.id } };
    }

    const professor = await prisma.professor.create({
      data: {
        name: data.name.trim(),
        department: data.department?.trim() || null,
      },
    });

    return { success: true, data: { id: professor.id } };
  } catch (error) {
    console.error("createProfessor error:", error);
    return { success: false, error: "Failed to create professor" };
  }
}
