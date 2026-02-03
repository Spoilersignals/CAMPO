import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Heart,
  ShoppingBag,
  ArrowRight,
  Shield,
  Lock,
  Users,
  Sparkles,
  TrendingUp,
  ChevronRight,
  Zap,
  Star,
  MessageCircle,
  Lightbulb,
  HandHeart,
  Play,
  Video,
  Camera,
  Clock,
  ChevronDown,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";
import { ForYouFeed } from "@/components/for-you-feed";
import { FloatingCreateButton } from "@/components/floating-create-button";

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
          <span className="text-lg font-bold text-blue-600">
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
      className={`block rounded-xl border border-gray-100 bg-white p-4 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-purple-200 opacity-0 animate-slide-up card-glow-hover`}
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
      className={`group rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition-all duration-300 hover:shadow-xl hover:border-purple-200 hover:-translate-y-1 opacity-0 animate-slide-up card-glow-hover`}
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200 transition-transform group-hover:scale-110 group-hover:shadow-purple-300/50">
        <Icon className="h-6 w-6 text-white" />
      </div>
      <h3 className="mb-2 text-lg font-bold text-gray-900 group-hover:text-purple-700 transition-colors">{title}</h3>
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
      {/* Floating Create Button */}
      <FloatingCreateButton />

      {/* Hero Section - Premium & Dynamic */}
      <section className="relative overflow-hidden bg-mesh bg-noise min-h-[90vh] flex flex-col justify-center">
        {/* Multi-layered animated gradient background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-purple-950/80 to-slate-950" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_120%_80%_at_50%_-30%,rgba(139,92,246,0.4),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_80%_40%,rgba(236,72,153,0.2),transparent)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_20%_80%,rgba(59,130,246,0.2),transparent)]" />
          <div className="absolute inset-0 bg-[conic-gradient(from_180deg_at_50%_50%,rgba(139,92,246,0.1)_0deg,transparent_60deg,rgba(236,72,153,0.1)_120deg,transparent_180deg,rgba(245,158,11,0.1)_240deg,transparent_300deg,rgba(139,92,246,0.1)_360deg)] animate-rotate-slow" style={{ animationDuration: "60s" }} />
        </div>

        {/* Enhanced animated grid with perspective */}
        <div className="absolute inset-0 hero-grid-pattern opacity-[0.15]" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(139,92,246,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(139,92,246,0.03)_1px,transparent_1px)] bg-[size:60px_60px]" />

        {/* Premium floating orbs using globals.css classes */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {/* Primary gradient orbs */}
          <div className="orb-1 -top-20 -left-20 glow-purple" />
          <div className="orb-2 top-1/4 -right-16 glow-amber" />
          <div className="orb-3 -bottom-32 left-1/3" />
          
          {/* Secondary accent orbs with enhanced blur */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[800px] w-[800px] rounded-full bg-gradient-to-br from-purple-600/20 via-pink-500/10 to-amber-500/5 blur-[150px] animate-morph" />
          <div className="absolute top-10 right-1/4 h-40 w-40 rounded-full bg-gradient-to-br from-amber-400/30 to-orange-500/20 blur-3xl animate-float glow-amber" />
          <div className="absolute bottom-32 left-1/4 h-32 w-32 rounded-full bg-gradient-to-br from-cyan-400/30 to-blue-500/20 blur-2xl animate-float-delayed" />
          <div className="absolute top-1/3 left-10 h-24 w-24 rounded-full bg-gradient-to-br from-pink-400/25 to-purple-500/15 blur-xl animate-float-slow" />
          
          {/* Enhanced sparkle particles with varied sizes */}
          <div className="absolute top-[12%] left-[18%] h-3 w-3 rounded-full bg-white/90 animate-sparkle shadow-[0_0_10px_rgba(255,255,255,0.8)]" />
          <div className="absolute top-[22%] right-[12%] h-2 w-2 rounded-full bg-purple-300 animate-sparkle shadow-[0_0_8px_rgba(168,85,247,0.8)]" style={{ animationDelay: "0.3s" }} />
          <div className="absolute top-[55%] left-[8%] h-2.5 w-2.5 rounded-full bg-pink-300 animate-sparkle shadow-[0_0_8px_rgba(244,114,182,0.8)]" style={{ animationDelay: "0.7s" }} />
          <div className="absolute bottom-[22%] right-[22%] h-2 w-2 rounded-full bg-amber-200 animate-sparkle shadow-[0_0_8px_rgba(253,230,138,0.8)]" style={{ animationDelay: "1.2s" }} />
          <div className="absolute top-[35%] right-[6%] h-3.5 w-3.5 rounded-full bg-white/80 animate-sparkle shadow-[0_0_12px_rgba(255,255,255,0.9)]" style={{ animationDelay: "1.8s" }} />
          <div className="absolute top-[45%] left-[25%] h-1.5 w-1.5 rounded-full bg-cyan-300 animate-sparkle shadow-[0_0_6px_rgba(103,232,249,0.8)]" style={{ animationDelay: "2.2s" }} />
          <div className="absolute bottom-[35%] left-[15%] h-2 w-2 rounded-full bg-violet-300 animate-sparkle shadow-[0_0_8px_rgba(196,181,253,0.8)]" style={{ animationDelay: "2.7s" }} />
          <div className="absolute top-[18%] left-[45%] h-1.5 w-1.5 rounded-full bg-rose-300 animate-sparkle shadow-[0_0_6px_rgba(253,164,175,0.8)]" style={{ animationDelay: "3.1s" }} />
          
          {/* Premium rotating rings with gradient borders */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[450px] w-[450px] rounded-full border-2 border-purple-500/20 animate-rotate-slow" style={{ animationDuration: "25s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[550px] w-[550px] rounded-full border border-pink-500/10 animate-rotate-slow" style={{ animationDirection: "reverse", animationDuration: "35s" }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[650px] w-[650px] rounded-full border border-amber-500/5 animate-rotate-slow" style={{ animationDuration: "45s" }} />
          
          {/* Floating geometric shapes */}
          <div className="absolute top-[20%] right-[20%] w-6 h-6 border-2 border-purple-400/30 rotate-45 animate-float" />
          <div className="absolute bottom-[30%] left-[12%] w-4 h-4 bg-gradient-to-br from-pink-400/20 to-transparent rotate-12 animate-float-delayed" />
          <div className="absolute top-[60%] right-[10%] w-5 h-5 border border-amber-400/25 rounded-full animate-float-slow" />
        </div>

        <div className="relative z-10 mx-auto max-w-6xl px-4 py-24 sm:py-32 md:py-40">
          {/* Premium trust badges with enhanced glassmorphism */}
          <div className="mb-12 flex flex-wrap justify-center gap-3 opacity-0 animate-slide-up" style={{ animationDelay: "0ms", animationFillMode: "forwards" }}>
            <span className="glass-card rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-300 hover:scale-105 hover:bg-white/15 group cursor-default">
              <span className="relative z-10 flex items-center gap-2">
                <span className="relative">
                  <Shield className="h-4 w-4 text-emerald-400" />
                  <span className="absolute inset-0 h-4 w-4 animate-ping text-emerald-400/50"><Shield className="h-4 w-4" /></span>
                </span>
                <span>100% Anonymous</span>
              </span>
            </span>
            <span className="glass-card rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-300 hover:scale-105 hover:bg-white/15 group cursor-default">
              <span className="relative z-10 flex items-center gap-2">
                <Lock className="h-4 w-4 text-blue-400 group-hover:animate-bounce-subtle" />
                <span>No Login Required</span>
              </span>
            </span>
            <span className="glass-card rounded-full px-5 py-2.5 text-sm font-medium text-white/90 transition-all duration-300 hover:scale-105 hover:bg-white/15 group cursor-default">
              <span className="relative z-10 flex items-center gap-2">
                <Zap className="h-4 w-4 text-amber-400 group-hover:animate-pulse" />
                <span>Instant Access</span>
              </span>
            </span>
          </div>

          {/* Premium headline with layered gradient text */}
          <h1 className="text-center opacity-0 animate-slide-up" style={{ animationDelay: "100ms", animationFillMode: "forwards" }}>
            <span className="block text-5xl font-black tracking-tight text-white sm:text-6xl md:text-7xl lg:text-8xl drop-shadow-[0_0_35px_rgba(255,255,255,0.15)]">
              Your Campus,
            </span>
            <span className="mt-3 block text-5xl font-black tracking-tight sm:text-6xl md:text-7xl lg:text-8xl">
              <span className="relative inline-block">
                <span className="text-gradient-warm animate-text-shimmer drop-shadow-[0_0_40px_rgba(245,158,11,0.4)]">
                  Connected
                </span>
                <span className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 blur-2xl -z-10 animate-pulse" style={{ animationDuration: "3s" }} />
              </span>
            </span>
          </h1>

          {/* Enhanced subheadline with gradient accent */}
          <p className="mx-auto mt-10 max-w-2xl text-center text-lg text-slate-300/90 sm:text-xl md:text-2xl opacity-0 animate-slide-up leading-relaxed font-light" style={{ animationDelay: "200ms", animationFillMode: "forwards" }}>
            Buy, sell, confess, and connect with your campus community.
            <span className="block mt-3 text-slate-400/80 text-base sm:text-lg">
              Everything you need, <span className="text-gradient-warm font-medium">one platform</span>.
            </span>
          </p>

          {/* Premium CTA Buttons with glow effects */}
          <div className="mt-14 flex flex-wrap justify-center gap-5 opacity-0 animate-slide-up" style={{ animationDelay: "300ms", animationFillMode: "forwards" }}>
            <Link
              href="/marketplace"
              className="group relative inline-flex items-center gap-3 rounded-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 px-8 py-4 text-base font-bold text-slate-900 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all duration-300 hover:shadow-[0_0_50px_rgba(245,158,11,0.6)] hover:scale-105 hover:-translate-y-0.5"
            >
              <span className="absolute inset-0 rounded-full bg-gradient-to-r from-amber-300 via-yellow-300 to-orange-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute inset-0 rounded-full animate-pulse opacity-30 bg-gradient-to-r from-amber-400 to-orange-500" style={{ animationDuration: "2s" }} />
              <ShoppingBag className="relative z-10 h-5 w-5" />
              <span className="relative z-10">Explore Marketplace</span>
              <ArrowRight className="relative z-10 h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
            </Link>
            <Link
              href="/confessions/new"
              className="group relative inline-flex items-center gap-3 rounded-full glass-card px-8 py-4 text-base font-semibold text-white shadow-[0_0_20px_rgba(139,92,246,0.2)] transition-all duration-300 hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] hover:scale-105 hover:-translate-y-0.5 hover:bg-white/15"
            >
              <span className="absolute inset-0 rounded-full border border-purple-400/30 group-hover:border-purple-400/50 transition-colors" />
              <MessageSquare className="relative z-10 h-5 w-5 text-purple-300 group-hover:text-purple-200" />
              <span className="relative z-10">Share Confession</span>
            </Link>
          </div>

          {/* Premium stats with enhanced glass cards */}
          <div className="mt-24 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-6 opacity-0 animate-slide-up" style={{ animationDelay: "400ms", animationFillMode: "forwards" }}>
            <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 group card-shine">
              <div className="text-4xl font-black text-white sm:text-5xl transition-all duration-300 group-hover:text-gradient-warm group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                {stats.totalPosts.toLocaleString()}+
              </div>
              <div className="text-sm text-purple-300/90 mt-2 font-semibold uppercase tracking-wider">Total Posts</div>
              <div className="mt-3 h-1 w-12 mx-auto rounded-full bg-gradient-to-r from-purple-500 to-pink-500 group-hover:w-20 transition-all duration-300" />
            </div>
            <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 group card-shine">
              <div className="text-4xl font-black text-white sm:text-5xl transition-all duration-300 group-hover:text-gradient-warm group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                {stats.activeUsers.toLocaleString()}+
              </div>
              <div className="text-sm text-pink-300/90 mt-2 font-semibold uppercase tracking-wider">Active Users</div>
              <div className="mt-3 h-1 w-12 mx-auto rounded-full bg-gradient-to-r from-pink-500 to-rose-500 group-hover:w-20 transition-all duration-300" />
            </div>
            <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 group card-shine">
              <div className="text-4xl font-black text-white sm:text-5xl transition-all duration-300 group-hover:text-gradient-warm group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                {stats.itemsListed.toLocaleString()}+
              </div>
              <div className="text-sm text-emerald-300/90 mt-2 font-semibold uppercase tracking-wider">Items Listed</div>
              <div className="mt-3 h-1 w-12 mx-auto rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 group-hover:w-20 transition-all duration-300" />
            </div>
            <div className="glass-card rounded-2xl p-6 text-center transition-all duration-300 hover:scale-105 hover:bg-white/15 group card-shine">
              <div className="text-4xl font-black text-white sm:text-5xl transition-all duration-300 group-hover:text-gradient-warm group-hover:drop-shadow-[0_0_20px_rgba(245,158,11,0.5)]">
                {stats.messagesSent.toLocaleString()}+
              </div>
              <div className="text-sm text-amber-300/90 mt-2 font-semibold uppercase tracking-wider">Messages Sent</div>
              <div className="mt-3 h-1 w-12 mx-auto rounded-full bg-gradient-to-r from-amber-500 to-orange-500 group-hover:w-20 transition-all duration-300" />
            </div>
          </div>
          
          {/* Scroll indicator */}
          <div className="mt-16 flex justify-center opacity-0 animate-slide-up" style={{ animationDelay: "500ms", animationFillMode: "forwards" }}>
            <div className="flex flex-col items-center gap-2 text-white/40 animate-bounce" style={{ animationDuration: "2s" }}>
              <span className="text-xs uppercase tracking-widest">Scroll to explore</span>
              <ChevronDown className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Premium bottom fade with gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent" />
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
      <section className="mt-0 py-12 bg-white section-divider pt-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <span className="text-2xl">🔥</span>
              <h2 className="text-2xl font-bold text-gray-900">
                Hot Deals <span className="text-gradient-warm">Right Now</span>
              </h2>
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
      <section className="py-12 bg-gray-50 section-divider pt-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-purple-600" />
              <h2 className="text-2xl font-bold text-gray-900">
                Latest <span className="text-gradient-blue">Confessions</span>
              </h2>
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

      {/* For You Feed - Twitter style */}
      <section className="py-12 bg-white dark:bg-gray-900">
        <div className="mx-auto max-w-2xl px-4">
          <ForYouFeed />
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
      <section className="py-16 bg-white section-divider pt-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">
              Why Students <span className="text-gradient-blue">Love Us</span>
            </h2>
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
      <section className="relative py-20 bg-mesh overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="orb-1 -top-20 -right-20" />
          <div className="orb-2 -bottom-20 -left-20" />
          <div className="orb-3 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute inset-0 pattern-dots opacity-20" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
          <h2 className="text-3xl font-bold text-white sm:text-4xl mb-4 drop-shadow-lg">
            Ready to Join Your <span className="text-gradient-warm">Campus Community</span>?
          </h2>
          <p className="text-lg text-purple-100 mb-8">
            Start confessing, shopping, and connecting — all anonymously.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/confessions/new"
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-semibold text-purple-700 shadow-xl transition-all duration-300 hover:shadow-2xl hover:scale-105 glow-purple"
            >
              <Sparkles className="h-5 w-5" />
              Make Your First Confession
            </Link>
            <Link
              href="/marketplace"
              className="inline-flex items-center gap-2 rounded-full glass-card px-8 py-4 text-lg font-semibold text-white transition-all duration-300 hover:bg-white/20 hover:scale-105"
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
