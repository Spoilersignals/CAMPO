"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { approveConfessionAction, rejectConfessionAction } from "@/actions/admin";

interface ConfessionActionsProps {
  confessionId: string;
}

export function ConfessionActions({ confessionId }: ConfessionActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  const handleApprove = () => {
    startTransition(async () => {
      await approveConfessionAction(confessionId);
    });
  };

  const handleReject = () => {
    startTransition(async () => {
      await rejectConfessionAction(confessionId, rejectReason || undefined);
      setShowRejectModal(false);
      setRejectReason("");
    });
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        <Button
          onClick={handleApprove}
          disabled={isPending}
          className="bg-green-600 hover:bg-green-700"
        >
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
          <ModalTitle>Reject Confession</ModalTitle>
        </ModalHeader>
        <Textarea
          label="Rejection Reason (optional)"
          placeholder="Explain why this confession is being rejected..."
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
            disabled={isPending}
          >
            {isPending ? "Rejecting..." : "Reject Confession"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
