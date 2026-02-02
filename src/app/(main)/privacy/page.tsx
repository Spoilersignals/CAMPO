import Link from "next/link";
import { Shield, Eye, Lock, Database, Users } from "lucide-react";

export const metadata = {
  title: "Privacy Policy - ComradeZone",
  description: "Learn how ComradeZone collects, uses, and protects your personal information.",
};

export default function PrivacyPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Privacy Policy</h1>
          <p className="text-gray-600">
            Last updated: {new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>

        <div className="space-y-8">
          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Database className="h-5 w-5 text-indigo-600" />
              Information We Collect
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <ul className="space-y-3 text-gray-600">
                <li><strong>Account Information:</strong> Name, email address, phone number, and university details when you register.</li>
                <li><strong>Listing Information:</strong> Details about items you list for sale, including photos and descriptions.</li>
                <li><strong>Transaction Data:</strong> Records of purchases, sales, and communications between users.</li>
                <li><strong>Usage Data:</strong> How you interact with our platform, including pages visited and features used.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Eye className="h-5 w-5 text-indigo-600" />
              How We Use Your Information
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <ul className="space-y-3 text-gray-600">
                <li>To provide and maintain our marketplace platform</li>
                <li>To verify seller accounts and ensure platform safety</li>
                <li>To facilitate communication between buyers and sellers</li>
                <li>To send important updates about your account or transactions</li>
                <li>To improve our services and user experience</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Users className="h-5 w-5 text-indigo-600" />
              Information Sharing
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <p className="mb-3 text-gray-600">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="space-y-3 text-gray-600">
                <li><strong>Other Users:</strong> Buyer/seller information necessary to complete transactions.</li>
                <li><strong>Service Providers:</strong> Third parties that help us operate our platform.</li>
                <li><strong>Legal Requirements:</strong> When required by law or to protect our rights.</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Lock className="h-5 w-5 text-indigo-600" />
              Data Security
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <p className="text-gray-600">
                We implement appropriate security measures to protect your personal information.
                However, no method of transmission over the internet is 100% secure, and we cannot
                guarantee absolute security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-900">
              <Shield className="h-5 w-5 text-indigo-600" />
              Your Rights
            </h2>
            <div className="rounded-lg border bg-white p-6">
              <ul className="space-y-3 text-gray-600">
                <li>Access and receive a copy of your personal data</li>
                <li>Request correction of inaccurate information</li>
                <li>Request deletion of your account and data</li>
                <li>Opt out of marketing communications</li>
              </ul>
            </div>
          </section>

          <div className="rounded-lg bg-gray-100 p-6 text-center">
            <p className="mb-4 text-gray-600">
              Questions about our privacy practices?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
