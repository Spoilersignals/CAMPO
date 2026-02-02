import Link from "next/link";
import { HelpCircle, ShoppingBag, Users, Shield, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Help Center - ComradeZone",
  description: "Find answers to frequently asked questions about ComradeZone.",
};

export default function HelpPage() {
  const faqs = [
    {
      question: "How do I sell an item?",
      answer: "Register as a seller, get approved, and list your items. You'll pay a 15% commission when listing.",
    },
    {
      question: "How do I buy something?",
      answer: "Browse the marketplace, contact the seller through our messaging system, and arrange payment via M-Pesa or bank transfer.",
    },
    {
      question: "What is the commission fee?",
      answer: "Sellers pay 15% of the listing price as commission. If your item doesn't sell, you're entitled to a 50% refund.",
    },
    {
      question: "Is my information safe?",
      answer: "Yes, we verify all sellers and moderate conversations to ensure safe transactions.",
    },
    {
      question: "How do I report a problem?",
      answer: "Contact our support team immediately through the Contact page or messaging system.",
    },
  ];

  return (
    <div className="py-12">
      <div className="mx-auto max-w-3xl px-4">
        <div className="mb-8 text-center">
          <h1 className="mb-4 text-3xl font-bold text-gray-900">Help Center</h1>
          <p className="text-gray-600">
            Find answers to common questions about using ComradeZone.
          </p>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-2">
          <Link
            href="/how-it-works"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:border-indigo-300"
          >
            <ShoppingBag className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">How It Works</span>
          </Link>
          <Link
            href="/safety"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:border-indigo-300"
          >
            <Shield className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Safety Guidelines</span>
          </Link>
          <Link
            href="/terms"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:border-indigo-300"
          >
            <Users className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Terms & Conditions</span>
          </Link>
          <Link
            href="/contact"
            className="flex items-center gap-3 rounded-lg border bg-white p-4 hover:border-indigo-300"
          >
            <MessageSquare className="h-6 w-6 text-indigo-600" />
            <span className="font-medium">Contact Support</span>
          </Link>
        </div>

        <div className="rounded-lg border bg-white">
          <div className="border-b p-4">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
              <HelpCircle className="h-5 w-5 text-indigo-600" />
              Frequently Asked Questions
            </h2>
          </div>
          <div className="divide-y">
            {faqs.map((faq, index) => (
              <div key={index} className="p-4">
                <h3 className="mb-2 font-medium text-gray-900">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
