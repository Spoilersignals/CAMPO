"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ArrowLeft, Upload, X, Info, DollarSign, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import {
  CONDITIONS,
  DELIVERY_METHODS,
  COMMISSION_RATE,
  MAX_FILE_SIZE,
  ACCEPTED_IMAGE_TYPES,
} from "@/lib/constants";
import { createListingAction, getCategories } from "@/actions/listings";

const sellFormSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.number().min(0.01, "Price must be greater than 0"),
  categoryId: z.string().min(1, "Category is required"),
  condition: z.enum(["New", "Used"]),
  usageDuration: z.string().optional(),
  deliveryMethod: z.enum(["Pickup", "Delivery", "Both"]),
  pickupLocation: z.string().optional(),
  location: z.string().min(3, "Please specify where you're located (e.g., campus, hostel name)"),
}).refine((data) => {
  if (data.condition === "Used" && !data.usageDuration) {
    return false;
  }
  return true;
}, {
  message: "Please specify how long you have used this item",
  path: ["usageDuration"],
});

type SellFormValues = z.infer<typeof sellFormSchema>;

interface Category {
  id: string;
  name: string;
  parentId: string | null;
  parent: { name: string } | null;
}

export default function NewListingPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photosPreviews, setPhotosPreviews] = useState<string[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);

  useEffect(() => {
    getCategories().then(setCategories);
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SellFormValues>({
    resolver: zodResolver(sellFormSchema),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categoryId: "",
      condition: "New",
      deliveryMethod: "Pickup",
      location: "",
    },
  });

  const price = watch("price") || 0;
  const condition = watch("condition");
  const deliveryMethod = watch("deliveryMethod");
  const commission = Math.round(price * COMMISSION_RATE * 100) / 100;

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) return false;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false;
      return true;
    });

    setPhotos((prev) => [...prev, ...validFiles]);
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => prev.filter((_, i) => i !== index));
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = async (data: SellFormValues) => {
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
          href="/sell"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sell
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <Input
              label="Title"
              placeholder="What are you selling?"
              error={errors.title?.message}
              {...register("title")}
            />

            <Textarea
              label="Description"
              placeholder="Describe your item in detail..."
              error={errors.description?.message}
              {...register("description")}
            />

            <Input
              label="Price ($)"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              error={errors.price?.message}
              {...register("price", { valueAsNumber: true })}
            />

            <div className="grid gap-4 sm:grid-cols-2">
              <Select
                label="Category"
                error={errors.categoryId?.message}
                {...register("categoryId")}
              >
                <option value="">Select a category</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parent ? `${cat.parent.name} > ` : ""}{cat.name}
                  </option>
                ))}
              </Select>

              <Select
                label="Condition"
                error={errors.condition?.message}
                {...register("condition")}
              >
                {CONDITIONS.map((cond) => (
                  <option key={cond} value={cond}>
                    {cond}
                  </option>
                ))}
              </Select>
            </div>

            {condition === "Used" && (
              <Input
                label="Usage Duration (Required for used items)"
                placeholder="e.g., 6 months, 2 years"
                error={errors.usageDuration?.message}
                {...register("usageDuration")}
              />
            )}

            <Select
              label="Delivery Method"
              error={errors.deliveryMethod?.message}
              {...register("deliveryMethod")}
            >
              {DELIVERY_METHODS.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>

                        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-amber-600 mt-0.5" />
                <div className="flex-1">
                  <label className="block text-sm font-medium text-amber-900 mb-2">
                    Your Location (Required)
                  </label>
                  <Input
                    placeholder="e.g., Main Campus, Hostel A, Library Area"
                    error={errors.location?.message}
                    {...register("location")}
                  />
                  <p className="mt-1 text-xs text-amber-700">
                    This helps buyers know where to meet you for the transaction
                  </p>
                </div>
              </div>
            </div>

            {(deliveryMethod === "Pickup" || deliveryMethod === "Both") && (
              <Input
                label="Specific Pickup Point (Optional)"
                placeholder="e.g., Campus Library entrance, Student Center cafe"
                error={errors.pickupLocation?.message}
                {...register("pickupLocation")}
              />
            )}

            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Photos
              </label>
              <div className="flex flex-wrap gap-3">
                {photosPreviews.map((preview, index) => (
                  <div
                    key={index}
                    className="relative h-24 w-24 overflow-hidden rounded-lg border border-gray-200"
                  >
                    <img
                      src={preview}
                      alt={`Photo ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => removePhoto(index)}
                      className="absolute right-1 top-1 rounded-full bg-white/80 p-1 shadow-sm hover:bg-white"
                    >
                      <X className="h-4 w-4 text-gray-600" />
                    </button>
                  </div>
                ))}
                <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500">
                  <Upload className="h-6 w-6" />
                  <span className="text-xs">Add Photo</span>
                  <input
                    type="file"
                    accept={ACCEPTED_IMAGE_TYPES.join(",")}
                    multiple
                    onChange={handlePhotoUpload}
                    className="hidden"
                  />
                </label>
              </div>
              <p className="text-xs text-gray-500">
                Max {MAX_FILE_SIZE / 1024 / 1024}MB per image. Accepted formats:
                JPEG, PNG, WebP
              </p>
            </div>

            {price > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-blue-100 p-2">
                      <DollarSign className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-blue-900">
                        Commission Fee
                      </h4>
                      <p className="mt-1 text-sm text-blue-700">
                        A {COMMISSION_RATE * 100}% commission of{" "}
                        <span className="font-semibold">
                          ${commission.toFixed(2)}
                        </span>{" "}
                        will be required before your listing goes live.
                      </p>
                      <div className="mt-2 flex items-center gap-1 text-xs text-blue-600">
                        <Info className="h-3 w-3" />
                        <span>
                          You&apos;ll pay this after submitting your listing
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating Listing..." : "Create Listing & Pay Commission"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
