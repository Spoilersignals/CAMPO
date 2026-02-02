import Link from "next/link";
import { Shield, MapPin, Eye, AlertTriangle, CheckCircle, Phone } from "lucide-react";

export const metadata = {
  title: "Safety Guidelines - ComradeZone",
  description: "Stay safe while buying and selling on ComradeZone.",
};

export default function SafetyPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-700">
            <Shield className="h-4 w-4" />
            Your Safety Matters
          </div>
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Safety Guidelines</h1>
          <p className="text-gray-600">
            Follow these tips to ensure safe transactions on ComradeZone.
          </p>
        </div>

        <div className="space-y-6">
          <div className="rounded-lg border border-green-200 bg-green-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <MapPin className="h-5 w-5 text-green-600" />
              Meeting Safely
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Always meet in public, well-lit areas on campus
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Meet during daylight hours when possible
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Tell a friend where you&apos;re going and when
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                Consider bringing a friend along
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-blue-200 bg-blue-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Eye className="h-5 w-5 text-blue-600" />
              Verify Before You Buy
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Inspect items thoroughly before paying
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Compare the item to the listing photos and description
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Check that electronics work before completing payment
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                Only pay after you&apos;ve received the item
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-amber-200 bg-amber-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              Red Flags to Watch For
            </h2>
            <ul className="space-y-2 text-gray-600">
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Requests to pay before seeing the item
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Prices that seem too good to be true
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Sellers avoiding meeting in public places
              </li>
              <li className="flex items-start gap-2">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                Pressure to complete transactions quickly
              </li>
            </ul>
          </div>

          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-900">
              <Phone className="h-5 w-5 text-red-600" />
              Report Issues
            </h2>
            <p className="mb-4 text-gray-600">
              If you encounter any suspicious activity or have a problem with a transaction,
              contact us immediately.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
