import Link from "next/link";
import {
  MessageCircle,
  ShoppingBag,
  Users,
  CheckCircle,
  DollarSign,
  AlertCircle,
  ArrowRight,
  Handshake,
  MessageSquare,
  Package,
  Clock,
  RefreshCcw,
  Smartphone,
  CreditCard,
} from "lucide-react";

export const metadata = {
  title: "How It Works - ComradeZone",
  description: "Learn how ComradeZone connects buyers and sellers on campus with verified listings and direct payments via M-Pesa.",
};

export default function HowItWorksPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-indigo-100 px-4 py-2 text-sm font-medium text-indigo-700">
            <MessageCircle className="h-4 w-4" />
            Your Campus. Your Voice. Anonymous.
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">How ComradeZone Works</h1>
          <p className="text-lg text-gray-600">
            We connect verified sellers with buyers and facilitate safe transactions.
            Sellers pay a 15% commission to list, and buyers pay sellers directly via M-Pesa or bank transfer.
          </p>
        </div>

        <section id="sellers" className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <ShoppingBag className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">For Sellers</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                1
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Register & Get Approved</h3>
                <p className="text-gray-600">
                  Create your seller account with your campus email and details. Our broker team
                  will review and approve your account before you can start listing items. This
                  ensures all sellers on the platform are verified and trustworthy.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                2
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">List Your Item & Pay 15% Commission</h3>
                <p className="text-gray-600">
                  Once approved, list your item with photos, description, and a reasonable price.
                  You&apos;ll pay a <strong>15% commission upfront</strong> based on your listing price.
                  This commission covers our broker services, listing verification, and platform support.
                </p>
                <div className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
                  <AlertCircle className="mb-1 inline h-4 w-4" /> Commission is calculated on your
                  listing price. Please set reasonable prices – overpriced items may be rejected.
                </div>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                3
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Wait for Approval</h3>
                <p className="text-gray-600">
                  After paying commission, your listing goes through broker review. We check that
                  the item description is accurate, photos are clear, and pricing is fair. Once
                  approved, your listing goes live on the marketplace.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-lg font-bold text-white">
                4
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Connect & Get Paid Directly</h3>
                <p className="text-gray-600">
                  When a buyer is interested, they&apos;ll contact you through our messaging system.
                  Arrange delivery and receive payment directly from the buyer via <strong>M-Pesa</strong> or{" "}
                  <strong>bank transfer</strong>. You keep the full sale price!
                </p>
                <div className="mt-3 flex gap-2">
                  <div className="inline-flex items-center gap-1 rounded-full bg-green-100 px-3 py-1 text-sm text-green-800">
                    <Smartphone className="h-4 w-4" /> M-Pesa
                  </div>
                  <div className="inline-flex items-center gap-1 rounded-full bg-blue-100 px-3 py-1 text-sm text-blue-800">
                    <CreditCard className="h-4 w-4" /> Bank Transfer
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="buyers" className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">For Buyers</h2>
          </div>

          <div className="space-y-6">
            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                1
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Browse & Choose</h3>
                <p className="text-gray-600">
                  Browse our marketplace for verified listings from approved sellers. All items
                  are reviewed by the broker before going live, so you can trust that listings
                  are accurate and fairly priced.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                2
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Contact the Seller</h3>
                <p className="text-gray-600">
                  Found something you like? Message the seller directly through our platform.
                  Ask questions, negotiate if needed, and arrange pickup or delivery details.
                </p>
              </div>
            </div>

            <div className="flex gap-4 rounded-lg border border-gray-200 bg-white p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-600 text-lg font-bold text-white">
                3
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-gray-900">Pay the Seller Directly</h3>
                <p className="text-gray-600">
                  Once you&apos;ve inspected the item and are satisfied, pay the seller directly via{" "}
                  <strong>M-Pesa</strong> or <strong>bank transfer</strong>. We recommend meeting in safe,
                  public locations on campus for exchanges.
                </p>
                <div className="mt-3 rounded-lg bg-green-50 p-3 text-sm text-green-800">
                  <CheckCircle className="mb-1 inline h-4 w-4" /> All sellers are verified by ComradeZone.
                  Always inspect items before payment.
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="payment" className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">
              <Smartphone className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
          </div>

          <div className="rounded-xl border border-blue-200 bg-blue-50 p-6">
            <p className="mb-4 text-gray-700">
              Buyers pay sellers directly using Kenya&apos;s most trusted payment methods:
            </p>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                <div className="rounded-lg bg-green-100 p-2">
                  <Smartphone className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">M-Pesa</h4>
                  <p className="text-sm text-gray-600">
                    Send money directly to the seller&apos;s M-Pesa number. Fast, secure, and convenient.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3 rounded-lg bg-white p-4">
                <div className="rounded-lg bg-blue-100 p-2">
                  <CreditCard className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900">Bank Transfer</h4>
                  <p className="text-sm text-gray-600">
                    Transfer to seller&apos;s bank account for larger purchases.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              <AlertCircle className="mb-1 inline h-4 w-4" /> The broker facilitates the connection
              between buyers and sellers. Payment is handled directly between parties.
            </div>
          </div>
        </section>

        <section id="commission" className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-purple-100">
              <DollarSign className="h-6 w-6 text-purple-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Commission & Refund Policy</h2>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-100">
                  <DollarSign className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-gray-900">15% Listing Commission</h3>
              </div>
              <p className="text-gray-600">
                Sellers pay 15% of the listing price as commission when listing an item.
                This covers platform services, listing verification, and marketplace support.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                  <RefreshCcw className="h-5 w-5 text-green-600" />
                </div>
                <h3 className="font-semibold text-gray-900">50% Refund if No Sale</h3>
              </div>
              <p className="text-gray-600">
                If your item doesn&apos;t sell, you receive 50% of your commission back.
                This fair policy shares the risk between the seller and the platform.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <Clock className="h-5 w-5 text-amber-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Reasonable Pricing Required</h3>
              </div>
              <p className="text-gray-600">
                All listings are reviewed for fair pricing. Overpriced items may be rejected
                or require price adjustments before approval.
              </p>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-5 w-5 text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900">Non-Refundable Cases</h3>
              </div>
              <p className="text-gray-600">
                Commission is non-refundable if a listing is removed due to policy violations,
                false information, or seller misconduct.
              </p>
            </div>
          </div>
        </section>

        <section id="how-we-help" className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Handshake className="h-6 w-6 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">What ComradeZone Does</h2>
          </div>

          <div className="rounded-xl border border-indigo-200 bg-indigo-50 p-6">
            <p className="mb-4 text-gray-700">
              We&apos;re your trusted intermediary connecting buyers and sellers on campus:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-gray-700">Verify all sellers before they can list items</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-gray-700">Review all listings for accuracy and fair pricing</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-gray-700">Provide a secure messaging platform for buyer-seller communication</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-gray-700">Handle disputes and provide support when needed</p>
              </div>
              <div className="flex items-start gap-3">
                <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-indigo-600" />
                <p className="text-gray-700">Connect you with trusted buyers and sellers on campus</p>
              </div>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100">
              <MessageSquare className="h-6 w-6 text-orange-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Need Help?</h2>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6">
            <p className="mb-4 text-gray-600">
              If you have any issues, our support team is here to help.
              Contact us if:
            </p>
            <ul className="mb-4 space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                The item doesn&apos;t match the listing description
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                The seller is unresponsive or unprofessional
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                You suspect fraud or misconduct
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-indigo-600" />
                You need help with M-Pesa or payment issues
              </li>
            </ul>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Contact Support <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>

        <section className="rounded-2xl bg-indigo-600 p-8 text-center text-white">
          <h2 className="mb-4 text-2xl font-bold">Ready to Get Started?</h2>
          <p className="mb-6 text-indigo-100">
            Join ComradeZone today and connect with buyers and sellers on campus.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-indigo-600 hover:bg-gray-100"
            >
              <Package className="h-5 w-5" />
              Become a Seller
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full border-2 border-white px-6 py-3 font-medium text-white hover:bg-white/10"
            >
              <Handshake className="h-5 w-5" />
              Browse Marketplace
            </Link>
          </div>
        </section>

        <section className="mt-12 text-center text-sm text-gray-500">
          <p>
            By using ComradeZone, you agree to our{" "}
            <Link href="/terms" className="text-indigo-600 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-indigo-600 hover:underline">
              Privacy Policy
            </Link>
            .
          </p>
        </section>
      </div>
    </div>
  );
}
