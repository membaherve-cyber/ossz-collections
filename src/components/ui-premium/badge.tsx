/**
 * Freebuff Premium UI — Badge Component
 */

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/cn";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--color-accent)] focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-[var(--color-ink)] text-white",
        secondary:
          "border-transparent bg-[var(--color-accent-soft)] text-[var(--color-ink)]",
        destructive:
          "border-transparent bg-red-600 text-white",
        outline: "text-[var(--color-ink)]",
        success:
          "border-transparent bg-green-100 text-green-800",
        warning:
          "border-transparent bg-amber-100 text-amber-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
