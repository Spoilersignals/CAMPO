"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Archive, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteListingAction, archiveListingAction } from "@/actions/listings";

interface ActionButtonProps {
  listingId: string;
}

export function DeleteListingButton({ listingId }: ActionButtonProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await deleteListingAction(listingId);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete listing:", error);
    } finally {
      setIsDeleting(false);
      setShowConfirm(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="flex gap-1">
        <Button
          variant="destructive"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting}
        >
          {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Yes"}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowConfirm(false)}
          disabled={isDeleting}
        >
          No
        </Button>
      </div>
    );
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setShowConfirm(true)}
      className="text-red-600 hover:bg-red-50 hover:text-red-700"
    >
      <Trash2 className="h-4 w-4" />
    </Button>
  );
}

export function ArchiveListingButton({ listingId }: ActionButtonProps) {
  const router = useRouter();
  const [isArchiving, setIsArchiving] = useState(false);

  const handleArchive = async () => {
    setIsArchiving(true);
    try {
      await archiveListingAction(listingId);
      router.refresh();
    } catch (error) {
      console.error("Failed to archive listing:", error);
    } finally {
      setIsArchiving(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleArchive}
      disabled={isArchiving}
      className="text-gray-600"
    >
      {isArchiving ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Archive className="h-4 w-4" />
      )}
    </Button>
  );
}
