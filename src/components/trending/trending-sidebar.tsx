import Link from "next/link";
import { getTrendingHashtags } from "@/actions/hashtags";
import { TrendingUp, Hash } from "lucide-react";

export async function TrendingSidebar() {
  const trending = await getTrendingHashtags(10);

  if (trending.length === 0) return null;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 p-4 shadow-sm">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp className="h-5 w-5 text-rose-500" />
        <h3 className="font-bold text-gray-900 dark:text-white">Trending Now</h3>
      </div>
      
      <div className="space-y-3">
        {trending.map((tag, index) => (
          <Link
            key={tag.id}
            href={`/explore/tag/${tag.name}`}
            className="flex items-start gap-3 group hover:bg-white/50 dark:hover:bg-gray-700/50 p-2 rounded-xl transition-all"
          >
            <span className="text-sm font-medium text-gray-400 w-4">
              {index + 1}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1">
                <Hash className="h-3.5 w-3.5 text-gray-400" />
                <span className="font-semibold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
                  {tag.name}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-0.5">
                {tag.postCount} {tag.postCount === 1 ? "post" : "posts"}
              </p>
            </div>
          </Link>
        ))}
      </div>

      <Link
        href="/explore"
        className="block mt-4 text-sm font-medium text-rose-500 hover:text-rose-600 text-center"
      >
        Show more
      </Link>
    </div>
  );
}
