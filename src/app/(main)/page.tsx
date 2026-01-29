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

const tabs = [
  { id: "foryou", label: "For You", href: "/" },
  { id: "confessions", label: "Confessions", href: "/confessions" },
  { id: "dating", label: "Tinder 🔥", href: "/dating" },
  { id: "spotted", label: "Spotted", href: "/spotted" },
];

export default async function HomePage() {
  const feedItems = await getFeedItems();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-2xl">
        {/* Hero Section - Compact */}
        <section className="bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 px-4 py-8 text-white sm:px-6">
          <div className="text-center">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur-sm">
              <MessageCircle className="h-4 w-4" />
              <span>Anonymous & Safe</span>
            </div>
            <h1 className="mb-2 text-2xl font-bold tracking-tight sm:text-3xl">
              ComradeZone
            </h1>
            <p className="text-sm text-indigo-100 sm:text-base">
              Share confessions, find your crush, spot moments on campus
            </p>
          </div>
        </section>

        {/* Navigation Tabs */}
        <nav className="sticky top-0 z-10 border-b border-gray-200 bg-white">
          <div className="flex">
            {tabs.map((tab) => (
              <Link
                key={tab.id}
                href={tab.href}
                className={`flex-1 border-b-2 px-4 py-3 text-center text-sm font-medium transition-colors ${
                  tab.id === "foryou"
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                }`}
              >
                {tab.label}
              </Link>
            ))}
          </div>
        </nav>

        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-3 border-b border-gray-200 bg-white p-4">
          <Link
            href="/confessions/new"
            className="flex flex-col items-center gap-2 rounded-xl border border-purple-100 bg-purple-50 p-3 transition-all hover:border-purple-200 hover:shadow-md hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-600">
              <MessageSquare className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-purple-700">Confess</span>
          </Link>
          <Link
            href="/dating"
            className="flex flex-col items-center gap-2 rounded-xl border border-pink-100 bg-pink-50 p-3 transition-all hover:border-pink-200 hover:shadow-md hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-rose-500">
              <Heart className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-pink-700">Tinder</span>
          </Link>
          <Link
            href="/spotted/new"
            className="flex flex-col items-center gap-2 rounded-xl border border-amber-100 bg-amber-50 p-3 transition-all hover:border-amber-200 hover:shadow-md hover:scale-105"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-600">
              <Eye className="h-5 w-5 text-white" />
            </div>
            <span className="text-xs font-medium text-amber-700">Spotted</span>
          </Link>
        </div>

        {/* Feed */}
        <div className="divide-y divide-gray-100 bg-white">
          {feedItems.length > 0 ? (
            feedItems.map((item, index) => (
              <FeedCard key={`${item.type}-${item.id}`} item={item} index={index} />
            ))
          ) : (
            <div className="px-4 py-16 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="mb-2 text-lg font-medium text-gray-900">
                No posts yet
              </h3>
              <p className="mb-6 text-gray-500">Be the first to share something!</p>
              <div className="flex flex-wrap justify-center gap-3">
                <Link
                  href="/confessions/new"
                  className="rounded-full bg-purple-600 px-4 py-2 text-sm font-medium text-white hover:bg-purple-700 transition-colors"
                >
                  Post a Confession
                </Link>
                <Link
                  href="/crushes/new"
                  className="rounded-full bg-pink-600 px-4 py-2 text-sm font-medium text-white hover:bg-pink-700 transition-colors"
                >
                  Share a Crush
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Load More / End of Feed */}
        {feedItems.length > 0 && (
          <div className="bg-white px-4 py-8 text-center">
            <p className="text-sm text-gray-500">You&apos;re all caught up! 🎉</p>
          </div>
        )}
      </div>
    </div>
  );
}
