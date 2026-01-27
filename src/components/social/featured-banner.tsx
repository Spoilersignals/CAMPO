import Link from "next/link";
import { getFeaturedContent } from "@/actions/featured";
import { Crown, Flame, ArrowRight } from "lucide-react";

export async function FeaturedBanner() {
  const featured = await getFeaturedContent();

  if (!featured) return null;

  const content = featured.content as {
    id: string;
    content?: string;
    title?: string;
    confessionNumber?: number | null;
    crushNumber?: number | null;
    spottedNumber?: number | null;
  };

  const href = featured.contentType === "confession" 
    ? `/confessions/${content.id}`
    : featured.contentType === "crush"
    ? `/crushes/${content.id}`
    : `/spotted/${content.id}`;

  const number = content.confessionNumber || content.crushNumber || content.spottedNumber;
  const text = content.content || content.title || "";

  return (
    <Link
      href={href}
      className="block mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-400 via-orange-500 to-red-500 text-white relative overflow-hidden group hover:shadow-xl transition-all"
    >
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJtMjAgMCA1IDUgNS01eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
      
      <div className="relative flex items-center gap-4">
        <div className="shrink-0 p-3 bg-white/20 rounded-xl backdrop-blur-sm">
          <Crown className="h-6 w-6" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Flame className="h-4 w-4" />
            <span className="text-sm font-medium text-white/90">
              {featured.reason || "Featured Today"}
            </span>
          </div>
          
          <p className="font-bold text-lg truncate">
            {number && `#${number}: `}
            {text.slice(0, 60)}...
          </p>
        </div>

        <ArrowRight className="h-5 w-5 shrink-0 group-hover:translate-x-1 transition-transform" />
      </div>
    </Link>
  );
}
