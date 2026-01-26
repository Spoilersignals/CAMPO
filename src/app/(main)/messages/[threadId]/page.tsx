import { redirect, notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { getThreadMessages, markAsRead } from "@/actions/messages";
import { ChatClient } from "./chat-client";

export default async function ChatPage({
  params,
}: {
  params: Promise<{ threadId: string }>;
}) {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const { threadId } = await params;

  let data;
  try {
    data = await getThreadMessages(threadId);
    await markAsRead(threadId);
  } catch (error) {
    notFound();
  }

  return (
    <div className="container mx-auto h-[calc(100vh-200px)] px-4 py-8">
      <ChatClient
        threadId={threadId}
        currentUserId={session.user.id}
        otherUser={data.thread.otherUser}
        listing={data.thread.listing}
        initialMessages={data.messages}
      />
    </div>
  );
}
