"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { banUserAction, approveUserAction } from "@/actions/admin";

interface UserActionsProps {
  userId: string;
  isApproved: boolean;
}

export function UserActions({ userId, isApproved }: UserActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showBanModal, setShowBanModal] = useState(false);
  const [banReason, setBanReason] = useState("");

  const handleBan = (permanent: boolean) => {
    if (!banReason.trim()) return;
    startTransition(async () => {
      await banUserAction(userId, banReason);
      setShowBanModal(false);
      setBanReason("");
    });
  };

  const handleApprove = () => {
    startTransition(async () => {
      await approveUserAction(userId);
    });
  };

  return (
    <>
      <div className="mt-4 flex gap-3">
        {!isApproved && (
          <Button
            onClick={handleApprove}
            disabled={isPending}
            className="bg-green-600 hover:bg-green-700"
          >
            {isPending ? "Approving..." : "Approve Seller"}
          </Button>
        )}
        {isApproved && (
          <Button
            variant="destructive"
            onClick={() => setShowBanModal(true)}
            disabled={isPending}
          >
            Suspend User
          </Button>
        )}
      </div>

      <Modal open={showBanModal} onClose={() => setShowBanModal(false)}>
        <ModalHeader>
          <ModalTitle>Suspend User</ModalTitle>
        </ModalHeader>
        <Textarea
          label="Reason for Suspension"
          placeholder="Explain why this user is being suspended..."
          value={banReason}
          onChange={(e) => setBanReason(e.target.value)}
        />
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowBanModal(false)}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleBan(false)}
            disabled={isPending || !banReason.trim()}
          >
            {isPending ? "Processing..." : "Suspend"}
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleBan(true)}
            disabled={isPending || !banReason.trim()}
          >
            {isPending ? "Processing..." : "Ban Permanently"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
