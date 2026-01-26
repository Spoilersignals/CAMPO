import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserActions } from "./user-actions";

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    where: { role: { not: "ADMIN" } },
    include: {
      _count: {
        select: {
          listings: true,
          sales: true,
          reportsAgainst: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Users</h1>
        <p className="text-gray-500">Manage marketplace users</p>
      </div>

      {users.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No users found</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {users.map((user) => (
            <Card key={user.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={user.name || "User"}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600">
                        {(user.name || user.email)?.[0]?.toUpperCase() || "U"}
                      </div>
                    )}
                    <div>
                      <CardTitle className="text-base">
                        {user.name || "Unnamed User"}
                      </CardTitle>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {user.isVerified && (
                      <Badge variant="success">Verified</Badge>
                    )}
                    {user.sellerApproved ? (
                      <Badge variant="success">Approved Seller</Badge>
                    ) : (
                      <Badge variant="warning">Pending Approval</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">Listings:</span>{" "}
                    <span className="font-medium">{user._count.listings}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Sales:</span>{" "}
                    <span className="font-medium">{user._count.sales}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Reports Against:</span>{" "}
                    <span
                      className={`font-medium ${
                        user._count.reportsAgainst > 0 ? "text-red-600" : ""
                      }`}
                    >
                      {user._count.reportsAgainst}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-500">Joined:</span>{" "}
                    <span className="font-medium">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {user.phone && (
                  <p className="mt-2 text-sm text-gray-500">
                    Phone: {user.phone}
                  </p>
                )}
                {user.schoolName && (
                  <p className="text-sm text-gray-500">
                    School: {user.schoolName}
                  </p>
                )}
                <UserActions
                  userId={user.id}
                  isApproved={user.sellerApproved}
                />
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
