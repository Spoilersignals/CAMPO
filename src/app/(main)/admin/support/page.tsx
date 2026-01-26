import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SupportTicketActions } from "./support-ticket-actions";

export default async function SupportTicketsPage() {
  const tickets = await prisma.supportTicket.findMany({
    include: {
      thread: {
        include: {
          listing: { select: { id: true, title: true } },
          seller: { select: { id: true, name: true, email: true } },
        },
      },
    },
    orderBy: [
      { status: "asc" },
      { createdAt: "desc" },
    ],
  });

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "error";
      case "IN_PROGRESS":
        return "warning";
      case "RESOLVED":
        return "success";
      default:
        return "default";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Support Tickets</h1>
        <p className="text-gray-500">Manage customer support requests</p>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No support tickets</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {tickets.map((ticket) => (
            <Card key={ticket.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{ticket.subject}</CardTitle>
                    <p className="text-sm text-gray-500">
                      {ticket.buyerName || ticket.thread?.seller?.name || "Unknown"}{" "}
                      • {new Date(ticket.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={getStatusVariant(ticket.status)}>
                    {ticket.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">{ticket.description}</p>
                {ticket.thread?.listing && (
                  <p className="mt-2 text-sm text-gray-500">
                    Related listing:{" "}
                    <span className="font-medium">
                      {ticket.thread.listing.title}
                    </span>
                  </p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  {ticket.buyerPhone && <p>Phone: {ticket.buyerPhone}</p>}
                  {ticket.buyerEmail && <p>Email: {ticket.buyerEmail}</p>}
                </div>
                <SupportTicketActions
                  ticketId={ticket.id}
                  currentStatus={ticket.status}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
