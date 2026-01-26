"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { MAX_FILE_SIZE, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";

interface LostFoundFormProps {
  defaultValues?: {
    type?: "LOST" | "FOUND";
    title?: string;
    description?: string | null;
    location?: string | null;
    locationDetails?: string | null;
    contactPhone?: string | null;
    contactName?: string | null;
    occurredAt?: Date | null;
    status?: string;
  };
  userName?: string | null;
  userPhone?: string | null;
  action: (formData: FormData) => void;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  isEdit?: boolean;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : isEdit ? "Update Report" : "Submit Report"}
    </Button>
  );
}

export function LostFoundForm({
  defaultValues,
  userName,
  userPhone,
  action,
  error,
  fieldErrors,
  isEdit = false,
}: LostFoundFormProps) {
  const [photosPreviews, setPhotosPreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles = files.filter((file) => {
      if (file.size > MAX_FILE_SIZE) return false;
      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return false;
      return true;
    });

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotosPreviews((prev) => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const removePhoto = (index: number) => {
    setPhotosPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const formatDate = (date: Date | null | undefined) => {
    if (!date) return "";
    return new Date(date).toISOString().split("T")[0];
  };

  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isEdit && (
        <div className="flex gap-4">
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-gray-200 p-4 transition-colors has-[:checked]:border-red-500 has-[:checked]:bg-red-50">
            <input
              type="radio"
              name="type"
              value="LOST"
              defaultChecked={defaultValues?.type === "LOST"}
              className="sr-only"
              required
            />
            <span className="font-medium text-gray-700">I Lost Something</span>
          </label>
          <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-lg border-2 border-gray-200 p-4 transition-colors has-[:checked]:border-green-500 has-[:checked]:bg-green-50">
            <input
              type="radio"
              name="type"
              value="FOUND"
              defaultChecked={defaultValues?.type === "FOUND"}
              className="sr-only"
            />
            <span className="font-medium text-gray-700">I Found Something</span>
          </label>
        </div>
      )}

      <Input
        name="title"
        label="Item Name"
        placeholder="e.g., Black iPhone 14, Blue Backpack"
        defaultValue={defaultValues?.title}
        error={fieldErrors?.title?.[0]}
        required
      />

      <Textarea
        name="description"
        label="Description"
        placeholder="Describe the item in detail (color, size, brand, distinguishing features)..."
        defaultValue={defaultValues?.description || ""}
        error={fieldErrors?.description?.[0]}
      />

      <Input
        name="locationDetails"
        label="Location Details"
        placeholder="e.g., Near the library entrance, Room 204 Science Building"
        defaultValue={defaultValues?.locationDetails || ""}
        error={fieldErrors?.locationDetails?.[0]}
        required
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="location"
          label="General Area"
          placeholder="e.g., Main Campus, Hostel A"
          defaultValue={defaultValues?.location || ""}
          error={fieldErrors?.location?.[0]}
        />

        <Input
          name="occurredAt"
          label="Date"
          type="date"
          defaultValue={formatDate(defaultValues?.occurredAt)}
          error={fieldErrors?.occurredAt?.[0]}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="contactPhone"
          label="Contact Phone"
          type="tel"
          placeholder="e.g., 08012345678"
          defaultValue={defaultValues?.contactPhone || userPhone || ""}
          error={fieldErrors?.contactPhone?.[0]}
          required
        />

        <Input
          name="contactName"
          label="Contact Name"
          placeholder="Name to display (optional)"
          defaultValue={defaultValues?.contactName || userName || ""}
          error={fieldErrors?.contactName?.[0]}
        />
      </div>

      {isEdit && (
        <Select
          name="status"
          label="Status"
          defaultValue={defaultValues?.status || "ACTIVE"}
        >
          <option value="ACTIVE">Active</option>
          <option value="RESOLVED">Resolved</option>
        </Select>
      )}

      {!isEdit && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Photos</label>
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
                <input type="hidden" name="photoUrls" value={preview} />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute right-1 top-1 rounded-full bg-white/80 p-1 shadow-sm hover:bg-white"
                >
                  <X className="h-4 w-4 text-gray-600" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 transition-colors hover:border-blue-500 hover:text-blue-500"
            >
              <Upload className="h-6 w-6" />
              <span className="text-xs">Add Photo</span>
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={ACCEPTED_IMAGE_TYPES.join(",")}
            multiple
            onChange={handlePhotoUpload}
            className="hidden"
          />
          <p className="text-xs text-gray-500">
            Max {MAX_FILE_SIZE / 1024 / 1024}MB per image. Accepted formats: JPEG, PNG, WebP
          </p>
        </div>
      )}

      <SubmitButton isEdit={isEdit} />
    </form>
  );
}
