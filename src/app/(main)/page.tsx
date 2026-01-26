import Link from "next/link";
import { Search, ArrowRight, ShoppingBag, MessageCircle, CheckCircle, DollarSign, Package, Users, Handshake, Shield } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { ListingGrid } from "@/components/listings";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";

async function getRecentListings() {
  const listings = await prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      seller: true,
      photos: {
        orderBy: { sortOrder: "asc" },
      },
    },
    take: 8,
    orderBy: { createdAt: "desc" },
  });

  return listings.map((listing: {
    id: string;
    title: string;
    price: number;
    condition: string;
    photos: { url: string }[];
    seller: { name: string | null; isVerified: boolean };
    isFeatured: boolean;
  }) => ({
    id: listing.id,
    title: listing.title,
    price: listing.price,
    condition: listing.condition as "New" | "Like New" | "Good" | "Fair" | "Poor",
    images: listing.photos.map((p: { url: string }) => p.url),
    seller: {
      name: listing.seller.name || "Anonymous",
      isVerified: listing.seller.isVerified,
    },
    isFeatured: listing.isFeatured,
  }));
}

async function getItemSuggestions() {
  const requests = await prisma.itemRequest.findMany({
    where: { status: "OPEN" },
    include: {
      requester: true,
      category: true,
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });

  return requests;
}

export default async function HomePage() {
  const [recentListings, itemSuggestions] = await Promise.all([
    getRecentListings(),
    getItemSuggestions(),
  ]);

  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1">
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 py-20 text-white">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm">
                <MessageCircle className="h-4 w-4" />
                <span>Your Campus. Your Voice. Anonymous.</span>
              </div>
              <h1 className="mb-6 text-4xl font-bold tracking-tight sm:text-5xl">
                ComradeZone
              </h1>
              <p className="mb-8 text-lg text-indigo-100">
                The anonymous confession and community platform for university students.
                Share your thoughts, connect with peers, and be heard.
              </p>

              <form action="/marketplace" method="GET" className="mx-auto max-w-xl">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    name="q"
                    placeholder="Search for items..."
                    className="w-full rounded-full border-0 py-4 pl-12 pr-32 text-gray-900 shadow-lg focus:outline-none focus:ring-4 focus:ring-indigo-300"
                  />
                  <button
                    type="submit"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-indigo-600 px-6 py-2 font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    Search
                  </button>
                </div>
              </form>

              <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-indigo-100">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  <span>Verified Sellers</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  <span>M-Pesa Payments</span>
                </div>
                <div className="flex items-center gap-2">
                  <Handshake className="h-4 w-4" />
                  <span>Direct Transactions</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-3xl font-bold text-gray-900">How It Works</h2>
              <p className="text-gray-600">Simple, secure, and hassle-free transactions</p>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
              <div className="rounded-2xl border border-indigo-100 bg-indigo-50/50 p-8">
                <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-indigo-900">
                  <ShoppingBag className="h-6 w-6" />
                  For Sellers
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Register & Get Approved</h4>
                      <p className="text-sm text-gray-600">Create your seller account and wait for broker approval</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">List Your Item</h4>
                      <p className="text-sm text-gray-600">Pay 15% commission upfront and list your item for sale</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Sell & Get Paid</h4>
                      <p className="text-sm text-gray-600">Get paid directly via M-Pesa or bank transfer</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-green-100 bg-green-50/50 p-8">
                <h3 className="mb-6 flex items-center gap-3 text-xl font-bold text-green-900">
                  <Users className="h-6 w-6" />
                  For Buyers
                </h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">1</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Browse & Choose</h4>
                      <p className="text-sm text-gray-600">Browse verified listings and find what you need</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">2</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Contact Seller</h4>
                      <p className="text-sm text-gray-600">Message the seller to arrange delivery details</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-600 text-sm font-bold text-white">3</div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Pay Directly</h4>
                      <p className="text-sm text-gray-600">Pay the seller via M-Pesa or bank transfer</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <Link
                href="/how-it-works"
                className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                Learn more about our process <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {itemSuggestions.length > 0 && (
          <section className="py-16">
            <div className="mx-auto max-w-7xl px-4">
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Item Suggestions</h2>
                  <p className="mt-1 text-gray-600">
                    Items people are looking for – can you help?
                  </p>
                </div>
                <Link
                  href="/requests"
                  className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
                >
                  View all <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {itemSuggestions.map((request: {
                  id: string;
                  title: string;
                  budget: number | null;
                  category: { name: string };
                  requester: { name: string | null } | null;
                  guestName: string | null;
                }) => (
                  <Link
                    key={request.id}
                    href={`/requests/${request.id}`}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 transition-all hover:border-indigo-300 hover:shadow-md"
                  >
                    <h3 className="mb-2 font-medium text-gray-900">{request.title}</h3>
                    {request.budget && (
                      <p className="mb-2 text-lg font-semibold text-indigo-600">
                        Budget: ${request.budget.toFixed(2)}
                      </p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{request.category.name}</span>
                      <span>by {request.requester?.name || request.guestName || "Anonymous"}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        <section className="bg-white py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Recent Listings</h2>
              <Link
                href="/marketplace"
                className="flex items-center gap-1 text-sm font-medium text-indigo-600 hover:text-indigo-700"
              >
                View all <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <ListingGrid
              listings={recentListings}
              emptyMessage="No listings yet. Be the first to post!"
            />
          </div>
        </section>

        <section className="bg-gray-50 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <h2 className="mb-8 text-center text-2xl font-bold text-gray-900">
              Why Use ComradeZone?
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100">
                  <Shield className="h-6 w-6 text-indigo-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Verified Sellers</h3>
                <p className="text-sm text-gray-600">
                  All sellers are verified by the broker before they can list items
                </p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-green-100">
                  <Handshake className="h-6 w-6 text-green-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Direct Payments</h3>
                <p className="text-sm text-gray-600">
                  Pay sellers directly via M-Pesa or bank transfer
                </p>
              </div>
              <div className="rounded-xl bg-white p-6 shadow-sm">
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100">
                  <DollarSign className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="mb-2 font-semibold text-gray-900">Fair Commission</h3>
                <p className="text-sm text-gray-600">
                  15% commission with 50% refund if your item doesn&apos;t sell
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-indigo-600 py-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="rounded-2xl bg-white p-8 shadow-xl md:p-12">
              <div className="grid items-center gap-8 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-3xl font-bold text-gray-900">
                    Ready to Sell?
                  </h2>
                  <p className="mb-4 text-gray-600">
                    List your items with ComradeZone and reach buyers across campus.
                    Pay 15% commission to list, then receive payments directly via M-Pesa.
                  </p>
                  <ul className="mb-6 space-y-2 text-sm text-gray-600">
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      15% commission paid upfront
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      50% refund if item doesn&apos;t sell
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Receive payments directly via M-Pesa
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Verified listings for buyer trust
                    </li>
                  </ul>
                  <Link
                    href="/register"
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-6 py-3 font-medium text-white transition-colors hover:bg-indigo-700"
                  >
                    <Package className="h-5 w-5" />
                    Become a Seller
                  </Link>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <Shield className="mb-2 h-8 w-8 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">M-Pesa Payments</h3>
                    <p className="text-sm text-gray-600">
                      Get paid directly to your M-Pesa
                    </p>
                  </div>
                  <div className="rounded-lg bg-indigo-50 p-4">
                    <DollarSign className="mb-2 h-8 w-8 text-indigo-600" />
                    <h3 className="font-semibold text-gray-900">Fair Refund Policy</h3>
                    <p className="text-sm text-gray-600">
                      Half commission back if no sale
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t bg-white py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="grid gap-6 text-center md:grid-cols-4">
              <div>
                <p className="text-3xl font-bold text-indigo-600">15%</p>
                <p className="text-sm text-gray-600">Commission Rate</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-green-600">50%</p>
                <p className="text-sm text-gray-600">Refund if No Sale</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-purple-600">100%</p>
                <p className="text-sm text-gray-600">Verified Sellers</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-orange-600">24/7</p>
                <p className="text-sm text-gray-600">Support Available</p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
