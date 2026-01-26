"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { CONDITIONS } from "@/lib/constants";

interface Category {
  id: string;
  name: string;
}

interface RequestFormProps {
  categories: Category[];
  defaultValues?: {
    title?: string;
    description?: string | null;
    budget?: number | null;
    condition?: string | null;
    categoryId?: string;
    status?: string;
  };
  action: (formData: FormData) => void;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  isEdit?: boolean;
}

function SubmitButton({ isEdit }: { isEdit: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : isEdit ? "Update Request" : "Create Request"}
    </Button>
  );
}

export function RequestForm({
  categories,
  defaultValues,
  action,
  error,
  fieldErrors,
  isEdit = false,
}: RequestFormProps) {
  return (
    <form action={action} className="space-y-6">
      {error && (
        <div className="rounded-lg bg-red-50 p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      <Input
        name="title"
        label="What are you looking for?"
        placeholder="e.g., Calculus Textbook, Used Laptop"
        defaultValue={defaultValues?.title}
        error={fieldErrors?.title?.[0]}
        required
      />

      <Textarea
        name="description"
        label="Description"
        placeholder="Describe what you're looking for, any specific requirements..."
        defaultValue={defaultValues?.description || ""}
        error={fieldErrors?.description?.[0]}
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          name="budget"
          label="Budget ($)"
          type="number"
          step="0.01"
          min="0"
          placeholder="Max you're willing to pay"
          defaultValue={defaultValues?.budget || ""}
          error={fieldErrors?.budget?.[0]}
        />

        <Select
          name="condition"
          label="Preferred Condition"
          defaultValue={defaultValues?.condition || ""}
          error={fieldErrors?.condition?.[0]}
        >
          <option value="">Any condition</option>
          {CONDITIONS.map((cond) => (
            <option key={cond} value={cond}>
              {cond}
            </option>
          ))}
        </Select>
      </div>

      <Select
        name="categoryId"
        label="Category"
        defaultValue={defaultValues?.categoryId || ""}
        error={fieldErrors?.categoryId?.[0]}
        required
      >
        <option value="">Select a category</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </Select>

      {isEdit && (
        <Select
          name="status"
          label="Status"
          defaultValue={defaultValues?.status || "OPEN"}
        >
          <option value="OPEN">Open</option>
          <option value="FULFILLED">Fulfilled</option>
          <option value="CLOSED">Closed</option>
        </Select>
      )}

      <SubmitButton isEdit={isEdit} />
    </form>
  );
}
