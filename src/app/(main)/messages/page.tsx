import { redirect } from "next/navigation";
import { MessageCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";
import { getMyThreads } from "@/actions/messages";
import { MessagesClient } from "./messages-client";

export default async function MessagesPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  const threads = await getMyThreads();

  if (threads.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Messages</h1>
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <MessageCircle className="mb-4 h-12 w-12 text-gray-400" />
            <h3 className="mb-2 text-lg font-medium text-gray-900">
              No messages yet
            </h3>
            <p className="text-gray-500">
              When you start a conversation, it will appear here.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold text-gray-900">Messages</h1>
      <MessagesClient threads={threads} currentUserId={session.user.id} />
    </div>
  );
}
