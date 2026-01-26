import Link from "next/link";
import { Plus, Search, Users, BookOpen, MapPin, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getStudyGroups } from "@/actions/study-groups";
import { format } from "date-fns";

interface StudyGroupsPageProps {
  searchParams: Promise<{
    courseCode?: string;
    status?: string;
  }>;
}

const statusVariant: Record<string, "success" | "warning" | "default"> = {
  OPEN: "success",
  FULL: "warning",
  CLOSED: "default",
};

export default async function StudyGroupsPage({ searchParams }: StudyGroupsPageProps) {
  const params = await searchParams;
  const statusFilter = params.status || "";

  const result = await getStudyGroups({
    courseCode: params.courseCode,
    status: statusFilter || undefined,
  });

  const groups = result.success ? (result.data as StudyGroup[]) : [];

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
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Study Groups</h1>
          <p className="text-gray-600">Find or create study groups for your courses</p>
        </div>
        <div className="flex gap-2">
          <Link href="/study-groups/my-groups">
            <Button variant="outline">
              <Users className="mr-2 h-4 w-4" />
              My Groups
            </Button>
          </Link>
          <Link href="/study-groups/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Group
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row">
        <form className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            name="courseCode"
            defaultValue={params.courseCode}
            placeholder="Search by course code..."
            className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          {statusFilter && <input type="hidden" name="status" value={statusFilter} />}
        </form>

        <div className="flex rounded-lg border border-gray-200 p-1">
          <Link
            href={`/study-groups${params.courseCode ? `?courseCode=${params.courseCode}` : ""}`}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              !statusFilter
                ? "bg-blue-600 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            All
          </Link>
          <Link
            href={`/study-groups?status=OPEN${params.courseCode ? `&courseCode=${params.courseCode}` : ""}`}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "OPEN"
                ? "bg-green-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Open
          </Link>
          <Link
            href={`/study-groups?status=FULL${params.courseCode ? `&courseCode=${params.courseCode}` : ""}`}
            className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
              statusFilter === "FULL"
                ? "bg-yellow-500 text-white"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Full
          </Link>
        </div>
      </div>

      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 py-16">
          <p className="mb-4 text-lg text-gray-500">No study groups found</p>
          <Link href="/study-groups/new">
            <Button>Create the first group</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {groups.map((group) => (
            <Link key={group.id} href={`/study-groups/${group.id}`}>
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
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
