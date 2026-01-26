"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Select } from "@/components/ui/select";

const statuses = [
  { value: "", label: "All Statuses" },
  { value: "HOLDING", label: "Holding" },
  { value: "RELEASED", label: "Released" },
  { value: "REFUNDED", label: "Refunded" },
  { value: "DISPUTED", label: "Disputed" },
];

interface EscrowFilterProps {
  currentStatus?: string;
}

export function EscrowFilter({ currentStatus }: EscrowFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    if (e.target.value) {
      params.set("status", e.target.value);
    } else {
      params.delete("status");
    }
    router.push(`/admin/escrow?${params.toString()}`);
  };

  return (
    <div className="max-w-xs">
      <Select value={currentStatus || ""} onChange={handleChange}>
        {statuses.map((status) => (
          <option key={status.value} value={status.value}>
            {status.label}
          </option>
        ))}
      </Select>
    </div>
  );
}
