import Link from "next/link";
import { getPostsByHashtag } from "@/actions/hashtags";
import { Hash, ArrowLeft } from "lucide-react";
import { formatRelativeTime } from "@/lib/utils";

export default async function TagPage({
  params,
}: {
  params: Promise<{ tag: string }>;
}) {
  const { tag } = await params;
  const { hashtag, posts } = await getPostsByHashtag(tag);

  if (!hashtag) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Hash className="h-16 w-16 text-gray-300 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          #{tag}
        </h1>
        <p className="text-gray-500">No posts found with this hashtag</p>
        <Link
          href="/explore"
          className="inline-block mt-4 text-rose-500 hover:text-rose-600"
        >
          ← Explore trending
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <Link
        href="/explore"
        className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Explore
      </Link>

      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-full bg-gradient-to-br from-rose-500 to-pink-500">
          <Hash className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            #{hashtag.name}
          </h1>
          <p className="text-sm text-gray-500">
            {hashtag.postCount} {hashtag.postCount === 1 ? "post" : "posts"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            href={`/${post.type === "confession" ? "confessions" : post.type === "crush" ? "crushes" : "spotted"}/${post.id}`}
            className="block p-4 rounded-2xl bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                {post.type}
              </span>
              <span className="text-xs text-gray-400">
                {formatRelativeTime(post.createdAt)}
              </span>
            </div>
            <p className="text-gray-800 dark:text-gray-200 line-clamp-3">
              {"content" in post ? post.content : "title" in post ? (post as { title: string }).title : ""}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
