import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, BookOpen, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getMyStudyGroups } from "@/actions/study-groups";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "default",
};

type StudyGroup = {
  id: string;
  courseCode: string;
  courseName: string | null;
  topic: string | null;
  location: string | null;
  meetingTime: Date | null;
  maxMembers: number | null;
  status: string;
  _count: { members: number };
  user?: { id: string; name: string | null; image: string | null };
};

export default async function MyStudyGroupsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/study-groups/my-groups");
  }

  const result = await getMyStudyGroups();

  if (!result.success) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <p className="text-red-600">Failed to load your study groups</p>
      </div>
    );
  }

  const { created, joined } = result.data as {
    created: StudyGroup[];
    joined: StudyGroup[];
  };

  function GroupCard({ group, showOwner = false }: { group: StudyGroup; showOwner?: boolean }) {
    return (
      <Link href={`/study-groups/${group.id}`}>
        <Card className="h-full p-5 transition-shadow hover:shadow-md">
          <div className="mb-3 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-blue-600" />
              <span className="font-semibold text-blue-600">{group.courseCode}</span>
            </div>
            <Badge variant={statusVariant[group.status] || "default"}>
              {group.status}
            </Badge>
          </div>

          {group.courseName && (
            <h3 className="mb-2 font-medium text-gray-900">{group.courseName}</h3>
          )}

          {group.topic && (
            <p className="mb-3 text-sm text-gray-600 line-clamp-2">{group.topic}</p>
          )}

          <div className="space-y-2 text-sm text-gray-500">
            {group.location && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>{group.location}</span>
              </div>
            )}

            {group.meetingTime && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                <span>{format(new Date(group.meetingTime), "MMM d, yyyy 'at' h:mm a")}</span>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>
                {group._count.members}
                {group.maxMembers ? ` / ${group.maxMembers}` : ""} members
              </span>
            </div>

            {showOwner && group.user && (
              <p className="text-xs text-gray-400">
                Created by {group.user.name || "Anonymous"}
              </p>
            )}
          </div>
        </Card>
      </Link>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/study-groups"
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Study Groups</h1>
            <p className="text-gray-600">Groups you created or joined</p>
          </div>
        </div>
        <Link href="/study-groups/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Groups You Created ({created.length})
        </h2>
        {created.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
            <p className="text-gray-500">You haven&apos;t created any groups yet</p>
            <Link href="/study-groups/new" className="mt-2 inline-block text-blue-600 hover:underline">
              Create your first group
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {created.map((group) => (
              <GroupCard key={group.id} group={group} />
            ))}
          </div>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          Groups You Joined ({joined.length})
        </h2>
        {joined.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-gray-200 py-8 text-center">
            <p className="text-gray-500">You haven&apos;t joined any groups yet</p>
            <Link href="/study-groups" className="mt-2 inline-block text-blue-600 hover:underline">
              Browse available groups
            </Link>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {joined.map((group) => (
              <GroupCard key={group.id} group={group} showOwner />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
