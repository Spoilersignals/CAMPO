"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send, Loader2, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select } from "@/components/ui/select";
import { createSupportTicketAction } from "@/actions/support";

interface ContactBrokerFormProps {
  userId: string;
  userName: string;
}

export function ContactBrokerForm({ userId, userName }: ContactBrokerFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(e.currentTarget);

    try {
      const result = await createSupportTicketAction(formData);
      if (result?.error) {
        setError(result.error);
      } else {
        setIsSuccess(true);
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
      }
    } catch {
      setError("Failed to send message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center py-8 text-center">
        <div className="mb-4 rounded-full bg-green-100 p-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900">Message Sent!</h3>
        <p className="mt-2 text-gray-600">
          Our broker team will get back to you soon.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <Select label="Topic" name="topic" required>
        <option value="">Select a topic</option>
        <option value="listing">Listing Issue</option>
        <option value="commission">Commission & Payment</option>
        <option value="buyer">Buyer Issue</option>
        <option value="account">Account Issue</option>
        <option value="other">Other</option>
      </Select>

      <Input
        label="Subject"
        name="subject"
        placeholder="Brief description of your issue"
        required
      />

      <Textarea
        label="Message"
        name="description"
        placeholder="Please describe your issue in detail..."
        rows={5}
        required
      />

      <Input
        label="Phone Number (optional)"
        name="phone"
        type="tel"
        placeholder="For urgent issues"
      />

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Message
          </>
        )}
      </Button>
    </form>
  );
}
