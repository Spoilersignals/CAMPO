"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createStudyGroup } from "@/actions/study-groups";

export default function NewStudyGroupPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    const meetingTimeValue = formData.get("meetingTime") as string;
    const maxMembersValue = formData.get("maxMembers") as string;

    const result = await createStudyGroup({
      courseCode: formData.get("courseCode") as string,
      courseName: formData.get("courseName") as string || undefined,
      topic: formData.get("topic") as string || undefined,
      location: formData.get("location") as string || undefined,
      meetingTime: meetingTimeValue ? new Date(meetingTimeValue) : undefined,
      maxMembers: maxMembersValue ? parseInt(maxMembersValue) : undefined,
      description: formData.get("description") as string || undefined,
      contactInfo: formData.get("contactInfo") as string,
    });

    setIsSubmitting(false);

    if (result.success) {
      router.push("/study-groups");
    } else {
      setError(result.error || "Failed to create study group");
    }
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/study-groups"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Study Groups
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create a Study Group</CardTitle>
          <p className="text-sm text-gray-500">
            Find study partners for your courses and exams
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <Input
              name="courseCode"
              label="Course Code"
              placeholder="e.g., CS 101, MATH 201"
              required
            />

            <Input
              name="courseName"
              label="Course Name (Optional)"
              placeholder="e.g., Introduction to Computer Science"
            />

            <Input
              name="topic"
              label="Topic / Exam (Optional)"
              placeholder="e.g., Midterm prep, Final review, Chapter 5"
            />

            <Input
              name="location"
              label="Meeting Location"
              placeholder="e.g., Library Room 204, Student Center"
            />

            <Input
              name="meetingTime"
              label="Meeting Time"
              type="datetime-local"
            />

            <Input
              name="maxMembers"
              label="Max Members"
              type="number"
              min="2"
              placeholder="Leave empty for unlimited"
            />

            <Textarea
              name="description"
              label="Description (Optional)"
              placeholder="What will you be studying? Any specific goals?"
              rows={3}
            />

            <Input
              name="contactInfo"
              label="Contact Info"
              placeholder="WhatsApp group link, phone number, or email"
              required
            />

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "Creating..." : "Create Study Group"}
              </Button>
              <Link href="/study-groups" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
