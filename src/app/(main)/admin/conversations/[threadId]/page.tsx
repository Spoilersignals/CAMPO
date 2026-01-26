import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ModeratorMessageForm } from "./moderator-message-form";

interface ConversationDetailPageProps {
  params: Promise<{ threadId: string }>;
}

export default async function ConversationDetailPage({
  params,
}: ConversationDetailPageProps) {
  const { threadId } = await params;

  const thread = await prisma.chatThread.findUnique({
    where: { id: threadId },
    include: {
      listing: { select: { id: true, title: true, price: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          sender: { select: { id: true, name: true } },
        },
      },
    },
  });

  if (!thread) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <Link
            href="/admin/conversations"
            className="text-sm text-blue-600 hover:underline"
          >
            ← Back to Conversations
          </Link>
          <h1 className="mt-2 text-2xl font-bold text-gray-900">
            {thread.listing?.title || "General Inquiry"}
          </h1>
          <p className="text-gray-500">
            Seller: {thread.seller.name || thread.seller.email}
            {thread.buyerName && ` • Buyer: ${thread.buyerName}`}
          </p>
        </div>
        <div className="flex gap-2">
          {thread.supportRequested && (
            <Badge variant="error">Support Requested</Badge>
          )}
          <Badge variant="default">Viewing as Moderator</Badge>
        </div>
      </div>

      {thread.listing && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Listing Details</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm">
              <span className="text-gray-500">Title:</span> {thread.listing.title}
            </p>
            <p className="text-sm">
              <span className="text-gray-500">Price:</span> ₦
              {thread.listing.price.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Messages</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="max-h-[500px] space-y-4 overflow-y-auto">
            {thread.messages.map((message) => {
              const isSeller = message.senderId === thread.sellerId;
              const senderLabel =
                message.senderName === "Moderator"
                  ? "Moderator"
                  : isSeller
                  ? `Seller (${message.sender?.name || "Unknown"})`
                  : `Buyer (${message.senderName || "Guest"})`;

              return (
                <div
                  key={message.id}
                  className={`rounded-lg p-3 ${
                    message.senderName === "Moderator"
                      ? "bg-purple-50 border border-purple-200"
                      : isSeller
                      ? "bg-blue-50"
                      : "bg-gray-50"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-medium ${
                        message.senderName === "Moderator"
                          ? "text-purple-700"
                          : isSeller
                          ? "text-blue-700"
                          : "text-gray-700"
                      }`}
                    >
                      {senderLabel}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-800">{message.body}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Intervene as Moderator</CardTitle>
        </CardHeader>
        <CardContent>
          <ModeratorMessageForm threadId={threadId} />
        </CardContent>
      </Card>
    </div>
  );
}
