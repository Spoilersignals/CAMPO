"use client";

import Link from "next/link";
import { SuggestionCard } from "./suggestion-card";

interface Suggestion {
  id: string;
  title: string;
  description?: string | null;
  budget?: number | null;
  condition?: string | null;
  category: {
    name: string;
  };
  requester?: {
    name?: string | null;
    isVerified?: boolean;
  } | null;
  guestName?: string | null;
  status: string;
  createdAt: Date;
}

interface SuggestionListProps {
  suggestions: Suggestion[];
  currentPage: number;
  totalPages: number;
  searchParams?: {
    search?: string;
    category?: string;
  };
}

export function SuggestionList({
  suggestions,
  currentPage,
  totalPages,
  searchParams,
}: SuggestionListProps) {
  if (suggestions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
        <p className="mb-4 text-lg text-gray-500">No suggestions found</p>
        <Link
          href="/suggestions/new"
          className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Make the first suggestion
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {suggestions.map((suggestion) => (
          <SuggestionCard
            key={suggestion.id}
            id={suggestion.id}
            title={suggestion.title}
            description={suggestion.description}
            budget={suggestion.budget}
            condition={suggestion.condition}
            category={suggestion.category}
            requester={suggestion.requester}
            guestName={suggestion.guestName}
            status={suggestion.status}
            createdAt={suggestion.createdAt}
          />
        ))}
      </div>

      {totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/suggestions?page=${p}${searchParams?.search ? `&search=${searchParams.search}` : ""}${searchParams?.category ? `&category=${searchParams.category}` : ""}`}
              className={`rounded-lg px-4 py-2 ${
                p === currentPage
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
