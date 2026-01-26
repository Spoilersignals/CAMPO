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

interface SuggestionFormProps {
  categories: Category[];
  action: (formData: FormData) => void;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  isLoggedIn: boolean;
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="w-full">
      {pending ? "Submitting..." : "Submit Suggestion"}
    </Button>
  );
}

export function SuggestionForm({
  categories,
  action,
  error,
  fieldErrors,
  isLoggedIn,
}: SuggestionFormProps) {
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
        error={fieldErrors?.title?.[0]}
        required
      />

      <Textarea
        name="description"
        label="Description"
        placeholder="Describe what you're looking for, any specific requirements..."
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
          error={fieldErrors?.budget?.[0]}
        />

        <Select
          name="condition"
          label="Preferred Condition"
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

      {!isLoggedIn && (
        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
          <p className="mb-4 text-sm text-gray-600">
            Contact info (optional) - so sellers can reach you
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              name="guestName"
              label="Your Name"
              placeholder="Your name"
              error={fieldErrors?.guestName?.[0]}
            />
            <Input
              name="guestEmail"
              label="Your Email"
              type="email"
              placeholder="your@email.com"
              error={fieldErrors?.guestEmail?.[0]}
            />
          </div>
        </div>
      )}

      <SubmitButton />
    </form>
  );
}
