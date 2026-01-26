import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { SocialMenu } from "@/components/layout/social-menu";
import { auth } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <SocialMenu user={session?.user} />
      <main className="flex-1 pb-20 md:pb-0 md:ml-64">{children}</main>
      <div className="hidden md:block">
        <Footer />
      </div>
    </div>
  );
}
