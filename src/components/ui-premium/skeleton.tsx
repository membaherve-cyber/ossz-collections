/**
 * Freebuff Premium UI — Skeleton Component
 *
 * Animated loading placeholder using the engine's skeleton shimmer.
 */

import { cn } from "@/lib/cn";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("fb-skeleton rounded-md", className)}
      {...props}
    />
  );
}

export { Skeleton };
