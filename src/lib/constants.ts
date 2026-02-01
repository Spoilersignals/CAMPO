// Hierarchical categories
export const CATEGORIES = {
  Clothes: ["Men Wear", "Women Wear", "Shoes", "Bags"],
  Electronics: ["TV", "Speaker System", "Fan", "Microwave", "Refrigerator", "Cooker", "Water Heater", "Laptops", "Phones", "Other Electronics"],
} as const;

export const FLAT_CATEGORIES = Object.entries(CATEGORIES).flatMap(([parent, children]) =>
  children.map(child => ({ parent, name: child, slug: child.toLowerCase().replace(/\s+/g, '-') }))
);

// Broker/Commission constants
export const COMMISSION_RATE = 0.15; // 15%
export const REFUND_RATE = 0.5; // 50% refund if sale doesn't happen

export const CONDITIONS = ["New", "Like New", "Good", "Fair", "Poor", "Used"] as const;

export const DELIVERY_METHODS = [
  "Pickup",
  "Delivery",
  "Both",
] as const;

export const LISTING_STATUS = [
  "PENDING_COMMISSION", // Waiting for 15% commission payment
  "PENDING_REVIEW",     // Commission paid, waiting for broker review
  "ACTIVE",             // Approved and visible
  "SOLD",               // Item sold
  "REJECTED",           // Rejected by broker
  "ARCHIVED",           // Removed by seller
] as const;

// ESCROW_STATUS - Kept for future M-Pesa integration
// Currently buyers pay sellers directly via M-Pesa or bank transfer
// export const ESCROW_STATUS = [
//   "HOLDING",    // Broker holding payment
//   "RELEASED",   // Released to seller after delivery
//   "REFUNDED",   // Refunded to buyer
//   "DISPUTED",   // Under dispute
// ] as const;

export const USER_ROLES = ["SELLER", "ADMIN"] as const;

export const SUPPORT_STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;

export const SORT_OPTIONS = [
  { label: "Newest First", value: "createdAt-desc" },
  { label: "Oldest First", value: "createdAt-asc" },
  { label: "Price: Low to High", value: "price-asc" },
  { label: "Price: High to Low", value: "price-desc" },
  { label: "Most Popular", value: "views-desc" },
] as const;

export const ITEMS_PER_PAGE = 12;

export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

// Category icons for the new hierarchical categories
export const CATEGORY_ICONS: Record<string, string> = {
  // Parent categories
  "Clothes": "👕",
  "Electronics": "🔌",
  // Clothes subcategories
  "Men Wear": "👔",
  "Women Wear": "👗",
  "Shoes": "👟",
  "Bags": "👜",
  // Electronics subcategories
  "TV": "📺",
  "Speaker System": "🔊",
  "Fan": "🌀",
  "Microwave": "🍳",
  "Refrigerator": "🧊",
  "Cooker": "🍲",
  "Water Heater": "🚿",
  "Laptops": "💻",
  "Phones": "📱",
  "Other Electronics": "🔌",
};

// Quick category pills for hero section
export const QUICK_CATEGORIES = [
  { name: "Electronics", icon: "🔌", color: "from-blue-500 to-cyan-500" },
  { name: "Clothes", icon: "👕", color: "from-pink-500 to-rose-500" },
  { name: "Laptops", icon: "💻", color: "from-purple-500 to-indigo-500" },
  { name: "Phones", icon: "📱", color: "from-green-500 to-emerald-500" },
  { name: "Shoes", icon: "👟", color: "from-orange-500 to-amber-500" },
  { name: "Bags", icon: "👜", color: "from-fuchsia-500 to-pink-500" },
] as const;

// Category colors for cards
export const CATEGORY_COLORS: Record<string, string> = {
  "Clothes": "from-pink-500 to-rose-500",
  "Electronics": "from-blue-500 to-cyan-500",
  "Men Wear": "from-indigo-500 to-blue-500",
  "Women Wear": "from-pink-500 to-fuchsia-500",
  "Shoes": "from-orange-500 to-amber-500",
  "Bags": "from-purple-500 to-violet-500",
  "TV": "from-slate-600 to-slate-800",
  "Speaker System": "from-red-500 to-orange-500",
  "Fan": "from-cyan-500 to-teal-500",
  "Microwave": "from-amber-500 to-yellow-500",
  "Refrigerator": "from-blue-400 to-blue-600",
  "Cooker": "from-orange-600 to-red-500",
  "Water Heater": "from-sky-400 to-blue-500",
  "Laptops": "from-gray-600 to-gray-800",
  "Phones": "from-green-500 to-emerald-500",
  "Other Electronics": "from-violet-500 to-purple-500",
};

// Types
export type CategoryParent = keyof typeof CATEGORIES;
export type CategoryChild = (typeof CATEGORIES)[CategoryParent][number];
export type Condition = (typeof CONDITIONS)[number];
export type DeliveryMethod = (typeof DELIVERY_METHODS)[number];
export type ListingStatus = (typeof LISTING_STATUS)[number];
// export type EscrowStatus = (typeof ESCROW_STATUS)[number];
export type UserRole = (typeof USER_ROLES)[number];
export type SupportStatus = (typeof SUPPORT_STATUS)[number];
