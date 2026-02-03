"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MessageCircle, Repeat2, Share, CheckCircle, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

type FeedPost = {
  id: string;
  type: "confession" | "crush" | "spotted";
  content: string;
  author: string;
  isVerified: boolean;
  createdAt: Date;
  likes: number;
  comments: number;
  shares: number;
  hasLiked: boolean;
};

type FeedResponse = {
  posts: FeedPost[];
  isAdmin: boolean;
};

async function getFeedPosts(): Promise<FeedResponse> {
  try {
    const res = await fetch("/api/feed", { cache: "no-store" });
    if (!res.ok) return { posts: [], isAdmin: false };
    return res.json();
  } catch {
    return { posts: [], isAdmin: false };
  }
}

async function deletePost(postId: string, type: string): Promise<{ success: boolean }> {
  try {
    const res = await fetch("/api/feed/delete", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, type }),
    });
    if (!res.ok) return { success: false };
    return res.json();
  } catch {
    return { success: false };
  }
}

async function toggleLike(postId: string, type: string): Promise<{ success: boolean; likes: number }> {
  try {
    const res = await fetch("/api/feed/like", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ postId, type }),
    });
    if (!res.ok) return { success: false, likes: 0 };
    return res.json();
  } catch {
    return { success: false, likes: 0 };
  }
}

function PostCard({ 
  post, 
  onLike, 
  isAdmin, 
  onDelete 
}: { 
  post: FeedPost; 
  onLike: (id: string, type: string) => void;
  isAdmin: boolean;
  onDelete: (id: string, type: string) => void;
}) {
  const router = useRouter();
  const [isLiked, setIsLiked] = useState(post.hasLiked);
  const [likeCount, setLikeCount] = useState(post.likes);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsAnimating(true);
    setIsLiked(!isLiked);
    setLikeCount(prev => isLiked ? prev - 1 : prev + 1);
    
    const result = await toggleLike(post.id, post.type);
    if (result.success) {
      setLikeCount(result.likes);
    } else {
      setIsLiked(isLiked);
      setLikeCount(post.likes);
    }
    
    setTimeout(() => setIsAnimating(false), 300);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm("Are you sure you want to delete this post?")) return;
    
    setIsDeleting(true);
    const result = await deletePost(post.id, post.type);
    if (result.success) {
      onDelete(post.id, post.type);
    } else {
      alert("Failed to delete post");
    }
    setIsDeleting(false);
  };

  const getPostUrl = () => {
    switch (post.type) {
      case "confession": return `/confessions/${post.id}`;
      case "crush": return `/crushes/${post.id}`;
      case "spotted": return `/spotted/${post.id}`;
      default: return "#";
    }
  };

  const getTypeLabel = () => {
    switch (post.type) {
      case "confession": return "💭";
      case "crush": return "💕";
      case "spotted": return "👀";
      default: return "";
    }
  };

  return (
    <Link
      href={getPostUrl()}
      className="block border-b border-gray-200 dark:border-gray-700 p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
            <span className="text-lg">{getTypeLabel()}</span>
          </div>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-gray-900 dark:text-white">{post.author}</span>
            {post.isVerified && (
              <CheckCircle className="h-4 w-4 text-blue-500" />
            )}
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              · {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </span>
          </div>
          <p className="mt-1 text-gray-800 dark:text-gray-200 line-clamp-3">{post.content}</p>
          <div className="mt-3 flex items-center gap-6 text-gray-500 dark:text-gray-400">
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                router.push(getPostUrl());
              }}
              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group"
            >
              <MessageCircle className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.comments}</span>
            </button>
            <button 
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 hover:text-green-500 transition-colors group"
            >
              <Repeat2 className="h-4 w-4 group-hover:scale-110 transition-transform" />
              <span className="text-sm">{post.shares}</span>
            </button>
            <button 
              onClick={handleLike}
              className={`flex items-center gap-1.5 transition-colors group ${
                isLiked ? "text-pink-500" : "hover:text-pink-500"
              }`}
            >
              <Heart 
                className={`h-4 w-4 transition-transform ${
                  isAnimating ? "animate-heartbeat" : "group-hover:scale-110"
                }`}
                fill={isLiked ? "currentColor" : "none"}
              />
              <span className="text-sm">{likeCount}</span>
            </button>
            <button 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (navigator.share) {
                  navigator.share({
                    title: "Check this out on ComradeZone",
                    url: window.location.origin + getPostUrl(),
                  });
                }
              }}
              className="flex items-center gap-1.5 hover:text-blue-500 transition-colors group"
            >
              <Share className="h-4 w-4 group-hover:scale-110 transition-transform" />
            </button>
            {isAdmin && (
              <button 
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 hover:text-red-500 transition-colors group ml-auto"
                title="Delete post (Admin)"
              >
                <Trash2 className={`h-4 w-4 group-hover:scale-110 transition-transform ${isDeleting ? 'animate-pulse' : ''}`} />
              </button>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export function ForYouFeed() {
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"foryou" | "following">("foryou");
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadPosts();
  }, []);

  async function loadPosts() {
    setIsLoading(true);
    const data = await getFeedPosts();
    setPosts(data.posts);
    setIsAdmin(data.isAdmin);
    setIsLoading(false);
  }

  const handleLike = (id: string, type: string) => {
    setPosts(posts.map(p => 
      p.id === id ? { ...p, hasLiked: !p.hasLiked, likes: p.hasLiked ? p.likes - 1 : p.likes + 1 } : p
    ));
  };

  const handleDelete = (id: string, type: string) => {
    setPosts(posts.filter(p => !(p.id === id && p.type === type)));
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border-b border-gray-200 dark:border-gray-700 p-4">
            <div className="flex gap-3">
              <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                <div className="h-4 w-3/4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (posts.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-8 text-center">
        <p className="text-gray-500 dark:text-gray-400">No posts yet. Be the first to share!</p>
        <Link 
          href="/confessions/new" 
          className="mt-4 inline-block rounded-full bg-purple-600 px-6 py-2 text-sm font-medium text-white hover:bg-purple-700"
        >
          Make a Confession
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 border-b border-gray-200 dark:border-gray-700 pb-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">For You</h2>
        <div className="flex gap-2">
          <button 
            onClick={() => setActiveTab("foryou")}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === "foryou" 
                ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30" 
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            For You
          </button>
          <button 
            onClick={() => setActiveTab("following")}
            className={`px-4 py-2 text-sm font-medium rounded-full transition-colors ${
              activeTab === "following" 
                ? "text-purple-600 bg-purple-50 dark:bg-purple-900/30" 
                : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
            }`}
          >
            Following
          </button>
        </div>
      </div>
      
      <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden">
        {posts.map((post) => (
          <PostCard 
            key={`${post.type}-${post.id}`} 
            post={post} 
            onLike={handleLike} 
            isAdmin={isAdmin}
            onDelete={handleDelete}
          />
        ))}
      </div>
    </div>
  );
}
