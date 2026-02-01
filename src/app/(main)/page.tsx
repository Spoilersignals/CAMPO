import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Heart,
  ShoppingBag,
  Camera,
  ArrowRight,
  Shield,
  Lock,
  Users,
  Sparkles,
  TrendingUp,
  Clock,
  ChevronRight,
  Zap,
  Star,
  MessageCircle,
  Lightbulb,
  HandHeart,
  Play,
  Video,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

type Listing = {
  id: string;
  title: string;
  price: number;
  condition: string;
  photos: { url: string }[];
  seller: { name: string | null };
  createdAt: Date;
};

type Confession = {
  id: string;
  content: string;
  confessionNumber: number | null;
  createdAt: Date;
  _count: { reactions: number; comments: number };
};

type Stats = {
  totalPosts: number;
  activeUsers: number;
  itemsListed: number;
  messagesSent: number;
};

type Suggestion = {
  id: string;
  content: string;
  userName: string | null;
  createdAt: Date;
  expiresAt: Date;
  _count: { responses: number };
};

type VideoPreview = {
  id: string;
  thumbnailUrl: string | null;
  caption: string | null;
  duration: number;
  viewCount: number;
  user: { name: string | null; image: string | null };
  _count: { likes: number; comments: number };
};

async function getMarketplaceListings(): Promise<Listing[]> {
  return prisma.listing.findMany({
    where: { status: "ACTIVE" },
    include: {
      photos: { take: 1, orderBy: { sortOrder: "asc" } },
      seller: { select: { name: true } },
    },
    take: 6,
    orderBy: { createdAt: "desc" },
  });
}

async function getLatestConfessions(): Promise<Confession[]> {
  return prisma.confession.findMany({
    where: { status: "APPROVED" },
    include: {
      _count: { select: { reactions: true, comments: true } },
    },
    take: 5,
    orderBy: { createdAt: "desc" },
  });
}

async function getStats(): Promise<Stats> {
  const [confessions, crushes, spotted, listings, messages, users] =
    await Promise.all([
      prisma.confession.count({ where: { status: "APPROVED" } }),
      prisma.campusCrush.count({ where: { status: "APPROVED" } }),
      prisma.spotted.count({ where: { status: "APPROVED" } }),
      prisma.listing.count({ where: { status: "ACTIVE" } }),
      prisma.chatMessage.count(),
      prisma.user.count(),
    ]);

  return {
    totalPosts: confessions + crushes + spotted,
    activeUsers: users,
    itemsListed: listings,
    messagesSent: messages,
  };
}

