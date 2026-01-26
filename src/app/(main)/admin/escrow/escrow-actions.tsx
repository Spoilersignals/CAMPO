"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { releaseEscrowAction, refundEscrowAction } from "@/actions/admin";

interface EscrowActionsProps {
  escrowId: string;
}

export function EscrowActions({ escrowId }: EscrowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundReason, setRefundReason] = useState("");

  const handleRelease = () => {
    if (!confirm("Are you sure the buyer has received the item?")) return;
    startTransition(async () => {
      await releaseEscrowAction(escrowId);
    });
  };

  const handleRefund = () => {
    startTransition(async () => {
      await refundEscrowAction(escrowId);
      setShowRefundModal(false);
      setRefundReason("");
    });
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        <Button onClick={handleRelease} disabled={isPending}>
          {isPending ? "Processing..." : "Release Payment"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRefundModal(true)}
          disabled={isPending}
        >
          Refund Buyer
        </Button>
      </div>

      <Modal open={showRefundModal} onClose={() => setShowRefundModal(false)}>
        <ModalHeader>
          <ModalTitle>Refund Transaction</ModalTitle>
        </ModalHeader>
        <Textarea
          label="Refund Reason (optional)"
          placeholder="Why is this transaction being refunded?"
          value={refundReason}
          onChange={(e) => setRefundReason(e.target.value)}
        />
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRefundModal(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleRefund} disabled={isPending}>
            {isPending ? "Processing..." : "Confirm Refund"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
