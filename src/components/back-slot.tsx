"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Shows its children on every page except the homepage and the back office. */
export function BackSlot({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/" || pathname.startsWith("/admin")) return null;
  return <>{children}</>;
}