async function getActiveSuggestions(): Promise<Suggestion[]> {
  const suggestions = await prisma.itemSuggestion.findMany({
    where: {
      status: "ACTIVE",
      expiresAt: { gt: new Date() },
    },
    include: {
      user: { select: { name: true } },
      _count: { select: { responses: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  return suggestions.map((s) => ({
    id: s.id,
    content: s.content,
    userName: s.user?.name || null,
    createdAt: s.createdAt,
    expiresAt: s.expiresAt,
    _count: s._count,
  }));
}

async function getVideoPreview(): Promise<VideoPreview[]> {
  const videos = await prisma.videoPost.findMany({
    where: { status: "ACTIVE" },
    include: {
      user: { select: { name: true, image: true } },
      _count: { select: { likes: true, comments: true } },
    },
    orderBy: { viewCount: "desc" },
    take: 6,
  });

  return videos.map((v) => ({
    id: v.id,
    thumbnailUrl: v.thumbnailUrl,
    caption: v.caption,
    duration: v.duration,
    viewCount: v.viewCount,
    user: v.user,
    _count: v._count,
  }));
}

function AnimatedCounter({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <div className="text-3xl font-bold text-white sm:text-4xl md:text-5xl animate-count-up">
        {value.toLocaleString()}+
      </div>
      <div className="text-sm text-purple-200 mt-1">{label}</div>
    </div>
  );
}

function QuickAccessCard({
  href,
  icon: Icon,
  emoji,
  title,
  subtitle,
  gradient,
  delay,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
  title: string;
  subtitle: string;
  gradient: string;
  delay: number;
}) {
  return (
    <Link
      href={href}
      className={`group relative overflow-hidden rounded-2xl ${gradient} p-5 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 card-shine opacity-0 animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/10 blur-2xl transition-all group-hover:bg-white/20" />
      <div className="relative z-10">
        <div className="mb-3 flex items-center gap-2">
          <span className="text-3xl">{emoji}</span>
          <Icon className="h-6 w-6 text-white/80" />
        </div>
        <h3 className="text-lg font-bold text-white">{title}</h3>
        <p className="text-sm text-white/70">{subtitle}</p>
        <div className="mt-3 flex items-center gap-1 text-sm font-medium text-white/90 transition-all group-hover:translate-x-1">
          Explore <ChevronRight className="h-4 w-4" />
        </div>
      </div>
    </Link>
  );
}

function ProductCard({ listing, index }: { listing: Listing; index: number }) {
  const photoUrl = listing.photos[0]?.url || "/placeholder-product.png";

  return (
    <Link
      href={`/marketplace/${listing.id}`}
      className={`group flex-shrink-0 w-[200px] overflow-hidden rounded-xl bg-white shadow-md transition-all duration-300 hover:shadow-xl hover:-translate-y-1 opacity-0 animate-slide-up stagger-${index + 1}`}
      style={{ animationFillMode: "forwards" }}
    >
      <div className="relative aspect-square overflow-hidden bg-gray-100">
        <Image
          src={photoUrl}
          alt={listing.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-110"
        />
        <div className="absolute top-2 right-2 rounded-full bg-green-500 px-2 py-0.5 text-xs font-medium text-white">
          {listing.condition}
        </div>
      </div>
      <div className="p-3">
        <h4 className="truncate font-semibold text-gray-900">{listing.title}</h4>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-lg font-bold text-purple-600">
            Ksh {listing.price.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 text-xs text-gray-500">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            Verified
          </span>
        </div>
        <div className="mt-2 text-xs text-gray-400">
          by {listing.seller.name || "Seller"}
        </div>
      </div>
    </Link>
  );
}

function ProductSkeleton() {
  return (
    <div className="flex-shrink-0 w-[200px] overflow-hidden rounded-xl bg-white shadow-md">
      <div className="aspect-square bg-gray-200 animate-skeleton" />
      <div className="p-3 space-y-2">
        <div className="h-4 w-3/4 rounded bg-gray-200 animate-skeleton" />
        <div className="h-5 w-1/2 rounded bg-gray-200 animate-skeleton" />
        <div className="h-3 w-1/3 rounded bg-gray-200 animate-skeleton" />
      </div>
    </div>
  );
}

function ConfessionCard({
  confession,
  index,
}: {
  confession: Confession;
  index: number;
}) {
  return (
    <Link
      href={`/confessions/${confession.id}`}
      className={`block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-purple-200 opacity-0 animate-slide-up`}
      style={{
        animationDelay: `${index * 100}ms`,
        animationFillMode: "forwards",
      }}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-indigo-600">
          <MessageSquare className="h-5 w-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-semibold text-purple-600">
              Confession #{confession.confessionNumber || "?"}
            </span>
            <span className="text-gray-300">·</span>
            <span className="text-xs text-gray-500">
              {formatDistanceToNow(confession.createdAt, { addSuffix: true })}
            </span>
          </div>
          <p className="text-gray-700 line-clamp-2">{confession.content}</p>
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Heart className="h-3.5 w-3.5" />
              {confession._count.reactions}
            </span>
            <span className="flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" />
              {confession._count.comments}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  delay,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  delay: number;
}) {
  return (
    <div
      className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 opacity-0 animate-slide-up`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 transition-transform group-hover:scale-110">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900">{title}</h3>
      <p className="text-sm text-gray-600">{description}</p>
    </div>
  );
}

function VideoPreviewCard({ video, index }: { video: VideoPreview; index: number }) {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatViews = (count: number) => {
    if (count >= 1000000) return `${(count / 1000000).toFixed(1)}M`;
    if (count >= 1000) return `${(count / 1000).toFixed(1)}K`;
    return count.toString();
  };

  return (
    <Link
      href="/videos"
      className={`group flex-shrink-0 w-[160px] sm:w-[180px] overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 to-black shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 hover:scale-105 opacity-0 animate-slide-up`}
      style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
    >
      <div className="relative aspect-[9/16] overflow-hidden">
        {video.thumbnailUrl ? (
          <Image
            src={video.thumbnailUrl}
            alt={video.caption || "Video"}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-purple-600 to-pink-600">
            <Video className="h-12 w-12 text-white/50" />
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100">
          <div className="rounded-full bg-white/30 p-3 backdrop-blur-sm">
            <Play className="h-8 w-8 text-white" fill="white" />
          </div>
        </div>
        
        {/* Duration badge */}
        <div className="absolute bottom-2 right-2 rounded-md bg-black/70 px-1.5 py-0.5 text-xs font-medium text-white">
          {formatDuration(video.duration)}
        </div>
        
        {/* Stats overlay at bottom */}
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-3">
          <div className="flex items-center gap-3 text-xs text-white/90">
            <span className="flex items-center gap-1">
              <Play className="h-3 w-3" />
              {formatViews(video.viewCount)}
            </span>
            <span className="flex items-center gap-1">
              <Heart className="h-3 w-3" />
              {formatViews(video._count.likes)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default async function HomePage() {
  const [listings, confessions, stats, suggestions, videos] = await Promise.all([
    getMarketplaceListings(),
    getLatestConfessions(),
    getStats(),
    getActiveSuggestions(),
    getVideoPreview(),
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 animate-gradient">
        {/* Animated floating blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -left-20 h-64 w-64 rounded-full bg-pink-500/30 blur-3xl animate-float animate-morph" />
          <div className="absolute top-1/4 -right-20 h-72 w-72 rounded-full bg-yellow-500/20 blur-3xl animate-float-delayed" />
          <div className="absolute -bottom-32 left-1/3 h-80 w-80 rounded-full bg-blue-500/25 blur-3xl animate-float-slow" />
          <div className="absolute top-1/2 left-1/4 h-40 w-40 rounded-full bg-cyan-400/20 blur-2xl animate-float" />
          
          {/* Floating decorative shapes */}
          <div className="absolute top-16 right-[10%] h-4 w-4 rounded-full bg-white/40 animate-float" />
          <div className="absolute top-32 left-[15%] h-3 w-3 rounded-full bg-pink-300/50 animate-float-delayed" />
          <div className="absolute bottom-24 right-[20%] h-5 w-5 rounded-full bg-yellow-300/40 animate-float-slow" />
          <div className="absolute top-[40%] right-[25%] h-2 w-2 rounded-full bg-white/60 animate-sparkle" />
          <div className="absolute bottom-[30%] left-[30%] h-3 w-3 rounded-full bg-cyan-200/50 animate-sparkle" style={{ animationDelay: "1s" }} />
          
          {/* Large rotating circle decoration */}
          <div className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full border border-white/10 animate-rotate-slow" />
          <div className="absolute -bottom-32 -right-32 h-64 w-64 rounded-full border border-white/5 animate-rotate-slow" style={{ animationDirection: "reverse" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-16 sm:py-24 md:py-32">
          {/* Trust badges */}
          <div className="mb-8 flex flex-wrap justify-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm font-medium text-white">
              <Shield className="h-4 w-4" />
              100% Anonymous
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm font-medium text-white">
              <Lock className="h-4 w-4" />
              No Login Required
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full glass px-4 py-2 text-sm font-medium text-white">
              <Zap className="h-4 w-4" />
              Instant Access
            </span>
          </div>

          {/* Headline with gradient text */}
          <h1 className="text-center opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <span className="block text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
              Your Campus,
            </span>
            <span className="mt-2 block text-4xl font-extrabold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
              <span className="bg-gradient-to-r from-pink-300 via-yellow-200 to-cyan-300 bg-clip-text text-transparent animate-text-shimmer bg-[length:200%_200%]">
                Uncensored
              </span>
            </span>
          </h1>

          {/* Subheadline */}
          <p className="mx-auto mt-6 max-w-2xl text-center text-lg text-purple-100 sm:text-xl opacity-0 animate-slide-up" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            Buy, sell, confess, and connect with your campus community.
            <span className="block mt-1 text-purple-200/80">
              Everything you need, completely anonymous.
            </span>
          </p>

          {/* CTA Buttons */}
          <div className="mt-10 flex flex-wrap justify-center gap-4 opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <Link
              href="/marketplace"
              className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
              <ShoppingBag className="h-5 w-5" />
              Explore Marketplace
              <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Link>
            <Link
              href="/confessions/new"
              className="inline-flex items-center gap-2 rounded-full glass px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              <MessageSquare className="h-5 w-5" />
              Share Confession
            </Link>
          </div>

          {/* Stats counters */}
          <div className="mt-16 grid grid-cols-2 gap-6 sm:grid-cols-4 opacity-0 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            <AnimatedCounter value={stats.totalPosts} label="Total Posts" />
            <AnimatedCounter value={stats.activeUsers} label="Active Users" />
            <AnimatedCounter value={stats.itemsListed} label="Items Listed" />
            <AnimatedCounter value={stats.messagesSent} label="Messages Sent" />
          </div>
        </div>
      </section>

      {/* Quick Access Cards */}
      <section className="relative -mt-8 z-20 mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <QuickAccessCard
            href="/marketplace"
            icon={ShoppingBag}
            emoji="🛍️"
            title="Marketplace"
            subtitle="Buy & Sell"
            gradient="bg-gradient-to-br from-emerald-500 to-teal-600"
            delay={500}
          />
          <QuickAccessCard
            href="/confessions"
            icon={MessageSquare}
            emoji="💬"
            title="Confessions"
            subtitle="Share Secrets"
            gradient="bg-gradient-to-br from-purple-500 to-indigo-600"
            delay={600}
          />
          <QuickAccessCard
            href="/dating"
            icon={Heart}
            emoji="❤️"
            title="Dating"
            subtitle="Find Love"
            gradient="bg-gradient-to-br from-pink-500 to-rose-600"
            delay={700}
          />
          <QuickAccessCard
            href="/stories"
            icon={Camera}
            emoji="📸"
            title="Stories"
            subtitle="24hr Posts"
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
            delay={800}
          />
        </div>
      </section>

      {/* For You - Video Feed Preview */}
      {videos.length > 0 && (
        <section className="mt-12 py-12 bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 overflow-hidden">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 shadow-lg shadow-pink-500/30">
                  <Play className="h-5 w-5 text-white" fill="white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">For You</h2>
                  <p className="text-sm text-purple-300">Trending videos on campus</p>
                </div>
              </div>
              <Link
                href="/videos"
                className="flex items-center gap-1 rounded-full bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-all hover:bg-white/20"
              >
                Watch All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="relative">
              <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
                {videos.map((video, index) => (
                  <VideoPreviewCard key={video.id} video={video} index={index} />
                ))}
              </div>
              <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>
      )}

      {/* Item Suggestions - I Need Section */}
      {suggestions.length > 0 && (
        <section className="py-12 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="mx-auto max-w-6xl px-4">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/30">
                  <Lightbulb className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">People Are Looking For</h2>
                  <p className="text-sm text-gray-600">Help someone find what they need</p>
                </div>
              </div>
              <Link
                href="/suggestions"
                className="flex items-center gap-1 text-sm font-medium text-amber-600 transition-colors hover:text-amber-700"
              >
                View All <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suggestions.slice(0, 6).map((suggestion, index) => (
                <Link
                  key={suggestion.id}
                  href={`/suggestions/${suggestion.id}`}
                  className={`group rounded-xl border border-amber-200 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-300 hover:-translate-y-1 opacity-0 animate-slide-up`}
                  style={{ animationDelay: `${index * 100}ms`, animationFillMode: "forwards" }}
                >
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-100 to-orange-100">
                      <HandHeart className="h-5 w-5 text-amber-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-900 font-medium line-clamp-2">&quot;{suggestion.content}&quot;</p>
                      <div className="mt-2 flex items-center gap-3 text-xs text-gray-500">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Expires {formatDistanceToNow(suggestion.expiresAt, { addSuffix: true })}
                        </span>
                        {suggestion._count.responses > 0 && (
                          <span className="rounded-full bg-green-100 px-2 py-0.5 text-green-700">
                            {suggestion._count.responses} offers
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 flex justify-end">
                    <span className="text-xs font-medium text-amber-600 group-hover:text-amber-700 transition-colors">
                      I have this →
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Live Marketplace Preview */}
      <section className="mt-0 py-12 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-900">Hot Deals Right Now</h2>
              <span className="ml-2 animate-pulse rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-600">
                LIVE
              </span>
            </div>
            <Link
              href="/marketplace"
              className="flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
            >
              View All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
              {listings.length > 0
                ? listings.map((listing, index) => (
                    <ProductCard key={listing.id} listing={listing} index={index} />
                  ))
                : Array.from({ length: 6 }).map((_, i) => (
                    <ProductSkeleton key={i} />
                  ))}
            </div>
            {/* Gradient fade on edges */}
            <div className="absolute right-0 top-0 bottom-4 w-20 bg-gradient-to-l from-white to-transparent pointer-events-none" />
          </div>

          {listings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No listings yet. Be the first to sell!</p>
              <Link
                href="/marketplace/sell"
                className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-700"
              >
                <ShoppingBag className="h-4 w-4" />
                Start Selling
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Latest Confessions Feed */}
      <section className="py-12 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">Latest Confessions</h2>
            </div>
            <Link
              href="/confessions"
              className="flex items-center gap-1 text-sm font-medium text-purple-600 transition-colors hover:text-purple-700"
            >
              See More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-3">
            {confessions.length > 0 ? (
              confessions.map((confession, index) => (
                <ConfessionCard key={confession.id} confession={confession} index={index} />
              ))
            ) : (
              <div className="rounded-xl border border-dashed border-gray-300 bg-white p-8 text-center">
                <MessageSquare className="mx-auto h-12 w-12 text-gray-300" />
                <p className="mt-4 text-gray-500">No confessions yet. Be the first!</p>
                <Link
                  href="/confessions/new"
                  className="mt-4 inline-flex items-center gap-2 rounded-full bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-purple-700"
                >
                  <Sparkles className="h-4 w-4" />
                  Make a Confession
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Campus Stats Section */}
      <section className="relative py-16 overflow-hidden bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
        <div className="absolute inset-0 pattern-dots opacity-30" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/50 to-transparent" />
        
        <div className="relative z-10 mx-auto max-w-6xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Campus in Numbers</h2>
          <p className="text-purple-200 mb-10">Join thousands of students already connected</p>
          
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <div className="group">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-purple-500/20 transition-all group-hover:bg-purple-500/30 group-hover:scale-110">
                <TrendingUp className="h-8 w-8 text-purple-400" />
              </div>
              <div className="text-3xl font-bold text-white sm:text-4xl animate-count-up">
                {stats.totalPosts.toLocaleString()}
              </div>
              <div className="text-sm text-purple-300">Total Posts</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-pink-500/20 transition-all group-hover:bg-pink-500/30 group-hover:scale-110">
                <Users className="h-8 w-8 text-pink-400" />
              </div>
              <div className="text-3xl font-bold text-white sm:text-4xl animate-count-up">
                {stats.activeUsers.toLocaleString()}
              </div>
              <div className="text-sm text-pink-300">Active Users</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/20 transition-all group-hover:bg-emerald-500/30 group-hover:scale-110">
                <ShoppingBag className="h-8 w-8 text-emerald-400" />
              </div>
              <div className="text-3xl font-bold text-white sm:text-4xl animate-count-up">
                {stats.itemsListed.toLocaleString()}
              </div>
              <div className="text-sm text-emerald-300">Items Listed</div>
            </div>
            <div className="group">
              <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-500/20 transition-all group-hover:bg-amber-500/30 group-hover:scale-110">
                <MessageCircle className="h-8 w-8 text-amber-400" />
              </div>
              <div className="text-3xl font-bold text-white sm:text-4xl animate-count-up">
                {stats.messagesSent.toLocaleString()}
              </div>
              <div className="text-sm text-amber-300">Messages Sent</div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Why Students Love Us</h2>
            <p className="mt-2 text-gray-600">Built for campus life, designed for privacy</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            <FeatureCard
              icon={Shield}
              title="100% Anonymous"
              description="Your identity is never stored or shared. Post freely without fear of judgment."
              delay={100}
            />
            <FeatureCard
              icon={Lock}
              title="Secure & Private"
              description="End-to-end encryption ensures your confessions and messages stay private."
              delay={200}
            />
            <FeatureCard
              icon={Users}
              title="Campus Only"
              description="Connect exclusively with students from your university community."
              delay={300}
            />
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 bg-gradient-to-br from-purple-600 to-indigo-700 overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-pink-500/20 blur-3xl animate-float" />
          <div className="absolute -bottom-20 -left-20 h-64 w-64 rounded-full bg-cyan-500/20 blur-3xl animate-float-delayed" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4">
            Ready to Join Your Campus Community?
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Start confessing, shopping, and connecting — all anonymously.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/confessions/new"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105"
            >
              <Sparkles className="h-5 w-5" />
              Make Your First Confession
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full glass px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105"
            >
              <ShoppingBag className="h-5 w-5" />
              Browse Marketplace
            </Link>
          </div>
        </div>
      </section>

      {/* Footer spacer */}
      <div className="h-8 bg-gray-50" />
    </div>
  );
}
