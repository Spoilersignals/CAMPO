"use client";

import { ThemeToggle } from "@/components/theme-toggle";

export function HeaderActions() {
  return (
    <div className="flex items-center gap-2">
      <ThemeToggle />
    </div>
  );
}
