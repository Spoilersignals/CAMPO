"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { ChatWindow, ChatUser, ChatListing, Message } from "@/components/chat/chat-window";
import { sendMessage } from "@/actions/messages";

interface ChatClientProps {
  threadId: string;
  currentUserId: string;
  otherUser: ChatUser;
  listing?: ChatListing;
  initialMessages: {
    id: string;
    content: string;
    timestamp: Date;
    senderId: string | null;
    isRead: boolean;
  }[];
}

export function ChatClient({
  threadId,
  currentUserId,
  otherUser,
  listing,
  initialMessages,
}: ChatClientProps) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isPending, startTransition] = useTransition();

  const handleSendMessage = async (content: string) => {
    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      content,
      timestamp: new Date(),
      senderId: currentUserId,
      isRead: false,
    };

    setMessages((prev) => [...prev, optimisticMessage]);

    startTransition(async () => {
      try {
        const newMessage = await sendMessage(threadId, content);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === optimisticMessage.id
              ? {
                  id: newMessage.id,
                  content: newMessage.body,
                  timestamp: newMessage.createdAt,
                  senderId: newMessage.senderId ?? currentUserId,
                  isRead: false,
                }
              : msg
          )
        );
      } catch (error) {
        setMessages((prev) => prev.filter((msg) => msg.id !== optimisticMessage.id));
      }
    });
  };

  const handleBack = () => {
    router.push("/messages");
  };

  return (
    <Card className="h-full overflow-hidden">
      <ChatWindow
        currentUserId={currentUserId}
        otherUser={otherUser}
        listing={listing}
        messages={messages}
        onSendMessage={handleSendMessage}
        onBack={handleBack}
        isLoading={isPending}
        className="h-full"
      />
    </Card>
  );
}
