"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChatThreadList, ChatThread } from "@/components/chat/chat-thread-list";

interface MessagesClientProps {
  threads: ChatThread[];
  currentUserId: string;
}

export function MessagesClient({ threads, currentUserId }: MessagesClientProps) {
  const router = useRouter();

  const handleSelectThread = (threadId: string) => {
    router.push(`/messages/${threadId}`);
  };

  return (
    <Card className="overflow-hidden">
      <ChatThreadList
        threads={threads}
        onSelectThread={handleSelectThread}
        className="max-h-[600px]"
      />
    </Card>
  );
}
