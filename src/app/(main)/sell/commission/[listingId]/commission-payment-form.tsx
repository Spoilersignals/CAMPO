"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreditCard, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { payCommissionAction } from "@/actions/listings";

interface CommissionPaymentFormProps {
  listingId: string;
  amount: number;
}

export function CommissionPaymentForm({
  listingId,
  amount,
}: CommissionPaymentFormProps) {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.set("listingId", listingId);

      const result = await payCommissionAction(formData);

      if (result?.error) {
        setError(result.error);
      } else if (result?.success) {
        router.refresh();
      }
    } catch (err) {
      setError("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
        <p className="mb-2 text-center text-sm text-gray-600">
          This is a simulated payment for demonstration purposes
        </p>
        <div className="flex items-center justify-center gap-2 text-gray-400">
          <CreditCard className="h-5 w-5" />
          <span className="text-sm">**** **** **** 4242</span>
        </div>
      </div>

      <Button
        onClick={handlePayment}
        disabled={isProcessing}
        className="w-full"
        size="lg"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing Payment...
          </>
        ) : (
          <>
            <CreditCard className="mr-2 h-4 w-4" />
            Pay ${amount.toFixed(2)} Commission
          </>
        )}
      </Button>

      <p className="text-center text-xs text-gray-500">
        By paying, you agree to our commission terms and listing policies
      </p>
    </div>
  );
}
