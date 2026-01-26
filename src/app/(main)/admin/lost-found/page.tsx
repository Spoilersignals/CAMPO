import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Phone, ExternalLink } from "lucide-react";

export default async function LostFoundAdminPage() {
  const items = await prisma.lostFoundItem.findMany({
    include: {
      reporter: { select: { id: true, name: true, email: true } },
      photos: { orderBy: { sortOrder: "asc" }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const statusVariant: Record<string, "success" | "default" | "warning" | "error"> = {
    ACTIVE: "success",
    RESOLVED: "default",
    PENDING: "warning",
    REJECTED: "error",
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Lost & Found</h1>
        <p className="text-gray-500">
          View and moderate lost & found posts (FREE feature - no approval needed)
        </p>
      </div>

      {items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No lost & found items</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{item.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      by {item.reporter.name || item.reporter.email} •{" "}
                      {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Badge variant={item.type === "LOST" ? "error" : "success"}>
                      {item.type}
                    </Badge>
                    <Badge variant={statusVariant[item.status] || "default"}>
                      {item.status}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {item.photos[0] && (
                      <img
                        src={item.photos[0].url}
                        alt={item.title}
                        className="h-48 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-600">
                      {item.description || "No description"}
                    </p>
                    {item.locationDetails && (
                      <div className="flex items-center gap-1 text-sm">
                        <MapPin className="h-4 w-4 text-gray-400" />
                        <span>{item.locationDetails}</span>
                      </div>
                    )}
                    {item.location && (
                      <div className="text-sm text-gray-500">
                        Area: {item.location}
                      </div>
                    )}
                    {item.contactPhone && (
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-4 w-4 text-gray-400" />
                        <span>{item.contactName || "Contact"}: {item.contactPhone}</span>
                      </div>
                    )}
                    {item.occurredAt && (
                      <div className="text-sm">
                        <span className="text-gray-500">Date:</span>{" "}
                        <span className="font-medium">
                          {new Date(item.occurredAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                <div className="mt-4">
                  <Link href={`/lost-found/${item.id}`}>
                    <Button variant="outline" size="sm">
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
