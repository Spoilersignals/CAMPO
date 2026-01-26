"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, Star, Users, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProfessors } from "@/actions/courses";

function StarRating({ rating }: { rating: number | null }) {
  const stars = [];
  const fullStars = rating ? Math.floor(rating) : 0;
  const hasHalfStar = rating ? rating % 1 >= 0.5 : false;

  for (let i = 1; i <= 5; i++) {
    if (i <= fullStars) {
      stars.push(
        <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
      );
    } else if (i === fullStars + 1 && hasHalfStar) {
      stars.push(
        <div key={i} className="relative">
          <Star className="h-4 w-4 text-gray-300" />
          <div className="absolute inset-0 overflow-hidden" style={{ width: "50%" }}>
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          </div>
        </div>
      );
    } else {
      stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
    }
  }

  return <div className="flex items-center gap-0.5">{stars}</div>;
}

export default function ProfessorsPage() {
  const [search, setSearch] = useState("");
  const [professors, setProfessors] = useState<
    Array<{
      id: string;
      name: string;
      department: string | null;
      reviewCount: number;
      avgRating: number | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadProfessors();
  }, []);

  async function loadProfessors() {
    setIsLoading(true);
    const result = await getProfessors();
    if (result.success && result.data) {
      setProfessors(result.data.professors);
    }
    setIsLoading(false);
  }

  const filteredProfessors = professors.filter(
    (professor) =>
      professor.name.toLowerCase().includes(search.toLowerCase()) ||
      (professor.department?.toLowerCase().includes(search.toLowerCase()) ?? false)
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link href="/courses" className="mb-6 inline-flex items-center gap-1 text-blue-600 hover:underline">
        <ArrowLeft className="h-4 w-4" />
        Back to courses
      </Link>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Professors</h1>
        <p className="text-gray-600">Browse and review professors at your campus</p>
      </div>

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Search professors by name or department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-gray-200" />
                      <div className="space-y-2">
                        <div className="h-5 w-40 rounded bg-gray-200" />
                        <div className="h-4 w-24 rounded bg-gray-200" />
                      </div>
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
        ) : filteredProfessors.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="mx-auto mb-4 h-12 w-12 text-gray-400" />
              <p className="text-gray-500">No professors found</p>
              <p className="mt-2 text-sm text-gray-400">
                Try a different search term
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredProfessors.map((professor) => (
            <Link key={professor.id} href={`/courses/professors/${professor.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 text-lg font-semibold text-blue-600">
                        {professor.name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .slice(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {professor.name}
                        </h3>
                        {professor.department && (
                          <span className="text-sm text-gray-500">
                            {professor.department}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="flex items-center gap-2">
                        <StarRating rating={professor.avgRating} />
                        {professor.avgRating && (
                          <span className="font-medium text-gray-900">
                            {professor.avgRating.toFixed(1)}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        {professor.reviewCount} {professor.reviewCount === 1 ? "review" : "reviews"}
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
