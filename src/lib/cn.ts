/**
 * Freebuff UI Engine — cn utility (shadcn/ui compatible)
 *
 * Uses clsx + tailwind-merge for the standard shadcn/ui class merging pattern.
 * This is the recommended utility for all new components.
 */

import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names with conflict resolution.
 * Standard shadcn/ui utility.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
