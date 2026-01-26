import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function ConversationsPage() {
  const threads = await prisma.chatThread.findMany({
    include: {
      listing: { select: { id: true, title: true } },
      seller: { select: { id: true, name: true, email: true } },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
      _count: { select: { messages: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Conversations</h1>
        <p className="text-gray-500">Monitor all chat threads as Moderator</p>
      </div>

      {threads.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No conversations yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <Link key={thread.id} href={`/admin/conversations/${thread.id}`}>
              <Card className="cursor-pointer transition-shadow hover:shadow-md">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base">
                        {thread.listing?.title || "General Inquiry"}
                      </CardTitle>
                      <p className="text-sm text-gray-500">
                        Seller: {thread.seller.name || thread.seller.email}
                        {thread.buyerName && ` • Buyer: ${thread.buyerName}`}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {thread.supportRequested && (
                        <Badge variant="error">Support Requested</Badge>
                      )}
                      <Badge variant="default">
                        {thread._count.messages} messages
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {thread.messages[0] && (
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">
                        {thread.messages[0].senderName ||
                          (thread.messages[0].senderId === thread.sellerId
                            ? "Seller"
                            : "Buyer")}
                        :
                      </span>{" "}
                      {thread.messages[0].body.slice(0, 100)}
                      {thread.messages[0].body.length > 100 ? "..." : ""}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-gray-400">
                    Last activity:{" "}
                    {new Date(thread.updatedAt).toLocaleString()}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
