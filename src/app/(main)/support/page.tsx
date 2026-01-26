import { redirect } from "next/navigation";
import { MessageCircle, Phone, Mail, HelpCircle } from "lucide-react";
import { auth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { ContactBrokerForm } from "./contact-form";

export default async function SupportPage() {
  const session = await auth();

  if (!session?.user?.id) {
    redirect("/login");
  }

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Contact Support</h1>
        <p className="mt-1 text-gray-600">
          Have questions or need help? Reach out to our broker team.
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-3 rounded-full bg-blue-100 p-3">
              <MessageCircle className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="font-medium text-gray-900">Chat Support</h3>
            <p className="mt-1 text-sm text-gray-500">Use the form below</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-3 rounded-full bg-green-100 p-3">
              <Phone className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="font-medium text-gray-900">WhatsApp</h3>
            <p className="mt-1 text-sm text-gray-500">+254 700 000 000</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="flex flex-col items-center p-6 text-center">
            <div className="mb-3 rounded-full bg-purple-100 p-3">
              <Mail className="h-6 w-6 text-purple-600" />
            </div>
            <h3 className="font-medium text-gray-900">Email</h3>
            <p className="mt-1 text-sm text-gray-500">support@campusbroker.com</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HelpCircle className="h-5 w-5" />
            Send a Message to Broker
          </CardTitle>
          <CardDescription>
            Our team will respond within 24 hours
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ContactBrokerForm userId={session.user.id} userName={session.user.name || "User"} />
        </CardContent>
      </Card>

      <Card className="mt-6 border-amber-200 bg-amber-50">
        <CardContent className="py-6">
          <h3 className="mb-3 font-semibold text-amber-900">Common Questions</h3>
          <div className="space-y-3 text-sm text-amber-800">
            <div>
              <p className="font-medium">How long does listing review take?</p>
              <p className="text-amber-700">Usually 24-48 hours after commission payment.</p>
            </div>
            <div>
              <p className="font-medium">What if my listing is rejected?</p>
              <p className="text-amber-700">You&apos;ll receive a notification with the reason and can re-submit.</p>
            </div>
            <div>
              <p className="font-medium">How do I get my commission refund?</p>
              <p className="text-amber-700">If your item doesn&apos;t sell after 30 days, contact us for a 50% refund.</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
