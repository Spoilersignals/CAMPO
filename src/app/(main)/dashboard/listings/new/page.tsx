"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ListingForm } from "@/components/listings/listing-form";
import { createListingAction } from "@/actions/listings";

export default function NewListingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    data: {
      title: string;
      description: string;
      price: number;
      categoryId: string;
      condition: string;
      deliveryMethod: string;
      usageDuration?: string;
      pickupLocation?: string;
    },
    photos: File[]
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const imageUrls = photos.length > 0
        ? photos.map((_, index) => `/placeholder-${index + 1}.jpg`)
        : ["/placeholder.jpg"];

      const formData = new FormData();
      formData.set("title", data.title);
      formData.set("description", data.description);
      formData.set("price", data.price.toString());
      formData.set("categoryId", data.categoryId);
      formData.set("condition", data.condition);
      formData.set("deliveryMethod", data.deliveryMethod);
      formData.set("images", JSON.stringify(imageUrls));
      if (data.usageDuration) formData.set("usageDuration", data.usageDuration);
      if (data.pickupLocation) formData.set("pickupLocation", data.pickupLocation);

      const result = await createListingAction(formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to create listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

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
          <CardTitle>Create New Listing</CardTitle>
          <CardDescription>
            Fill in the details below to list your item for sale
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
              {error}
            </div>
          )}
          <ListingForm onSubmit={handleSubmit} isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
}
