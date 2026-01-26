import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Package, DollarSign, Clock, Info } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getListingWithCommission, payCommissionAction } from "@/actions/listings";
import { COMMISSION_RATE } from "@/lib/constants";
import { CommissionPaymentForm } from "./commission-payment-form";

export default async function CommissionPaymentPage({
  params,
}: {
  params: Promise<{ listingId: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const { listingId } = await params;
  const listing = await getListingWithCommission(listingId);

  if (!listing) {
    notFound();
  }

  const isPaid = listing.status !== "PENDING_COMMISSION";

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-6">
        <Link
          href="/dashboard/listings"
          className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to my listings
        </Link>
      </div>

      {isPaid ? (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="py-8">
            <div className="flex flex-col items-center text-center">
              <div className="mb-4 rounded-full bg-green-100 p-4">
                <CheckCircle className="h-12 w-12 text-green-600" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-green-900">
                Commission Paid Successfully!
              </h2>
              <p className="mb-4 text-green-700">
                Your listing is now pending review by our team.
              </p>
              <div className="mb-6 rounded-lg bg-white p-4 shadow-sm">
                <h3 className="mb-2 font-medium text-gray-900">What happens next?</h3>
                <ul className="space-y-2 text-left text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <Clock className="mt-0.5 h-4 w-4 text-blue-500" />
                    <span>Our team will review your listing within 24-48 hours</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 text-green-500" />
                    <span>Once approved, your listing will be visible to buyers</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Info className="mt-0.5 h-4 w-4 text-yellow-500" />
                    <span>You&apos;ll receive a notification when your listing is approved</span>
                  </li>
                </ul>
              </div>
              <div className="flex gap-3">
                <Link
                  href="/dashboard/listings"
                  className="inline-flex items-center rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                >
                  View My Listings
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  Create Another Listing
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle>Pay Commission</CardTitle>
                  <CardDescription>
                    Complete your commission payment to submit your listing for review
                  </CardDescription>
                </div>
                <Badge variant="warning">Pending Payment</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-6 flex gap-4 rounded-lg border border-gray-200 p-4">
                <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-gray-100">
                  {listing.photos[0] ? (
                    <img
                      src={listing.photos[0].url}
                      alt={listing.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <Package className="h-8 w-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900">{listing.title}</h3>
                  <p className="text-sm text-gray-500">{listing.category.name}</p>
                  <p className="mt-1 text-lg font-semibold text-blue-600">
                    ${listing.price.toFixed(2)}
                  </p>
                </div>
              </div>

              <div className="mb-6 rounded-lg bg-gray-50 p-4">
                <h4 className="mb-3 font-medium text-gray-900">Commission Breakdown</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Listing Price</span>
                    <span className="font-medium">${listing.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Commission Rate ({COMMISSION_RATE * 100}%)
                    </span>
                    <span className="font-medium">×{COMMISSION_RATE}</span>
                  </div>
                  <hr className="my-2" />
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-900">Commission Due</span>
                    <span className="text-lg font-bold text-blue-600">
                      ${listing.commission.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mb-6 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <Info className="mt-0.5 h-5 w-5 text-blue-600" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">About Commission Payments</p>
                    <ul className="mt-2 list-inside list-disc space-y-1 text-blue-700">
                      <li>Commission is collected to maintain our marketplace</li>
                      <li>If your item doesn&apos;t sell, you may be eligible for a partial refund</li>
                      <li>Payment confirms your commitment to sell</li>
                    </ul>
                  </div>
                </div>
              </div>

              <CommissionPaymentForm
                listingId={listing.id}
                amount={listing.commission}
              />
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
