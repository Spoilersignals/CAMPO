import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { EscrowActions } from "./escrow-actions";
import { EscrowFilter } from "./escrow-filter";

interface EscrowPageProps {
  searchParams: Promise<{ status?: string }>;
}

export default async function EscrowManagementPage({ searchParams }: EscrowPageProps) {
  const params = await searchParams;
  const statusFilter = params.status;

  const escrows = await prisma.escrowTransaction.findMany({
    where: statusFilter ? { status: statusFilter } : undefined,
    include: {
      listing: {
        include: {
          photos: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      },
      seller: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Escrow Management</h1>
        <p className="text-gray-500">Manage buyer payments and releases</p>
      </div>

      <EscrowFilter currentStatus={statusFilter} />

      {escrows.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No escrow transactions found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {escrows.map((escrow) => (
            <Card key={escrow.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle>{escrow.listing.title}</CardTitle>
                    <p className="text-sm text-gray-500">
                      Seller: {escrow.seller.name || escrow.seller.email}
                    </p>
                  </div>
                  <Badge
                    variant={
                      escrow.status === "RELEASED"
                        ? "success"
                        : escrow.status === "HOLDING"
                        ? "warning"
                        : escrow.status === "REFUNDED"
                        ? "error"
                        : "default"
                    }
                  >
                    {escrow.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {escrow.listing.photos[0] && (
                      <img
                        src={escrow.listing.photos[0].url}
                        alt={escrow.listing.title}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Amount:</span>{" "}
                      <span className="text-lg font-bold text-green-600">
                        ₦{escrow.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Buyer:</span>{" "}
                      <span className="font-medium">{escrow.buyerName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500">Phone:</span>{" "}
                      <span className="font-medium">{escrow.buyerPhone}</span>
                    </div>
                    {escrow.buyerEmail && (
                      <div>
                        <span className="text-gray-500">Email:</span>{" "}
                        <span className="font-medium">{escrow.buyerEmail}</span>
                      </div>
                    )}
                    <div>
                      <span className="text-gray-500">Created:</span>{" "}
                      <span className="font-medium">
                        {new Date(escrow.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    {escrow.releasedAt && (
                      <div>
                        <span className="text-gray-500">Released:</span>{" "}
                        <span className="font-medium">
                          {new Date(escrow.releasedAt).toLocaleDateString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                {escrow.status === "HOLDING" && (
                  <EscrowActions escrowId={escrow.id} />
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
