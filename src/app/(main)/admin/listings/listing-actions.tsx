"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { approveListingAction, rejectListingAction } from "@/actions/admin";

interface ListingActionsProps {
  listingId: string;
}

export function ListingActions({ listingId }: ListingActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      await approveListingAction(listingId);
    });
  };

  const handleReject = () => {
    if (!rejectReason.trim()) return;
    startTransition(async () => {
      await rejectListingAction(listingId, rejectReason);
      setShowRejectModal(false);
      setRejectReason("");
    });
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        <Button onClick={handleApprove} disabled={isPending}>
          {isPending ? "Processing..." : "Approve"}
        </Button>
        <Button
          variant="destructive"
          onClick={() => setShowRejectModal(true)}
          disabled={isPending}
        >
          Reject
        </Button>
      </div>

      <Modal open={showRejectModal} onClose={() => setShowRejectModal(false)}>
        <ModalHeader>
          <ModalTitle>Reject Listing</ModalTitle>
        </ModalHeader>
        <Textarea
          label="Rejection Reason"
          placeholder="Explain why this listing is being rejected..."
          value={rejectReason}
          onChange={(e) => setRejectReason(e.target.value)}
        />
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowRejectModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleReject}
            disabled={isPending || !rejectReason.trim()}
          >
            {isPending ? "Rejecting..." : "Reject Listing"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
