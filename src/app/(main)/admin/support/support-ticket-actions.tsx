"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Modal, ModalHeader, ModalTitle, ModalFooter } from "@/components/ui/modal";
import { updateSupportTicketAction } from "@/actions/admin";

interface SupportTicketActionsProps {
  ticketId: string;
  currentStatus: string;
}

const statuses = [
  { value: "OPEN", label: "Open" },
  { value: "IN_PROGRESS", label: "In Progress" },
  { value: "RESOLVED", label: "Resolved" },
  { value: "CLOSED", label: "Closed" },
];

export function SupportTicketActions({
  ticketId,
  currentStatus,
}: SupportTicketActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showResponseModal, setShowResponseModal] = useState(false);
  const [status, setStatus] = useState(currentStatus);
  const [response, setResponse] = useState("");

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    startTransition(async () => {
      await updateSupportTicketAction(ticketId, newStatus);
    });
  };

  const handleRespond = () => {
    startTransition(async () => {
      await updateSupportTicketAction(ticketId, status);
      setShowResponseModal(false);
      setResponse("");
    });
  };

  return (
    <>
      <div className="mt-4 flex items-center gap-3">
        <div className="w-40">
          <Select
            value={status}
            onChange={(e) => handleStatusChange(e.target.value)}
            disabled={isPending}
          >
            {statuses.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => setShowResponseModal(true)}
          disabled={isPending}
        >
          Send Response
        </Button>
      </div>

      <Modal open={showResponseModal} onClose={() => setShowResponseModal(false)}>
        <ModalHeader>
          <ModalTitle>Respond to Ticket</ModalTitle>
        </ModalHeader>
        <div className="space-y-4">
          <div className="w-full">
            <Select
              label="Update Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {statuses.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </Select>
          </div>
          <Textarea
            label="Response Message"
            placeholder="Write your response to the customer..."
            value={response}
            onChange={(e) => setResponse(e.target.value)}
          />
        </div>
        <ModalFooter>
          <Button variant="outline" onClick={() => setShowResponseModal(false)}>
            Cancel
          </Button>
          <Button onClick={handleRespond} disabled={isPending || !response.trim()}>
            {isPending ? "Sending..." : "Send Response"}
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
}
