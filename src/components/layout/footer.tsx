import Link from "next/link";
import { MessageCircle, Mail, Phone, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-5">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-xl font-bold text-indigo-600">
              <MessageCircle className="h-6 w-6" />
              ComradeZone
            </Link>
            <p className="mt-4 text-sm text-gray-600">
              The anonymous confession and community platform for university students. Your Campus. Your Voice. Anonymous.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              How It Works
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/how-it-works"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Overview
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#sellers"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  For Sellers
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#buyers"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  For Buyers
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#commission"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Commission & Fees
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              For Sellers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/register"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Become a Seller
                </Link>
              </li>
              <li>
                <Link
                  href="/sell"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  List an Item
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Seller Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/my-listings"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  My Listings
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              For Buyers
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/marketplace"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Browse Marketplace
                </Link>
              </li>
              <li>
                <Link
                  href="/requests"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Item Suggestions
                </Link>
              </li>
              <li>
                <Link
                  href="/lost-found"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Lost & Found
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works#payment"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Payment Methods
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-gray-900">
              Support
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Contact Support
                </Link>
              </li>
              <li>
                <Link
                  href="/help"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Help Center
                </Link>
              </li>
              <li>
                <Link
                  href="/safety"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Safety Tips
                </Link>
              </li>
              <li>
                <Link
                  href="/terms"
                  className="text-sm text-gray-600 hover:text-indigo-600"
                >
                  Terms & Conditions
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t pt-8">
          <div className="mb-6 rounded-lg bg-indigo-50 p-4">
            <h4 className="mb-3 font-semibold text-indigo-900">Contact Us</h4>
            <div className="grid gap-3 text-sm sm:grid-cols-3">
              <div className="flex items-center gap-2 text-gray-600">
                <Mail className="h-4 w-4 text-indigo-600" />
                <span>support@comradezone.com</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Phone className="h-4 w-4 text-indigo-600" />
                <span>+234 XXX XXX XXXX</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <MapPin className="h-4 w-4 text-indigo-600" />
                <span>Campus Location</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-sm text-gray-500">
              © {new Date().getFullYear()} ComradeZone. All rights reserved.
            </p>
            <div className="flex gap-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                Privacy Policy
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                Terms of Service
              </Link>
              <Link
                href="/contact"
                className="text-sm text-gray-500 hover:text-indigo-600"
              >
                Contact Us
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
