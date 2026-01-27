import { getTrendingHashtags } from "@/actions/hashtags";
import { Hash, TrendingUp, Sparkles } from "lucide-react";
import Link from "next/link";

export default async function ExplorePage() {
  const trending = await getTrendingHashtags(20);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500">
          <Sparkles className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Explore
          </h1>
          <p className="text-gray-500">Discover what&apos;s trending on campus</p>
        </div>
      </div>

      <section className="mb-12">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="h-5 w-5 text-rose-500" />
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Trending Hashtags
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {trending.map((tag, index) => (
            <Link
              key={tag.id}
              href={`/explore/tag/${tag.name}`}
              className="relative overflow-hidden p-4 rounded-2xl bg-gradient-to-br from-white to-gray-50 dark:from-gray-800 dark:to-gray-900 border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:scale-[1.02] transition-all group"
            >
              {index < 3 && (
                <span className="absolute top-2 right-2 text-xl">
                  {index === 0 ? "🥇" : index === 1 ? "🥈" : "🥉"}
                </span>
              )}
              <div className="flex items-center gap-1.5 mb-1">
                <Hash className="h-4 w-4 text-rose-500" />
                <span className="font-bold text-gray-900 dark:text-white group-hover:text-rose-500 transition-colors">
                  {tag.name}
                </span>
              </div>
              <p className="text-sm text-gray-500">
                {tag.postCount} posts
              </p>
            </Link>
          ))}
        </div>

        {trending.length === 0 && (
          <div className="text-center py-12">
            <Hash className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No trending hashtags yet</p>
            <p className="text-sm text-gray-400 mt-1">
              Use #hashtags in your posts to start trending!
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
