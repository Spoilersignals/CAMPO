import Link from "next/link";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { SuggestionForm } from "@/components/suggestions/suggestion-form";
import { createSuggestionAction } from "@/actions/requests";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function NewSuggestionPage() {
  const session = await auth();
  const isLoggedIn = !!session?.user;

  const categories = await prisma.category.findMany({
    orderBy: { name: "asc" },
  });

  const handleSubmit = async (formData: FormData) => {
    "use server";
    return createSuggestionAction(null, formData);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/suggestions"
        className="mb-6 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Suggestions
      </Link>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Suggest an Item</CardTitle>
          <p className="text-sm text-gray-500">
            Let sellers know what you're looking for - no account needed!
          </p>
        </CardHeader>
        <CardContent>
          <SuggestionForm
            categories={categories}
            action={handleSubmit}
            isLoggedIn={isLoggedIn}
          />
        </CardContent>
      </Card>

      <div className="rounded-lg border border-green-200 bg-green-50 p-4">
        <div className="flex items-start gap-3">
          <CheckCircle className="mt-0.5 h-5 w-5 text-green-600" />
          <div>
            <h3 className="font-medium text-green-900">How it works</h3>
            <ul className="mt-2 space-y-1 text-sm text-green-800">
              <li>• Your suggestion will be visible to all sellers</li>
              <li>• Sellers with matching items can list them for you</li>
              <li>• If you provide contact info, sellers may reach out directly</li>
              <li>• You can browse new listings that match your suggestion</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
