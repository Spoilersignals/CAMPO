import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { LostFoundForm } from "@/components/lost-found/lost-found-form";
import { createLostFoundItem } from "@/actions/lost-found";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewLostFoundPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/lost-found/new");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { name: true, phone: true },
  });

  const handleSubmit = async (formData: FormData) => {
    "use server";
    return createLostFoundItem(null, formData);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/lost-found"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Lost & Found
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Report a Lost or Found Item</CardTitle>
          <p className="text-sm text-gray-500">
            Help reunite items with their owners — completely FREE!
          </p>
        </CardHeader>
        <CardContent>
          <LostFoundForm 
            action={handleSubmit} 
            userName={user?.name}
            userPhone={user?.phone}
          />
        </CardContent>
      </Card>
    </div>
  );
}
