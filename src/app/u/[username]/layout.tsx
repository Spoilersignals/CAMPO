import { Metadata } from "next";
import { prisma } from "@/lib/prisma";

type Props = {
  params: { username: string };
  children: React.ReactNode;
};

async function getPersonalLinkInfo(linkCode: string) {
  try {
    const link = await prisma.personalLink.findUnique({
      where: { code: linkCode },
      select: {
        id: true,
        displayName: true,
      },
    });
    return link;
  } catch {
    return null;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const linkInfo = await getPersonalLinkInfo(params.username);
  
  const displayName = linkInfo?.displayName || "Someone";
  const title = `Send ${displayName} an anonymous message | ComradeZone`;
  const description = `Send anonymous messages to ${displayName}. Your identity stays completely hidden!`;
  
  const ogImageUrl = `/api/og?username=${encodeURIComponent(params.username)}&message=${encodeURIComponent(`Send me anonymous messages!`)}`;
  
  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: "website",
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: `Send ${displayName} an anonymous message`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImageUrl],
    },
  };
}

export default function UserLinkLayout({ children }: Props) {
  return <>{children}</>;
}
