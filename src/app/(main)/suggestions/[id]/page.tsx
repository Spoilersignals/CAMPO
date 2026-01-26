import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Tag, BadgeCheck, Mail, User, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getSuggestionAction, fulfillSuggestionAction, closeSuggestionAction } from "@/actions/requests";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

interface SuggestionDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "success" | "default" | "warning"> = {
  OPEN: "success",
  FULFILLED: "default",
  CLOSED: "warning",
};

export default async function SuggestionDetailPage({ params }: SuggestionDetailPageProps) {
  const { id } = await params;
  const [suggestion, session] = await Promise.all([
    getSuggestionAction(id),
    auth(),
  ]);

  if (!suggestion) {
    notFound();
  }

  const isOwner = session?.user?.id === suggestion.requesterId;
  const isLoggedIn = !!session?.user;
  const displayName = suggestion.requester?.name || suggestion.guestName || "Anonymous";
  const isVerified = suggestion.requester?.isVerified || false;

  const handleFulfill = async () => {
    "use server";
    await fulfillSuggestionAction(id);
  };

  const handleClose = async () => {
    "use server";
    await closeSuggestionAction(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/suggestions"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Suggestions
      </Link>

      <Card className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{suggestion.title}</h1>
              <Badge variant={statusVariant[suggestion.status] || "default"}>
                {suggestion.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(suggestion.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {suggestion.category.name}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {isLoggedIn && !isOwner && suggestion.status === "OPEN" && (
              <form action={handleFulfill}>
                <Button type="submit">
                  <ShoppingBag className="mr-2 h-4 w-4" />
                  I Have This Item
                </Button>
              </form>
            )}
            {isOwner && suggestion.status === "OPEN" && (
              <form action={handleClose}>
                <Button variant="outline" type="submit">
                  Close Suggestion
                </Button>
              </form>
            )}
          </div>
        </div>

        {suggestion.budget && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
            <DollarSign className="h-5 w-5" />
            <span className="font-semibold">Budget: ${suggestion.budget.toFixed(2)}</span>
          </div>
        )}

        {suggestion.condition && (
          <div className="mb-6">
            <span className="text-sm text-gray-500">Preferred Condition: </span>
            <Badge>{suggestion.condition}</Badge>
          </div>
        )}

        {suggestion.description && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
            <p className="whitespace-pre-wrap text-gray-700">{suggestion.description}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">Suggested by</h2>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                {suggestion.requester ? (
                  suggestion.requester.name?.[0]?.toUpperCase() || "?"
                ) : (
                  <User className="h-5 w-5" />
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900">{displayName}</span>
                  {isVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                  {!suggestion.requester && (
                    <span className="text-xs text-gray-400">(Guest)</span>
                  )}
                </div>
                {suggestion.requester?.createdAt && (
                  <p className="text-sm text-gray-500">
                    Member since {format(new Date(suggestion.requester.createdAt), "MMM yyyy")}
                  </p>
                )}
              </div>
            </div>

            {suggestion.guestEmail && !suggestion.requester && (
              <Link href={`mailto:${suggestion.guestEmail}`}>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </Link>
            )}

            {suggestion.requester?.email && isLoggedIn && !isOwner && (
              <Link href={`mailto:${suggestion.requester.email}`}>
                <Button variant="outline">
                  <Mail className="mr-2 h-4 w-4" />
                  Contact
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>

      {isLoggedIn && !isOwner && suggestion.status === "OPEN" && (
        <div className="mt-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="font-medium text-blue-900">Have this item?</h3>
          <p className="mt-1 text-sm text-blue-800">
            Click "I Have This Item" to create a listing pre-filled with details from this suggestion.
            The person who made this suggestion will be able to find your listing easily.
          </p>
        </div>
      )}
    </div>
  );
}
