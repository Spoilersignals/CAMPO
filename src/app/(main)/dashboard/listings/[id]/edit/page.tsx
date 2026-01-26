import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EditListingForm } from "./edit-form";

async function getListing(id: string, userId: string) {
  const listing = await prisma.listing.findUnique({
    where: { id },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      category: true,
    },
  });

  if (!listing || listing.sellerId !== userId) {
    return null;
  }

  return listing;
}

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { id } = await params;
  const listing = await getListing(id, session.user.id);

  if (!listing) {
    notFound();
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to listings
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Listing</CardTitle>
        </CardHeader>
        <CardContent>
          <EditListingForm
            listingId={listing.id}
            defaultValues={{
              title: listing.title,
              description: listing.description || "",
              price: listing.price,
              categoryId: listing.category.id,
              condition: listing.condition as any,
              deliveryMethod: listing.deliveryMethod as any,
              usageDuration: listing.usageDuration || undefined,
              pickupLocation: listing.pickupLocation || undefined,
            }}
            existingImages={listing.photos.map((p: typeof listing.photos[number]) => p.url)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
