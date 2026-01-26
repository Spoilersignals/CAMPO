"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ArrowLeft, Star, Clock, TrendingUp, ThumbsUp, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { getCourseById, submitCourseReview, getProfessors } from "@/actions/courses";
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

function InteractiveStarRating({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const [hoverValue, setHoverValue] = useState(0);

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoverValue(star)}
            onMouseLeave={() => setHoverValue(0)}
            className="focus:outline-none"
          >
            <Star
              className={`h-8 w-8 transition-colors ${
                star <= (hoverValue || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300 hover:text-yellow-200"
              }`}
            />
          </button>
        ))}
        <span className="ml-2 text-sm text-gray-500">
          {value > 0 ? `${value}/5` : "Select rating"}
        </span>
      </div>
    </div>
  );
}

function DifficultySelector({
  value,
  onChange,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  label: string;
}) {
  const levels = [
    { value: 1, label: "Very Easy", color: "bg-green-500" },
    { value: 2, label: "Easy", color: "bg-green-400" },
    { value: 3, label: "Moderate", color: "bg-yellow-400" },
    { value: 4, label: "Hard", color: "bg-orange-400" },
    { value: 5, label: "Very Hard", color: "bg-red-500" },
  ];

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex gap-2">
        {levels.map((level) => (
          <button
            key={level.value}
            type="button"
            onClick={() => onChange(level.value)}
            className={`flex-1 rounded-lg border-2 px-2 py-2 text-xs font-medium transition-all ${
              value === level.value
                ? `${level.color} border-transparent text-white`
                : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
            }`}
          >
            {level.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const GRADE_OPTIONS = [
  "",
  "A+",
  "A",
  "A-",
  "B+",
  "B",
  "B-",
  "C+",
  "C",
  "C-",
  "D+",
  "D",
  "D-",
  "F",
  "Pass",
  "Fail",
  "Withdrew",
  "Incomplete",
  "Not Applicable",
];

export default function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [course, setCourse] = useState<{
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
  } | null>(null);
  const [professors, setProfessors] = useState<
    Array<{ id: string; name: string; department: string | null }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const [rating, setRating] = useState(0);
  const [difficulty, setDifficulty] = useState(0);
  const [workload, setWorkload] = useState(0);
  const [grade, setGrade] = useState("");
  const [wouldTakeAgain, setWouldTakeAgain] = useState<boolean | null>(null);
  const [tips, setTips] = useState("");
  const [semester, setSemester] = useState("");
  const [content, setContent] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(true);
  const [authorName, setAuthorName] = useState("");
  const [professorId, setProfessorId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  useEffect(() => {
    loadCourse();
    loadProfessors();
  }, [id]);

  async function loadCourse() {
    setIsLoading(true);
    const result = await getCourseById(id);
    if (result.success && result.data) {
      setCourse(result.data);
    } else {
      setError(result.error || "Course not found");
    }
    setIsLoading(false);
  }

  async function loadProfessors() {
    const result = await getProfessors();
    if (result.success && result.data) {
      setProfessors(result.data.professors);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    const result = await submitCourseReview({
      courseId: id,
      professorId: professorId || undefined,
      rating,
      difficulty: difficulty || undefined,
      workload: workload || undefined,
      content: content || undefined,
      grade: grade || undefined,
      wouldTakeAgain: wouldTakeAgain ?? undefined,
      tips: tips || undefined,
      semester: semester || undefined,
      isAnonymous,
      authorName: !isAnonymous ? authorName : undefined,
    });

    if (result.success) {
      setSubmitSuccess("Your review has been submitted!");
      setRating(0);
      setDifficulty(0);
      setWorkload(0);
      setGrade("");
      setWouldTakeAgain(null);
      setTips("");
      setSemester("");
      setContent("");
      setProfessorId("");
      loadCourse();
      setTimeout(() => setSubmitSuccess(""), 5000);
    } else {
      setSubmitError(result.error || "Failed to submit review");
    }

    setIsSubmitting(false);
  }

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="mb-6 h-6 w-24 animate-pulse rounded bg-gray-200" />
        <div className="mb-4 h-8 w-64 animate-pulse rounded bg-gray-200" />
        <div className="mb-8 h-5 w-48 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="py-6">
                <div className="h-8 w-16 animate-pulse rounded bg-gray-200" />
                <div className="mt-2 h-4 w-24 animate-pulse rounded bg-gray-200" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8">
        <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-blue-600 hover:underline">
          <ArrowLeft className="h-4 w-4" />
          Back to courses
        </Link>
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-red-600">{error || "Course not found"}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="mb-8">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-900">{course.code}</h1>
          {course.department && (
            <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
              {course.department}
            </span>
          )}
        </div>
        <p className="mt-1 text-lg text-gray-600">{course.name}</p>
      </div>

      <div className="mb-8 grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Star className="h-6 w-6 fill-yellow-400 text-yellow-400" />
              <span className="text-2xl font-bold text-gray-900">
                {course.avgRating?.toFixed(1) ?? "N/A"}
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
                {course.avgDifficulty?.toFixed(1) ?? "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Difficulty</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <Clock className="h-6 w-6 text-blue-500" />
              <span className="text-2xl font-bold text-gray-900">
                {course.avgWorkload?.toFixed(1) ?? "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Workload</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="py-6 text-center">
            <div className="flex items-center justify-center gap-2">
              <ThumbsUp className="h-6 w-6 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">
                {course.wouldTakeAgainPercent !== null
                  ? `${course.wouldTakeAgainPercent}%`
                  : "N/A"}
              </span>
            </div>
            <p className="mt-1 text-sm text-gray-500">Would Take Again</p>
          </CardContent>
        </Card>
      </div>

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Submit a Review</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <InteractiveStarRating
              value={rating}
              onChange={setRating}
              label="Overall Rating *"
            />

            <div className="grid gap-6 md:grid-cols-2">
              <DifficultySelector
                value={difficulty}
                onChange={setDifficulty}
                label="Difficulty"
              />
              <DifficultySelector
                value={workload}
                onChange={setWorkload}
                label="Workload"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Select
                label="Professor (Optional)"
                value={professorId}
                onChange={(e) => setProfessorId(e.target.value)}
              >
                <option value="">Select professor...</option>
                {professors.map((prof) => (
                  <option key={prof.id} value={prof.id}>
                    {prof.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Grade Received"
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
              >
                {GRADE_OPTIONS.map((g) => (
                  <option key={g} value={g}>
                    {g || "Select grade..."}
                  </option>
                ))}
              </Select>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Input
                label="Semester (e.g., Fall 2024)"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                placeholder="When did you take this course?"
              />

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                  Would you take this course again?
                </label>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setWouldTakeAgain(true)}
                    className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition-all ${
                      wouldTakeAgain === true
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    type="button"
                    onClick={() => setWouldTakeAgain(false)}
                    className={`flex-1 rounded-lg border-2 px-4 py-2 font-medium transition-all ${
                      wouldTakeAgain === false
                        ? "border-red-500 bg-red-50 text-red-700"
                        : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            <Textarea
              label="Your Review"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Share your experience with this course..."
              className="min-h-[120px]"
            />

            <Textarea
              label="Tips for Future Students"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              placeholder="Any advice for students taking this course?"
              className="min-h-[80px]"
            />

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={isAnonymous}
                  onChange={(e) => setIsAnonymous(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Post anonymously</span>
              </label>
            </div>

            {!isAnonymous && (
              <Input
                label="Your Name"
                value={authorName}
                onChange={(e) => setAuthorName(e.target.value)}
                placeholder="Enter your name"
              />
            )}

            {submitError && (
              <div className="rounded-lg bg-red-50 p-4 text-red-700">
                {submitError}
              </div>
            )}

            {submitSuccess && (
              <div className="rounded-lg bg-green-50 p-4 text-green-700">
                {submitSuccess}
              </div>
            )}

            <Button type="submit" disabled={isSubmitting || rating === 0}>
              {isSubmitting ? "Submitting..." : "Submit Review"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <div>
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Reviews ({course.reviews.length})
        </h2>

        {course.reviews.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-gray-500">No reviews yet. Be the first to review!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {course.reviews.map((review) => (
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

                  <div className="mb-4 flex flex-wrap gap-4 text-sm">
                    {review.professor && (
                      <Link
                        href={`/courses/professors/${review.professor.id}`}
                        className="text-blue-600 hover:underline"
                      >
                        Prof. {review.professor.name}
                      </Link>
                    )}
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
