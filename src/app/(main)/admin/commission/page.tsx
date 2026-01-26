import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PendingCommissionPage() {
  const payments = await prisma.commissionPayment.findMany({
    where: { status: "PENDING" },
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

  const totalPending = payments.reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Pending Commission</h1>
        <p className="text-gray-500">
          Listings awaiting commission payment before going live
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-500">Total Pending Commission</span>
            <span className="text-2xl font-bold text-green-600">
              ₦{totalPending.toLocaleString()}
            </span>
          </div>
        </CardContent>
      </Card>

      {payments.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No pending commission payments</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {payments.map((payment) => (
            <Card key={payment.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {payment.listing.title}
                    </CardTitle>
                    <p className="text-sm text-gray-500">
                      Seller: {payment.seller.name || payment.seller.email}
                    </p>
                  </div>
                  <Badge variant="warning">PENDING</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    {payment.listing.photos[0] && (
                      <img
                        src={payment.listing.photos[0].url}
                        alt={payment.listing.title}
                        className="h-32 w-full rounded-lg object-cover"
                      />
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-500">Listing Price:</span>{" "}
                      <span className="font-medium">
                        ₦{payment.listing.price.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Commission (15%):</span>{" "}
                      <span className="text-lg font-bold text-green-600">
                        ₦{payment.amount.toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Created:</span>{" "}
                      <span className="font-medium">
                        {new Date(payment.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
