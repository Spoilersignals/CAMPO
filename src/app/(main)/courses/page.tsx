"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star, BookOpen, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getCourses } from "@/actions/courses";

function StarRating({ rating, size = "sm" }: { rating: number | null; size?: "sm" | "md" }) {
  const stars = [];
  const fullStars = rating ? Math.floor(rating) : 0;
  const hasHalfStar = rating ? rating % 1 >= 0.5 : false;
  const starSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

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

export default function CoursesPage() {
  const [search, setSearch] = useState("");
  const [courses, setCourses] = useState<
    Array<{
      id: string;
      code: string;
      name: string;
      department: string | null;
      reviewCount: number;
      avgRating: number | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadCourses();
  }, []);

  async function loadCourses() {
    setIsLoading(true);
    const result = await getCourses();
    if (result.success && result.data) {
      setCourses(result.data.courses);
    }
    setIsLoading(false);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    const result = await getCourses(search);
    if (result.success && result.data) {
      setCourses(result.data.courses);
    }
    setIsLoading(false);
  }

  const filteredCourses = courses.filter(
    (course) =>
      course.code.toLowerCase().includes(search.toLowerCase()) ||
      course.name.toLowerCase().includes(search.toLowerCase()) ||
      (course.department?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Course Reviews</h1>
        <p className="text-gray-600">Find and review courses at your campus</p>
      </div>

      <div className="mb-6 flex gap-4">
        <Link href="/courses/professors">
          <Button variant="outline" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Browse Professors
          </Button>
        </Link>
      </div>

      <form onSubmit={handleSearch} className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search courses by code, name, or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </form>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2">
                      <div className="h-5 w-24 rounded bg-gray-200" />
                      <div className="h-4 w-48 rounded bg-gray-200" />
                      <div className="h-3 w-32 rounded bg-gray-200" />
                    </div>
                    <div className="text-right">
                      <div className="h-5 w-24 rounded bg-gray-200" />
                      <div className="mt-1 h-3 w-16 rounded bg-gray-200" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No courses found</p>
              <p className="mt-2 text-sm text-gray-400">
                Try a different search term
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Link key={course.id} href={`/courses/${course.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-blue-600">
                          {course.code}
                        </span>
                        {course.department && (
                          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
                            {course.department}
                          </span>
                        )}
                      </div>
                      <h3 className="mt-1 font-medium text-gray-900">
                        {course.name}
                      </h3>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <StarRating rating={course.avgRating} />
                        {course.avgRating && (
                          <span className="font-medium text-gray-900">
                            {course.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {course.reviewCount} {course.reviewCount === 1 ? "review" : "reviews"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
