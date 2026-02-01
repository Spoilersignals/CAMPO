"use client";

import { useState, useEffect, useTransition } from "react";
import Image from "next/image";
import { 
  CheckCircle2, 
  XCircle, 
  Package, 
  User, 
  Tag, 
  MapPin,
  Clock,
  Phone,
  Mail,
  Sparkles,
  ImageIcon,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { getPendingListings, approveListing, rejectListing } from "@/actions/admin-listings";

type Listing = {
  id: string;
  title: string;
  description: string | null;
  price: number;
  condition: string;
  usageDuration: string | null;
  deliveryMethod: string;
  pickupLocation: string | null;
  createdAt: Date;
  seller: {
    id: string;
    name: string | null;
    email: string;
    image: string | null;
    phone: string | null;
  };
  photos: Array<{ id: string; url: string; sortOrder: number }>;
  category: { id: string; name: string; slug: string };
};

const conditionColors: Record<string, string> = {
  NEW: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  LIKE_NEW: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  GOOD: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  FAIR: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

const deliveryIcons: Record<string, string> = {
  CAMPUS_MEET: "🏫",
  HOSTEL_DELIVERY: "🏠",
  PICKUP: "📍",
};

function ListingCard({ 
  listing, 
  onApprove, 
  onReject,
  isPending,
}: { 
  listing: Listing;
  onApprove: () => void;
  onReject: () => void;
  isPending: boolean;
}) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const photos = listing.photos;

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  return (
    <Card className="group overflow-hidden border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl transition-all duration-500 hover:shadow-purple-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-pink-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      
      <CardHeader className="relative border-b border-white/10 bg-gradient-to-r from-purple-900/30 to-indigo-900/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <CardTitle className="text-xl font-bold text-white">
              {listing.title}
            </CardTitle>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <Badge className={`${conditionColors[listing.condition]} border`}>
                {listing.condition.replace("_", " ")}
              </Badge>
              <Badge className="border border-purple-500/30 bg-purple-500/20 text-purple-300">
                <Tag className="mr-1 h-3 w-3" />
                {listing.category.name}
              </Badge>
              <Badge className="border border-cyan-500/30 bg-cyan-500/20 text-cyan-300">
                {deliveryIcons[listing.deliveryMethod]} {listing.deliveryMethod.replace("_", " ")}
              </Badge>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-400">
              KES {listing.price.toLocaleString()}
            </p>
            <p className="mt-1 flex items-center justify-end gap-1 text-sm text-gray-400">
              <Clock className="h-3 w-3" />
              {new Date(listing.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative p-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Photo Gallery */}
          <div className="relative">
            {photos.length > 0 ? (
              <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-800">
                <Image
                  src={photos[currentPhotoIndex].url}
                  alt={listing.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {photos.length > 1 && (
                  <>
                    <button
                      onClick={prevPhoto}
                      className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <button
                      onClick={nextPhoto}
                      className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white backdrop-blur-sm transition-all hover:bg-black/70"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </button>
                    <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1">
                      {photos.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentPhotoIndex(index)}
                          className={`h-2 w-2 rounded-full transition-all ${
                            index === currentPhotoIndex
                              ? "w-4 bg-white"
                              : "bg-white/50 hover:bg-white/70"
                          }`}
                        />
                      ))}
                    </div>
                  </>
                )}
                <div className="absolute right-2 top-2 rounded-full bg-black/50 px-2 py-1 text-xs text-white backdrop-blur-sm">
                  {currentPhotoIndex + 1}/{photos.length}
                </div>
              </div>
            ) : (
              <div className="flex aspect-square items-center justify-center rounded-xl bg-gray-800">
                <ImageIcon className="h-16 w-16 text-gray-600" />
              </div>
            )}
            
            {/* Photo Thumbnails */}
            {photos.length > 1 && (
              <div className="mt-2 flex gap-2 overflow-x-auto pb-2">
                {photos.map((photo, index) => (
                  <button
                    key={photo.id}
                    onClick={() => setCurrentPhotoIndex(index)}
                    className={`relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-lg transition-all ${
                      index === currentPhotoIndex
                        ? "ring-2 ring-purple-500 ring-offset-2 ring-offset-gray-900"
                        : "opacity-60 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={photo.url}
                      alt={`${listing.title} ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
          
          {/* Details */}
          <div className="space-y-4">
            {/* Description */}
            {listing.description && (
              <div className="rounded-lg bg-white/5 p-4">
                <h4 className="mb-2 text-sm font-medium text-gray-400">Description</h4>
                <p className="text-gray-300">
                  {listing.description.length > 200
                    ? `${listing.description.slice(0, 200)}...`
                    : listing.description}
                </p>
              </div>
            )}
            
            {/* Usage Duration */}
            {listing.usageDuration && (
              <div className="rounded-lg bg-white/5 p-4">
                <h4 className="mb-1 text-sm font-medium text-gray-400">Usage Duration</h4>
                <p className="text-gray-300">{listing.usageDuration}</p>
              </div>
            )}
            
            {/* Pickup Location */}
            {listing.pickupLocation && (
              <div className="flex items-start gap-2 rounded-lg bg-white/5 p-4">
                <MapPin className="mt-0.5 h-4 w-4 text-gray-400" />
                <div>
                  <h4 className="text-sm font-medium text-gray-400">Pickup Location</h4>
                  <p className="text-gray-300">{listing.pickupLocation}</p>
                </div>
              </div>
            )}
            
            {/* Seller Info */}
            <div className="rounded-lg bg-gradient-to-br from-purple-900/30 to-indigo-900/30 p-4">
              <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-gray-400">
                <User className="h-4 w-4" />
                Seller Information
              </h4>
              <div className="flex items-center gap-3">
                {listing.seller.image ? (
                  <Image
                    src={listing.seller.image}
                    alt={listing.seller.name || "Seller"}
                    width={48}
                    height={48}
                    className="rounded-full ring-2 ring-purple-500/50"
                  />
                ) : (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
                    <User className="h-6 w-6 text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-medium text-white">
                    {listing.seller.name || "Unknown Seller"}
                  </p>
                  <div className="mt-1 flex flex-wrap gap-3 text-sm text-gray-400">
                    <span className="flex items-center gap-1">
                      <Mail className="h-3 w-3" />
                      {listing.seller.email}
                    </span>
                    {listing.seller.phone && (
                      <span className="flex items-center gap-1">
                        <Phone className="h-3 w-3" />
                        {listing.seller.phone}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="mt-6 flex gap-3">
          <Button
            onClick={onApprove}
            disabled={isPending}
            className="flex-1 gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/25 transition-all duration-300 hover:from-green-600 hover:to-emerald-600 hover:shadow-green-500/40 hover:-translate-y-0.5"
          >
            <CheckCircle2 className="h-4 w-4" />
            {isPending ? "Processing..." : "Approve Listing"}
          </Button>
          <Button
            onClick={onReject}
            disabled={isPending}
            className="flex-1 gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg shadow-red-500/25 transition-all duration-300 hover:from-red-600 hover:to-rose-600 hover:shadow-red-500/40 hover:-translate-y-0.5"
          >
            <XCircle className="h-4 w-4" />
            Reject Listing
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function AdminPendingListingsPage() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedListingId, setSelectedListingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function loadListings() {
    try {
      const data = await getPendingListings();
      setListings(data as Listing[]);
    } catch (error) {
      console.error("Failed to load listings:", error);
      setToast({ message: "Failed to load listings", type: "error" });
    } finally {
      setIsLoading(false);
    }
  }

  function handleApprove(listingId: string) {
    startTransition(async () => {
      try {
        await approveListing(listingId);
        setListings((prev) => prev.filter((l) => l.id !== listingId));
        setToast({ message: "Listing approved successfully!", type: "success" });
      } catch (error) {
        console.error("Failed to approve:", error);
        setToast({ message: "Failed to approve listing", type: "error" });
      }
    });
  }

  function openRejectModal(listingId: string) {
    setSelectedListingId(listingId);
    setShowRejectModal(true);
  }

  function handleReject() {
    if (!selectedListingId) return;
    
    startTransition(async () => {
      try {
        await rejectListing(selectedListingId, rejectReason || undefined);
        setListings((prev) => prev.filter((l) => l.id !== selectedListingId));
        setShowRejectModal(false);
        setRejectReason("");
        setSelectedListingId(null);
        setToast({ message: "Listing rejected", type: "success" });
      } catch (error) {
        console.error("Failed to reject:", error);
        setToast({ message: "Failed to reject listing", type: "error" });
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-purple-950/20 to-gray-950">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 h-80 w-80 rounded-full bg-purple-500/10 blur-3xl animate-pulse" />
        <div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-pink-500/10 blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 h-60 w-60 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl animate-pulse delay-500" />
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 p-3 shadow-lg shadow-purple-500/25">
              <Package className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-pink-200">
                Pending Listings
              </h1>
              <p className="text-gray-400">Review and approve marketplace listings</p>
            </div>
          </div>
          
          <div className="mt-4 flex items-center gap-3">
            <Badge className="border border-amber-500/30 bg-amber-500/20 px-4 py-2 text-lg text-amber-300">
              <Sparkles className="mr-2 h-4 w-4" />
              {listings.length} pending
            </Badge>
          </div>
        </div>

        {/* Toast Notification */}
        {toast && (
          <div
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 rounded-lg px-6 py-4 shadow-2xl backdrop-blur-sm transition-all duration-500 animate-in slide-in-from-right ${
              toast.type === "success"
                ? "bg-green-500/90 text-white"
                : "bg-red-500/90 text-white"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <XCircle className="h-5 w-5" />
            )}
            {toast.message}
          </div>
        )}

        {/* Content */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="h-12 w-12 animate-spin rounded-full border-4 border-purple-500/30 border-t-purple-500" />
            <p className="mt-4 text-gray-400">Loading listings...</p>
          </div>
        ) : listings.length === 0 ? (
          <Card className="border-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl">
            <CardContent className="flex flex-col items-center justify-center py-20">
              <div className="mb-4 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20 p-6">
                <Package className="h-12 w-12 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white">No Pending Listings</h3>
              <p className="mt-2 text-gray-400">All listings have been reviewed. Check back later!</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                onApprove={() => handleApprove(listing.id)}
                onReject={() => openRejectModal(listing.id)}
                isPending={isPending}
              />
            ))}
          </div>
        )}

        {/* Reject Modal */}
        <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
          <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-xl">
            <ModalHeader className="border-b border-white/10">
              <ModalTitle className="text-white">Reject Listing</ModalTitle>
            </ModalHeader>
            <div className="p-6">
              <Textarea
                label="Rejection Reason (optional)"
                placeholder="Explain why this listing is being rejected..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                className="bg-white/5 border-white/10 text-white placeholder:text-gray-500"
              />
            </div>
            <ModalFooter className="border-t border-white/10">
              <Button 
                variant="outline" 
                onClick={() => setShowRejectModal(false)}
                className="border-white/20 text-gray-300 hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={handleReject}
                disabled={isPending}
                className="gap-2 bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600"
              >
                <XCircle className="h-4 w-4" />
                {isPending ? "Rejecting..." : "Reject Listing"}
              </Button>
            </ModalFooter>
          </div>
        </Modal>
      </div>
    </div>
  );
}
