"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, TrendingUp, ThumbsUp, User, BookOpen } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { getProfessorById } from "@/actions/courses";
import { formatRelativeTime } from "@/lib/utils";

function StarRating({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "md" | "lg" }) {
  const stars = [];
  const fullStars = rating ? Math.floor(rating) : 0;
  const hasHalfStar = rating ? rating % 1 >= 0.5 : false;
  const starSize = size === "sm" ? "h-4 w-4" : size === "md" ? "h-5 w-5" : "h-6 w-6";

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star key={i} className={`${starSize} fill-yellow-400 text-yellow-400`} />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star className={`${starSize} text-gray-300`} />
          <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className={`${starSize} fill-yellow-400 text-yellow-400`} />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className={`${starSize} text-gray-300`} />);
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function ProfessorDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [professor, setProfessor] = useState<{
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
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfessor();
  }, [id]);

  async function loadProfessor() {
    setIsLoading(true);
    const result = await getProfessorById(id);
    if (result.success && result.data) {
      setProfessor(result.data);
    } else {
      setError(result.error || "Professor not found");
    }
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 flex items-center gap-6">
          <div className="h-20 w-20 animate-pulse rounded-full bg-gray-200" />
          <div className="space-y-2">
            <div className="h-8 w-48 animate-pulse rounded bg-gray-200" />
            <div className="h-5 w-32 animate-pulse rounded bg-gray-200" />
          </div>
        </div>
        <div className="mb-8 grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="mx-auto h-8 w-16 animate-pulse rounded bg-gray-200" />
                <div className="mx-auto mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !professor) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link
          href="/courses/professors"
          className="mb-6 inline-flex items-center gap-1 text-blue-600 hover:underline"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to professors
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || "Professor not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/courses/professors"
        className="mb-6 inline-flex items-center gap-1 text-blue-600 hover:underline"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to professors
      </Link>

      <div className="mb-8 flex items-center gap-6">
        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-2xl font-bold text-blue-600">
          {professor.name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .slice(0, 2)}
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{professor.name}</h1>
          {professor.department && (
            <p className="mt-1 text-gray-600">{professor.department}</p>
          )}
        </div>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900">
                {professor.avgRating?.toFixed(1) ?? "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Average Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <TrendingUp className="h-6 w-6 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">
                {professor.avgDifficulty?.toFixed(1) ?? "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Difficulty</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <ThumbsUp className="h-6 w-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {professor.wouldTakeAgainPercent !== null
                  ? `${professor.wouldTakeAgainPercent}%`
                  : "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Would Take Again</p>
          </CardContent>
        </Card>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Reviews ({professor.reviews.length})
        </h2>

        {professor.reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No reviews yet for this professor.</p>
              <p className="mt-2 text-sm text-gray-400">
                Reviews are added when students review courses taught by this professor.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {professor.reviews.map((review) => (
              <Card key={review.id}>
                <CardContent className="py-6">
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100">
                        <User className="h-5 w-5 text-gray-500" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">
                          {review.isAnonymous ? "Anonymous" : review.authorName || "Anonymous"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatRelativeTime(review.createdAt)}
                          {review.semester && ` · ${review.semester}`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} size="md" />
                      <span className="font-semibold text-gray-900">
                        {review.rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="mb-4">
                    <Link
                      href={`/courses/${review.course.id}`}
                      className="inline-flex items-center gap-2 rounded-lg bg-gray-100 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-200"
                    >
                      <BookOpen className="h-4 w-4" />
                      {review.course.code} - {review.course.name}
                    </Link>
                  </div>

                  <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    {review.difficulty && (
                      <span className="text-gray-600">
                        Difficulty: {review.difficulty}/5
                      </span>
                    )}
                    {review.workload && (
                      <span className="text-gray-600">
                        Workload: {review.workload}/5
                      </span>
                    )}
                    {review.grade && (
                      <span className="text-gray-600">Grade: {review.grade}</span>
                    )}
                    {review.wouldTakeAgain !== null && (
                      <span
                        className={
                          review.wouldTakeAgain ? "text-green-600" : "text-red-600"
                        }
                      >
                        {review.wouldTakeAgain
                          ? "Would take again"
                          : "Would not take again"}
                      </span>
                    )}
                  </div>

                  {review.content && (
                    <p className="mb-4 whitespace-pre-wrap text-gray-700">
                      {review.content}
                    </p>
                  )}

                  {review.tips && (
                    <div className="rounded-lg bg-blue-50 p-4">
                      <p className="text-sm font-medium text-blue-900">
                        💡 Tips for future students:
                      </p>
                      <p className="mt-1 text-sm text-blue-800">{review.tips}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
