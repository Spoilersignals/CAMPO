import Link from "next/link";
import { MessageCircle, CheckCircle, AlertCircle, ArrowRight, Shield } from "lucide-react";

export const metadata = {
  title: "Terms & Conditions - ComradeZone",
  description: "Terms and conditions for using ComradeZone platform.",
};

export default function TermsPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-4xl font-bold text-gray-900">Terms & Conditions</h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="prose prose-gray max-w-none">
          <section className="mb-12">
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-gray-900">
              <MessageCircle className="h-6 w-6 text-indigo-600" />
              About ComradeZone
            </h2>
            <p className="text-gray-600">
              ComradeZone operates as the anonymous confession and community platform for university students.
              We connect verified sellers with buyers, provide listing verification, and facilitate
              communication. Payments are made directly between buyers and sellers via M-Pesa or bank transfer.
              By using our platform, you agree to the following terms and conditions.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">For Sellers</h2>
            
            <div className="space-y-6">
              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">1. Seller Registration & Approval</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    All sellers must register and be approved by the broker before listing items
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Sellers must provide accurate personal and contact information
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    The broker reserves the right to reject or revoke seller approval at any time
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">2. Listing Requirements</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    All items must be accurately described with clear, genuine photos
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <strong>Pricing must be reasonable</strong> – overpriced items will be rejected or require adjustment
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Prohibited items include: stolen goods, counterfeit products, illegal items, and items violating campus policies
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    For used items, condition and usage duration must be honestly disclosed
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-amber-100 bg-amber-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">3. Commission Structure</h3>
                <div className="space-y-3 text-gray-600">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span><strong>15% Commission:</strong> Sellers pay 15% of the listing price as commission when creating a listing</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span><strong>Commission Payment:</strong> Commission must be paid before the listing goes live</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span><strong>50% Refund Policy:</strong> If your item does not sell, you are entitled to a 50% refund of the commission paid</span>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <span><strong>Non-Refundable Cases:</strong> Commission is NOT refundable if the listing is removed due to policy violations, false information, or seller misconduct</span>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-indigo-100 bg-indigo-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">4. Seller Responsibilities</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Respond to buyer inquiries promptly and professionally
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Deliver items as described in the listing
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Coordinate with buyers for safe delivery locations (preferably on campus)
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Do not attempt to bypass the broker or arrange direct payments with buyers
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">For Buyers</h2>
            
            <div className="space-y-6">
              <div className="rounded-lg border border-green-100 bg-green-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">1. Purchasing Process</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Buyers do not need to register – you can browse and purchase as a guest
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Contact sellers through our messaging system to arrange transactions
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    All conversations are visible to the broker for your protection
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-green-100 bg-green-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">2. Payment Terms</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <strong>Pay on Delivery:</strong> You only pay when you physically receive the item
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    <strong>Pay to Broker:</strong> All payments are made to the broker, NOT directly to the seller
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Verify the item matches the listing description before paying
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-500" />
                    Always inspect items before paying via M-Pesa or bank transfer
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-100 bg-blue-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">3. Buyer Protection</h3>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    All sellers are verified by ComradeZone before they can list items
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    If the item doesn&apos;t match the description, contact support immediately
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    The broker will mediate disputes and may ban fraudulent sellers
                  </li>
                  <li className="flex items-start gap-2">
                    <Shield className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                    Always meet in safe, public locations on campus for exchanges
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-green-100 bg-green-50/50 p-6">
                <h3 className="mb-3 font-semibold text-gray-900">4. Reporting Issues</h3>
                <p className="mb-3 text-gray-600">
                  If you encounter any problems with your purchase, contact support immediately:
                </p>
                <ul className="space-y-2 text-gray-600">
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    Item does not match the listing description
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    Item is damaged or defective (not as disclosed)
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    Seller is unresponsive or refuses to deliver
                  </li>
                  <li className="flex items-start gap-2">
                    <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                    You suspect fraudulent activity
                  </li>
                </ul>
              </div>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">The Broker&apos;s Role</h2>
            
            <div className="rounded-lg border border-purple-100 bg-purple-50/50 p-6">
              <p className="mb-4 text-gray-600">
                ComradeZone acts as a neutral intermediary to ensure safe and fair transactions:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Seller Verification:</strong> We review and approve all sellers before they can list items
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Listing Review:</strong> All listings are reviewed for accuracy, fair pricing, and policy compliance
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Connection Service:</strong> We connect verified buyers and sellers for direct transactions
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Conversation Moderation:</strong> All messages between buyers and sellers are visible to the broker
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Dispute Resolution:</strong> We mediate conflicts and determine fair outcomes
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-purple-600" />
                  <strong>Direct Payments:</strong> Buyers pay sellers directly via M-Pesa or bank transfer
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Prohibited Activities</h2>
            
            <div className="rounded-lg border border-red-100 bg-red-50/50 p-6">
              <p className="mb-4 text-gray-600">
                The following activities are strictly prohibited and may result in account suspension:
              </p>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Attempting to bypass the broker with direct payments
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Listing stolen, counterfeit, or illegal items
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Providing false or misleading information in listings
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Harassment, abuse, or threats toward other users
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Creating multiple accounts to circumvent bans
                </li>
                <li className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
                  Fraudulent transactions or payment scams
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="mb-6 text-2xl font-bold text-gray-900">Disclaimer</h2>
            
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-6 text-sm text-gray-600">
              <p className="mb-3">
                ComradeZone provides a platform for buyers and sellers to connect. While we take
                measures to verify sellers and listings, we cannot guarantee the accuracy of all
                information provided by users.
              </p>
              <p className="mb-3">
                Users are responsible for conducting their own due diligence before completing
                transactions. The broker is not liable for losses resulting from user misconduct
                that occurs outside our platform.
              </p>
              <p>
                These terms may be updated periodically. Continued use of the platform constitutes
                acceptance of the current terms.
              </p>
            </div>
          </section>

          <section className="rounded-2xl bg-indigo-600 p-8 text-center text-white">
            <h2 className="mb-4 text-2xl font-bold">Questions About Our Terms?</h2>
            <p className="mb-6 text-indigo-100">
              Contact our support team if you have any questions about these terms and conditions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 font-medium text-indigo-600 hover:bg-gray-100"
            >
              Contact Support <ArrowRight className="h-4 w-4" />
            </Link>
          </section>
        </div>
      </div>
    </div>
  );
}
