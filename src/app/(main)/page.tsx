import Link from "next/link";
import Image from "next/image";
import {
  MessageSquare,
  Heart,
  Eye,
  Clock,
  MapPin,
  MessageCircle,
  Share2,
  Repeat2,
  ExternalLink,
  Shield,
  Sparkles,
  Users,
  Zap,
  Lock,
  TrendingUp,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { formatDistanceToNow } from "date-fns";

type FeedItem = {
  id: string;
  type: "confession" | "crush" | "spotted";
  content: string;
  title?: string;
  location?: string | null;
  number?: number | null;
  createdAt: Date;
  commentCount: number;
  reactionCount: number;
  repostCount?: number;
  mediaUrl?: string | null;
  mediaType?: string | null;
  linkUrl?: string | null;
  linkTitle?: string | null;
  linkImage?: string | null;
};

type Stats = {
  confessions: number;
  crushes: number;
  spotted: number;
  total: number;
};

async function getFeedItems(): Promise<FeedItem[]> {
  const [confessions, crushes, spotted] = await Promise.all([
    prisma.confession.findMany({
      where: { status: "APPROVED" },
      include: {
        _count: {
          select: { comments: true, reactions: true, reposts: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.campusCrush.findMany({
      where: { status: "APPROVED" },
      include: {
        _count: {
          select: { comments: true, reactions: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
    prisma.spotted.findMany({
      where: { status: "APPROVED" },
      include: {
        _count: {
          select: { comments: true, reactions: true },
        },
      },
      take: 20,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const feedItems: FeedItem[] = [
    ...confessions.map((c) => ({
      id: c.id,
      type: "confession" as const,
      content: c.content,
      number: c.confessionNumber,
      createdAt: c.createdAt,
      commentCount: c._count.comments,
      reactionCount: c._count.reactions,
      repostCount: c._count.reposts,
      mediaUrl: c.mediaUrl,
      mediaType: c.mediaType,
      linkUrl: c.linkUrl,
      linkTitle: c.linkTitle,
      linkImage: c.linkImage,
    })),
    ...crushes.map((c) => ({
      id: c.id,
      type: "crush" as const,
      content: c.description,
      title: c.title,
      location: c.location,
      number: c.crushNumber,
      createdAt: c.createdAt,
      commentCount: c._count.comments,
      reactionCount: c._count.reactions,
    })),
    ...spotted.map((s) => ({
      id: s.id,
      type: "spotted" as const,
      content: s.content,
      location: s.location,
      number: s.spottedNumber,
      createdAt: s.createdAt,
      commentCount: s._count.comments,
      reactionCount: s._count.reactions,
    })),
  ];

  return feedItems
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 30);
}

async function getStats(): Promise<Stats> {
  const [confessions, crushes, spotted] = await Promise.all([
    prisma.confession.count({ where: { status: "APPROVED" } }),
    prisma.campusCrush.count({ where: { status: "APPROVED" } }),
    prisma.spotted.count({ where: { status: "APPROVED" } }),
  ]);

  return {
    confessions,
    crushes,
    spotted,
    total: confessions + crushes + spotted,
  };
}

function getTypeConfig(type: FeedItem["type"]) {
  switch (type) {
    case "confession":
      return {
        icon: MessageSquare,
        label: "Confession",
        color: "text-purple-600",
        bg: "bg-purple-50",
        border: "border-purple-100",
        href: "/confessions",
      };
    case "crush":
      return {
        icon: Heart,
        label: "Campus Crush",
        color: "text-pink-600",
        bg: "bg-pink-50",
        border: "border-pink-100",
        href: "/crushes",
      };
    case "spotted":
      return {
        icon: Eye,
        label: "Spotted",
        color: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-100",
        href: "/spotted",
      };
  }
}

function FeedCard({ item, index }: { item: FeedItem; index: number }) {
  const config = getTypeConfig(item.type);
  const Icon = config.icon;
  const detailHref =
    item.type === "confession"
      ? `/confessions/${item.id}`
      : item.type === "crush"
      ? `/crushes/${item.id}`
      : `/spotted/${item.id}`;

  return (
    <article
      className="feed-item border-b border-gray-100 bg-white px-4 py-4 opacity-0 animate-fadeIn transition-all hover:bg-gray-50 sm:px-6"
      style={{ animationDelay: `${index * 50}ms`, animationFillMode: "forwards" }}
    >
      <Link href={detailHref} className="block">
        <div className="flex gap-3">
          <div
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${config.bg} transition-transform hover:scale-110`}
          >
            <Icon className={`h-5 w-5 ${config.color}`} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className={`text-sm font-semibold ${config.color}`}>
                {config.label} {item.number ? `#${item.number}` : ""}
              </span>
              <span className="text-gray-300">·</span>
              <span className="flex items-center gap-1 text-xs text-gray-500">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(item.createdAt, { addSuffix: true })}
              </span>
            </div>

            {item.title && (
              <h3 className="mb-1 font-medium text-gray-900">{item.title}</h3>
            )}

            <p className="whitespace-pre-wrap text-gray-800 line-clamp-4">
              {item.content}
            </p>

            {item.mediaUrl && item.mediaType === "image" && (
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                <Image
                  src={item.mediaUrl}
                  alt="Confession media"
                  width={600}
                  height={400}
                  className="w-full object-cover max-h-72 transition-transform hover:scale-105"
                />
              </div>
            )}

            {item.mediaUrl && item.mediaType === "video" && (
              <div className="mt-3 overflow-hidden rounded-xl border border-gray-200">
                <video
                  src={item.mediaUrl}
                  controls
                  className="w-full max-h-72"
                />
              </div>
            )}

            {item.linkUrl && (
              <div className="mt-3 flex items-center gap-3 rounded-lg border border-gray-200 bg-gray-50 p-3 transition-colors hover:bg-gray-100">
                {item.linkImage ? (
                  <Image
                    src={item.linkImage}
                    alt="Link preview"
                    width={80}
                    height={80}
                    className="h-16 w-16 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded bg-gray-200">
                    <ExternalLink className="h-6 w-6 text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {item.linkTitle || "Link"}
                  </p>
                  <p className="text-sm text-gray-500 truncate">{item.linkUrl}</p>
                </div>
              </div>
            )}

            {item.location && (
              <div className="mt-2 flex items-center gap-1 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                {item.location}
              </div>
            )}

            <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1.5 transition-colors hover:text-purple-600">
                <MessageCircle className="h-4 w-4" />
                {item.commentCount}
              </span>
              <span className="flex items-center gap-1.5 transition-colors hover:text-pink-600">
                <Heart className="h-4 w-4" />
                {item.reactionCount}
              </span>
              {item.repostCount !== undefined && item.repostCount > 0 && (
                <span className="flex items-center gap-1.5 transition-colors hover:text-green-600">
                  <Repeat2 className="h-4 w-4" />
                  {item.repostCount}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  if (navigator.share) {
                    navigator.share({
                      title: `${config.label} ${item.number ? `#${item.number}` : ""}`,
                      text: item.content.slice(0, 100),
                      url: window.location.origin + detailHref,
                    });
                  } else {
                    navigator.clipboard.writeText(
                      window.location.origin + detailHref
                    );
                  }
                }}
                className="flex items-center gap-1.5 transition-colors hover:text-blue-600"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </Link>
    </article>
  );
}

function StatCard({
  value,
  label,
  icon: Icon,
  gradient,
  delay,
}: {
  value: number;
  label: string;
  icon: React.ElementType;
  gradient: string;
  delay: number;
}) {
  return (
    <div
      className="animate-countUp opacity-0 flex flex-col items-center gap-1 rounded-2xl glass p-4 text-center"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className={`rounded-full p-2 ${gradient}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <span className="text-2xl font-bold text-white">{value.toLocaleString()}</span>
      <span className="text-xs text-white/70">{label}</span>
    </div>
  );
}

const tabs = [
  { id: "foryou", label: "For You", href: "/" },
  { id: "confessions", label: "Confessions", href: "/confessions" },
  { id: "dating", label: "Tinder 🔥", href: "/dating" },
  { id: "spotted", label: "Spotted", href: "/spotted" },
];

export default async function HomePage() {
  const [feedItems, stats] = await Promise.all([getFeedItems(), getStats()]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl">
        {/* Enhanced Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-violet-600 via-purple-600 to-indigo-700 animate-gradient px-4 py-12 text-white sm:px-6">
          {/* Decorative floating elements */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-4 -left-4 h-24 w-24 rounded-full bg-pink-500/20 blur-2xl animate-float" />
            <div className="absolute top-1/4 right-0 h-32 w-32 rounded-full bg-yellow-500/20 blur-2xl animate-float-delayed" />
            <div className="absolute bottom-0 left-1/4 h-28 w-28 rounded-full bg-blue-500/20 blur-2xl animate-float-slow" />
            
            {/* Floating icons */}
            <div className="absolute top-8 right-8 animate-float opacity-20">
              <Heart className="h-8 w-8" />
            </div>
            <div className="absolute bottom-12 left-8 animate-float-delayed opacity-20">
              <MessageSquare className="h-6 w-6" />
            </div>
            <div className="absolute top-1/2 right-12 animate-float-slow opacity-20">
              <Eye className="h-7 w-7" />
            </div>
            <div className="absolute top-16 left-1/4 animate-sparkle opacity-30">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>

          <div className="relative z-10 text-center">
            {/* Trust badges */}
            <div className="mb-6 flex flex-wrap justify-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
                <Shield className="h-3.5 w-3.5" />
                100% Anonymous
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
                <Lock className="h-3.5 w-3.5" />
                No Login Required
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium">
                <Zap className="h-3.5 w-3.5" />
                Instant Post
              </span>
            </div>

            <h1 className="animate-slideUp mb-3 text-3xl font-extrabold tracking-tight sm:text-4xl md:text-5xl">
              <span className="gradient-text">Your Campus,</span>
              <br />
              <span className="text-white">Uncensored</span>
            </h1>
            
            <p className="animate-slideUp mx-auto mb-6 max-w-md text-base text-purple-100 sm:text-lg" style={{ animationDelay: "100ms" }}>
              Speak your truth. Share your secrets. Find your crush.
              <span className="block mt-1 text-sm text-purple-200/80">All completely anonymous.</span>
            </p>

            {/* CTA Buttons */}
            <div className="animate-slideUp flex flex-wrap justify-center gap-3" style={{ animationDelay: "200ms" }}>
              <Link
                href="/confessions/new"
                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white px-6 py-3 text-sm font-semibold text-purple-700 shadow-lg transition-all hover:shadow-xl hover:scale-105"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-pink-500 to-purple-500 opacity-0 transition-opacity group-hover:opacity-10" />
                <MessageSquare className="h-4 w-4" />
                Make a Confession
              </Link>
              <Link
                href="/crushes/new"
                className="inline-flex items-center gap-2 rounded-full glass px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-white/20 hover:scale-105"
              >
                <Heart className="h-4 w-4" />
                Post a Crush
              </Link>
            </div>
          </div>

          {/* Statistics Banner */}
          {stats.total > 0 && (
            <div className="relative z-10 mt-10 grid grid-cols-3 gap-3">
              <StatCard
                value={stats.confessions}
                label="Confessions"
                icon={MessageSquare}
                gradient="bg-gradient-to-br from-purple-500 to-purple-700"
                delay={300}
              />
              <StatCard
                value={stats.crushes}
                label="Crushes"
                icon={Heart}
                gradient="bg-gradient-to-br from-pink-500 to-rose-600"
                delay={400}
              />
              <StatCard
                value={stats.spotted}
                label="Spotted"
                icon={Eye}
                gradient="bg-gradient-to-br from-amber-500 to-orange-600"
                delay={500}
              />
            </div>
          )}
        </section>

        {/* Navigation Tabs */}
        <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white shadow-sm">
          <div className="flex">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                  tab.id === "foryou"
                    ? "border-purple-600 text-purple-600 bg-purple-50/50"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-3 gap-3 border-b border-gray-200 bg-gradient-to-b from-white to-gray-50 p-4">
          <Link
            href="/confessions/new"
            className="feature-card group flex flex-col items-center gap-2 rounded-2xl border border-purple-100 bg-gradient-to-br from-purple-50 to-white p-4 shadow-sm hover:shadow-lg hover:border-purple-200"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-purple-500 to-purple-700 shadow-md group-hover:shadow-purple-300 transition-shadow">
              <MessageSquare className="h-6 w-6 text-white" />
              <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-green-400 border-2 border-white animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-purple-700">Confess</span>
            <span className="text-[10px] text-purple-500">Share secrets</span>
          </Link>
          <Link
            href="/dating"
            className="feature-card group flex flex-col items-center gap-2 rounded-2xl border border-pink-100 bg-gradient-to-br from-pink-50 to-white p-4 shadow-sm hover:shadow-lg hover:border-pink-200"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 shadow-md group-hover:shadow-pink-300 transition-shadow">
              <Heart className="h-6 w-6 text-white" />
              <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-yellow-400 animate-pulse" />
            </div>
            <span className="text-sm font-semibold text-pink-700">Tinder</span>
            <span className="text-[10px] text-pink-500">Find matches</span>
          </Link>
          <Link
            href="/spotted/new"
            className="feature-card group flex flex-col items-center gap-2 rounded-2xl border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-4 shadow-sm hover:shadow-lg hover:border-amber-200"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 shadow-md group-hover:shadow-amber-300 transition-shadow">
              <Eye className="h-6 w-6 text-white" />
            </div>
            <span className="text-sm font-semibold text-amber-700">Spotted</span>
            <span className="text-[10px] text-amber-500">Share moments</span>
          </Link>
        </div>

        {/* Trending indicator */}
        {feedItems.length > 0 && (
          <div className="flex items-center gap-2 bg-gradient-to-r from-purple-50 via-white to-pink-50 px-4 py-2 border-b border-gray-100">
            <TrendingUp className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-gray-600">Latest from your campus</span>
            <span className="ml-auto text-xs text-gray-400">{feedItems.length} posts</span>
          </div>
        )}

        {/* Feed */}
        <div className="divide-y divide-gray-100 bg-white">
          {feedItems.length > 0 ? (
            feedItems.map((item, index) => (
              <FeedCard key={`${item.type}-${item.id}`} item={item} index={index} />
            ))
          ) : (
            /* Enhanced Empty State */
            <div className="relative overflow-hidden px-4 py-16 text-center">
              {/* Decorative background */}
              <div className="absolute inset-0 bg-gradient-to-br from-purple-50 via-white to-pink-50" />
              <div className="absolute top-8 left-1/4 h-20 w-20 rounded-full bg-purple-200/30 blur-2xl animate-float" />
              <div className="absolute bottom-8 right-1/4 h-24 w-24 rounded-full bg-pink-200/30 blur-2xl animate-float-delayed" />
              
              <div className="relative z-10">
                {/* Illustration-style icon group */}
                <div className="mx-auto mb-6 flex items-center justify-center">
                  <div className="relative">
                    <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-purple-100 to-purple-200 shadow-lg animate-glow">
                      <MessageSquare className="h-10 w-10 text-purple-600" />
                    </div>
                    <div className="absolute -top-2 -right-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-400 to-rose-500 shadow-md animate-float">
                      <Heart className="h-5 w-5 text-white" />
                    </div>
                    <div className="absolute -bottom-2 -left-4 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 shadow-md animate-float-delayed">
                      <Eye className="h-5 w-5 text-white" />
                    </div>
                  </div>
                </div>
                
                <h3 className="mb-2 text-xl font-bold text-gray-900">
                  Be the First to Share!
                </h3>
                <p className="mx-auto mb-8 max-w-sm text-gray-500">
                  This campus is waiting for its first confession. Start the conversation — your secret is safe here.
                </p>
                
                <div className="flex flex-wrap justify-center gap-3">
                  <Link
                    href="/confessions/new"
                    className="group inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg transition-all hover:shadow-xl hover:scale-105"
                  >
                    <Sparkles className="h-4 w-4 group-hover:animate-pulse" />
                    Post First Confession
                  </Link>
                  <Link
                    href="/crushes/new"
                    className="inline-flex items-center gap-2 rounded-full border-2 border-pink-200 bg-white px-6 py-3 text-sm font-semibold text-pink-600 transition-all hover:bg-pink-50 hover:border-pink-300 hover:scale-105"
                  >
                    <Heart className="h-4 w-4" />
                    Reveal a Crush
                  </Link>
                </div>

                {/* Trust indicators */}
                <div className="mt-10 flex flex-wrap justify-center gap-4 text-xs text-gray-400">
                  <span className="flex items-center gap-1">
                    <Shield className="h-3.5 w-3.5" />
                    End-to-end anonymous
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-3.5 w-3.5" />
                    Join thousands of students
                  </span>
                  <span className="flex items-center gap-1">
                    <Lock className="h-3.5 w-3.5" />
                    Your identity is never stored
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Load More / End of Feed */}
        {feedItems.length > 0 && (
          <div className="bg-gradient-to-b from-white to-gray-50 px-4 py-8 text-center">
            <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 px-4 py-2 text-sm text-gray-500">
              <Sparkles className="h-4 w-4 text-purple-500" />
              You&apos;re all caught up!
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
