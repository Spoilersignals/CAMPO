import { redirect } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { RequestForm } from "@/components/requests/request-form";
import { createItemRequest } from "@/actions/requests";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewRequestPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login?callbackUrl=/requests/new");
  }

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const handleSubmit = async (formData: FormData) => {
    "use server";
    return createItemRequest(null, formData);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/requests"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Requests
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Post a Request</CardTitle>
          <p className="text-sm text-gray-500">
            Let others know what you're looking for
          </p>
        </CardHeader>
        <CardContent>
          <RequestForm categories={categories} action={handleSubmit} />
        </CardContent>
      </Card>
    </div>
  );
}
