import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, MessageCircle, Heart, Clock, Share2, Trash2, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { getMyStories } from "@/actions/confessions";
import { formatRelativeTime } from "@/lib/utils";
import { MyStoriesClient } from "./my-stories-client";

export default async function MyStoriesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/confessions/my-stories");
  }

  const result = await getMyStories();
  const stories = result.data?.stories || [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/confessions"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Confessions
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Stories</h1>
        <p className="text-gray-600">View counts and stats for confessions you received</p>
      </div>

      {stories.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="mx-auto mb-4 h-12 w-12 text-gray-300" />
            <p className="mb-2 text-gray-500">No confession stories yet</p>
            <p className="text-sm text-gray-400">
              Share your personal link to receive anonymous confessions
            </p>
            <Link href="/confessions/my-link" className="mt-4 inline-block">
              <Button variant="outline">Get My Link</Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <MyStoriesClient stories={stories} />
      )}
    </div>
  );
}
