"use client";

import { useState } from "react";
import { ListingForm } from "@/components/listings/listing-form";
import { updateListingAction } from "@/actions/listings";

interface EditListingFormProps {
  listingId: string;
  defaultValues: {
    title: string;
    description: string;
    price: number;
    categoryId: string;
    condition: string;
    deliveryMethod: string;
    usageDuration?: string;
    pickupLocation?: string;
  };
  existingImages: string[];
}

export function EditListingForm({
  listingId,
  defaultValues,
  existingImages,
}: EditListingFormProps) {
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
      const newImageUrls = photos.map((_, index) => `/placeholder-new-${index}.jpg`);
      const allImages = [...existingImages, ...newImageUrls];

      const formData = new FormData();
      formData.set("title", data.title);
      formData.set("description", data.description);
      formData.set("price", data.price.toString());
      formData.set("categoryId", data.categoryId);
      formData.set("condition", data.condition);
      formData.set("deliveryMethod", data.deliveryMethod);
      formData.set("images", JSON.stringify(allImages.length > 0 ? allImages : ["/placeholder.jpg"]));
      if (data.usageDuration) formData.set("usageDuration", data.usageDuration);
      if (data.pickupLocation) formData.set("pickupLocation", data.pickupLocation);

      const result = await updateListingAction(listingId, formData);
      if (result?.error) {
        setError(result.error);
      }
    } catch (err) {
      setError("Failed to update listing. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}
      <ListingForm
        defaultValues={defaultValues as any}
        existingImages={existingImages}
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
      />
    </>
  );
}
