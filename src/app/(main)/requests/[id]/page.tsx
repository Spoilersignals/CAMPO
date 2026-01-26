import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, DollarSign, Tag, Pencil, Trash2, BadgeCheck, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getItemRequest, deleteItemRequest } from "@/actions/requests";
import { auth } from "@/lib/auth";
import { formatDistanceToNow, format } from "date-fns";

interface RequestDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "success" | "default" | "warning"> = {
  OPEN: "success",
  FULFILLED: "default",
  CLOSED: "warning",
};

export default async function RequestDetailPage({ params }: RequestDetailPageProps) {
  const { id } = await params;
  const [request, session] = await Promise.all([
    getItemRequest(id),
    auth(),
  ]);

  if (!request) {
    notFound();
  }

  const isOwner = session?.user?.id === request.requesterId;

  const handleDelete = async () => {
    "use server";
    await deleteItemRequest(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/requests"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <Card className="p-6">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <div className="mb-2 flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{request.title}</h1>
              <Badge variant={statusVariant[request.status] || "default"}>
                {request.status}
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                {format(new Date(request.createdAt), "MMM d, yyyy")}
              </span>
              <span className="flex items-center gap-1">
                <Tag className="h-4 w-4" />
                {request.category.name}
              </span>
            </div>
          </div>

          {isOwner && (
            <div className="flex gap-2">
              <Link href={`/requests/${id}/edit`}>
                <Button variant="outline" size="sm">
                  <Pencil className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <form action={handleDelete}>
                <Button variant="destructive" size="sm" type="submit">
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete
                </Button>
              </form>
            </div>
          )}
        </div>

        {request.budget && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-blue-700">
            <DollarSign className="h-5 w-5" />
            <span className="font-semibold">Budget: ${request.budget.toFixed(2)}</span>
          </div>
        )}

        {request.condition && (
          <div className="mb-6">
            <span className="text-sm text-gray-500">Preferred Condition: </span>
            <Badge>{request.condition}</Badge>
          </div>
        )}

        {request.description && (
          <div className="mb-6">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
            <p className="whitespace-pre-wrap text-gray-700">{request.description}</p>
          </div>
        )}

        {request.requester && (
          <div className="border-t border-gray-200 pt-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Posted by</h2>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                  {request.requester.name?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900">
                      {request.requester.name || "Anonymous"}
                    </span>
                    {request.requester.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-sm text-gray-500">
                    Member since {format(new Date(request.requester.createdAt), "MMM yyyy")}
                  </p>
                </div>
              </div>

              {!isOwner && session?.user && (
                <Link href={`mailto:${request.requester.email}`}>
                  <Button>
                    <Mail className="mr-2 h-4 w-4" />
                    Contact
                  </Button>
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
