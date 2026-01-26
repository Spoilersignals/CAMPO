import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Calendar, MapPin, Trash2, BadgeCheck, Check, Search, Package, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { getLostFoundItem, deleteLostFoundItem, markAsResolved } from "@/actions/lost-found";
import { auth } from "@/lib/auth";
import { format } from "date-fns";

interface LostFoundDetailPageProps {
  params: Promise<{ id: string }>;
}

const statusVariant: Record<string, "success" | "default" | "warning"> = {
  ACTIVE: "success",
  RESOLVED: "default",
  PENDING: "warning",
};

export default async function LostFoundDetailPage({ params }: LostFoundDetailPageProps) {
  const { id } = await params;
  const [item, session] = await Promise.all([
    getLostFoundItem(id),
    auth(),
  ]);

  if (!item) {
    notFound();
  }

  const isOwner = session?.user?.id === item.reporterId;
  const TypeIcon = item.type === "LOST" ? Search : Package;

  const handleDelete = async () => {
    "use server";
    await deleteLostFoundItem(id);
  };

  const handleMarkResolved = async () => {
    "use server";
    await markAsResolved(id);
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <Link
        href="/lost-found"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lost & Found
      </Link>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {item.photos.length > 0 && (
            <div className="mb-6 overflow-hidden rounded-xl">
              <img
                src={item.photos[0].url}
                alt={item.title}
                className="h-auto w-full object-cover"
              />
              {item.photos.length > 1 && (
                <div className="mt-2 flex gap-2 overflow-x-auto">
                  {item.photos.slice(1).map((photo: typeof item.photos[number], index: number) => (
                    <img
                      key={photo.id}
                      src={photo.url}
                      alt={`${item.title} ${index + 2}`}
                      className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          <Card className="p-6">
            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    item.type === "LOST"
                      ? "bg-red-500 text-white"
                      : "bg-green-500 text-white"
                  }
                >
                  <TypeIcon className="mr-1 h-3 w-3" />
                  {item.type}
                </Badge>
                <Badge variant={statusVariant[item.status] || "default"}>
                  {item.status}
                </Badge>
              </div>

              {isOwner && (
                <div className="flex gap-2">
                  {item.status === "ACTIVE" && (
                    <form action={handleMarkResolved}>
                      <Button variant="outline" size="sm" type="submit">
                        <Check className="mr-2 h-4 w-4" />
                        Mark Resolved
                      </Button>
                    </form>
                  )}
                  <form action={handleDelete}>
                    <Button variant="destructive" size="sm" type="submit">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              )}
            </div>

            <h1 className="mb-4 text-2xl font-bold text-gray-900">{item.title}</h1>

            <div className="mb-6 flex flex-wrap gap-4 text-sm text-gray-500">
              {item.locationDetails && (
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  {item.locationDetails}
                </span>
              )}
              {item.location && (
                <span className="flex items-center gap-1 text-gray-400">
                  ({item.location})
                </span>
              )}
              {item.occurredAt && (
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(item.occurredAt), "MMM d, yyyy")}
                </span>
              )}
            </div>

            {item.description && (
              <div>
                <h2 className="mb-2 text-lg font-semibold text-gray-900">Description</h2>
                <p className="whitespace-pre-wrap text-gray-700">{item.description}</p>
              </div>
            )}
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              Contact Information
            </h2>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                  {(item.contactName || item.reporter.name)?.[0]?.toUpperCase() || "?"}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-medium text-gray-900">
                      {item.contactName || item.reporter.name || "Anonymous"}
                    </span>
                    {item.reporter.isVerified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500" />
                    )}
                  </div>
                  {item.contactPhone && (
                    <p className="text-sm text-gray-600">{item.contactPhone}</p>
                  )}
                </div>
              </div>

              {item.contactPhone && item.status === "ACTIVE" && (
                <div className="flex gap-2">
                  <a href={`tel:${item.contactPhone}`} className="flex-1">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      <Phone className="mr-2 h-4 w-4" />
                      Call
                    </Button>
                  </a>
                  <a 
                    href={`https://wa.me/${item.contactPhone.replace(/[^0-9]/g, '')}?text=Hi, I saw your ${item.type.toLowerCase()} item "${item.title}" on Campus Marketplace.`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700">
                      <MessageCircle className="mr-2 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </a>
                </div>
              )}
            </div>

            <p className="mt-4 text-xs text-gray-500">
              Posted {format(new Date(item.createdAt), "MMM d, yyyy 'at' h:mm a")}
            </p>
          </Card>

          <Card className="p-6">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">
              {item.type === "LOST" ? "Reported by" : "Found by"}
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-200 text-lg font-medium text-gray-600">
                {item.reporter.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-medium text-gray-900">
                    {item.reporter.name || "Anonymous"}
                  </span>
                  {item.reporter.isVerified && (
                    <BadgeCheck className="h-4 w-4 text-blue-500" />
                  )}
                </div>
                <p className="text-sm text-gray-500">
                  Member since {format(new Date(item.reporter.createdAt), "MMM yyyy")}
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
