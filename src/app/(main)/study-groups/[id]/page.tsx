import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, BookOpen, MapPin, Calendar, Users, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getStudyGroupById, joinStudyGroup, leaveStudyGroup, updateStudyGroupStatus } from "@/actions/study-groups";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

interface StudyGroupDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "default",
};

export default async function StudyGroupDetailPage({ params }: StudyGroupDetailPageProps) {
  const { id } = await params;
  const [result, session] = await Promise.all([
    getStudyGroupById(id),
    auth(),
  ]);

  if (!result.success || !result.data) {
    notFound();
  }

  const group = result.data as {
    id: string;
    courseCode: string;
    courseName: string | null;
    topic: string | null;
    location: string | null;
    meetingTime: Date | null;
    maxMembers: number | null;
    description: string | null;
    contactInfo: string;
    status: string;
    userId: string;
    createdAt: Date;
    user: { id: string; name: string | null; email: string; image: string | null };
    members: { id: string; userId: string; user: { id: string; name: string | null; image: string | null } }[];
  };

  const isOwner = session?.user?.id === group.userId;
  const isMember = group.members.some((m) => m.userId === session?.user?.id);
  const memberCount = group.members.length;

  const handleJoin = async () => {
    "use server";
    await joinStudyGroup(id);
  };

  const handleLeave = async () => {
    "use server";
    await leaveStudyGroup(id);
  };

  const handleStatusUpdate = async (formData: FormData) => {
    "use server";
    const status = formData.get("status") as "OPEN" | "FULL" | "CLOSED";
    await updateStudyGroupStatus(id, status);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/study-groups"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Groups
      </Link>

      <Card className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <BookOpen className="h-6 w-6 text-blue-600" />
                <h1 className="text-2xl font-bold text-gray-900">{group.courseCode}</h1>
              </div>
              <Badge variant={statusVariant[group.status] || "default"}>
                {group.status}
              </Badge>
            </div>
            {group.courseName && (
              <p className="text-lg text-gray-600">{group.courseName}</p>
            )}
          </div>

          {isOwner && (
            <form action={handleStatusUpdate} className="flex gap-2">
              <select
                name="status"
                defaultValue={group.status}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="OPEN">Open</option>
                <option value="FULL">Full</option>
                <option value="CLOSED">Closed</option>
              </select>
              <Button type="submit" size="sm">
                Update
              </Button>
            </form>
          )}
        </div>

        {group.topic && (
          <div className="mb-6">
            <h2 className="mb-1 text-sm font-medium text-gray-500">Topic</h2>
            <p className="text-gray-900">{group.topic}</p>
          </div>
        )}

        <div className="mb-6 grid gap-4 sm:grid-cols-2">
          {group.location && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <MapPin className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Location</p>
                <p className="font-medium text-gray-900">{group.location}</p>
              </div>
            </div>
          )}

          {group.meetingTime && (
            <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-sm text-gray-500">Meeting Time</p>
                <p className="font-medium text-gray-900">
                  {format(new Date(group.meetingTime), "EEEE, MMMM d, yyyy 'at' h:mm a")}
                </p>
              </div>
            </div>
          )}

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <Users className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Members</p>
              <p className="font-medium text-gray-900">
                {memberCount}
                {group.maxMembers ? ` / ${group.maxMembers}` : ""} members
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-lg bg-gray-50 p-4">
            <MessageCircle className="h-5 w-5 text-gray-500" />
            <div>
              <p className="text-sm text-gray-500">Contact Info</p>
              <p className="font-medium text-gray-900 break-all">{group.contactInfo}</p>
            </div>
          </div>
        </div>

        {group.description && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
            <p className="whitespace-pre-wrap text-gray-700">{group.description}</p>
          </div>
        )}

        <div className="border-t border-gray-200 pt-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Created by</p>
              <p className="font-medium text-gray-900">
                {isOwner ? "You" : group.user.name || "Anonymous"}
              </p>
              <p className="text-xs text-gray-500">
                {format(new Date(group.createdAt), "MMM d, yyyy")}
              </p>
            </div>

            {session?.user && !isOwner && (
              <div>
                {isMember ? (
                  <form action={handleLeave}>
                    <Button type="submit" variant="destructive">
                      Leave Group
                    </Button>
                  </form>
                ) : (
                  group.status === "OPEN" && (
                    <form action={handleJoin}>
                      <Button type="submit">
                        Join Group
                      </Button>
                    </form>
                  )
                )}
              </div>
            )}

            {!session?.user && (
              <Link href={`/login?callbackUrl=/study-groups/${id}`}>
                <Button>
                  Sign in to Join
                </Button>
              </Link>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
