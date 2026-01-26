import { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, MessageCircle, Heart } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ shareCode: string }>;
}

async function getConfessionByShareCode(shareCode: string) {
  return prisma.confession.findUnique({
    where: { shareCode },
    select: {
      id: true,
      content: true,
      confessionNumber: true,
      status: true,
      approvedAt: true,
      createdAt: true,
      _count: {
        select: {
          comments: true,
          reactions: true,
        },
      },
    },
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { shareCode } = await params;
  const confession = await getConfessionByShareCode(shareCode);
  
  if (!confession || confession.status !== "APPROVED") {
    return {
      title: "Confession Not Found | ComradeZone",
    };
  }

  const title = confession.confessionNumber 
    ? `Confession #${confession.confessionNumber} | ComradeZone`
    : "Anonymous Confession | ComradeZone";
  const description = confession.content.length > 160 
    ? confession.content.slice(0, 157) + "..." 
    : confession.content;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "article",
      siteName: "ComradeZone",
    },
    twitter: {
      card: "summary",
      title,
      description,
    },
  };
}

export default async function ShareConfessionPage({ params }: PageProps) {
  const { shareCode } = await params;
  const confession = await getConfessionByShareCode(shareCode);

  if (!confession || confession.status !== "APPROVED") {
    notFound();
  }

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(new Date(date));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link 
          href="/confessions" 
          className="mb-6 inline-flex items-center gap-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-4 w-4" />
          View all confessions
        </Link>

        <Card className="overflow-hidden border-none shadow-xl">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
            <div className="flex items-center justify-between">
              <span className="text-xl font-bold text-white">
                #{confession.confessionNumber}
              </span>
              <span className="text-sm text-indigo-200">
                {formatDate(confession.approvedAt || confession.createdAt)}
              </span>
            </div>
          </div>
          
          <CardContent className="p-6">
            <p className="mb-6 whitespace-pre-wrap text-lg leading-relaxed text-gray-800">
              {confession.content}
            </p>

            <div className="flex items-center gap-4 border-t pt-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <Heart className="h-4 w-4" />
                {confession._count.reactions} reactions
              </span>
              <span className="flex items-center gap-1">
                <MessageCircle className="h-4 w-4" />
                {confession._count.comments} comments
              </span>
            </div>
          </CardContent>
        </Card>

        <div className="mt-6 text-center">
          <p className="mb-4 text-gray-600">
            Want to see more confessions or share your own?
          </p>
          <div className="flex justify-center gap-3">
            <Link href="/confessions">
              <Button variant="outline">
                Browse Confessions
              </Button>
            </Link>
            <Link href="/confessions">
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                Share Yours
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <Link href="/" className="font-semibold text-indigo-600 hover:text-indigo-700">
            ComradeZone
          </Link>
          {" "}— Anonymous confessions for your campus
        </div>
      </div>
    </div>
  );
}
