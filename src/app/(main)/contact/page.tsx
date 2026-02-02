import { Mail, Phone, MapPin, MessageCircle } from "lucide-react";

export const metadata = {
  title: "Contact Us - ComradeZone",
  description: "Get in touch with ComradeZone support team.",
};

export default function ContactPage() {
  return (
    <div className="py-12">
      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Contact Us</h1>
          <p className="text-gray-600">
            Have questions or need help? Reach out to our support team.
          </p>
        </div>

        <div className="space-y-6 rounded-lg border bg-white p-8">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Mail className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Email</h3>
              <a href="mailto:support@comradezone.com" className="text-indigo-600 hover:underline">
                support@comradezone.com
              </a>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <Phone className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Phone</h3>
              <p className="text-gray-600">+234 XXX XXX XXXX</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <MapPin className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Location</h3>
              <p className="text-gray-600">Campus Location</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-100">
              <MessageCircle className="h-6 w-6 text-indigo-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Response Time</h3>
              <p className="text-gray-600">We typically respond within 24 hours</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
