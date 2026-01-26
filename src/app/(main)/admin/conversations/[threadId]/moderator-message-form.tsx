"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { sendModeratorMessage } from "@/actions/admin";

interface ModeratorMessageFormProps {
  threadId: string;
}

export function ModeratorMessageForm({ threadId }: ModeratorMessageFormProps) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    startTransition(async () => {
      await sendModeratorMessage(threadId, message);
      setMessage("");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        placeholder="Send a message as Moderator..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button type="submit" disabled={isPending || !message.trim()}>
        {isPending ? "Sending..." : "Send as Moderator"}
      </Button>
    </form>
  );
}
