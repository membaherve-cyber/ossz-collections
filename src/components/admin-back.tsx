"use client";

import { usePathname } from "next/navigation";
import { BackButton } from "@/components/back-button";

/** Back control for back-office sub-pages; the dashboard itself is the root. */
export function AdminBack() {
  const pathname = usePathname();
  if (pathname === "/admin") return null;
  return (
    <div className="mb-4 print:hidden">
      <BackButton />
    </div>
  );
}
