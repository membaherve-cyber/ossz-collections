export const CURRENCY = "FCFA";

export function formatXAF(amount: number): string {
  const rounded = Math.round(amount || 0);
  return `${rounded.toLocaleString("fr-FR").replace(/\u202f|\u00a0/g, " ")} ${CURRENCY}`;
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70);
}

/**
 * Merge CSS class names. Filters falsy values and joins with spaces.
 * This is the shadcn/ui-compatible cn utility.
 *
 * For projects using clsx + tailwind-merge, swap this implementation.
 * The signature is intentionally compatible with clsx/tailwind-merge.
 */
export function cn(...inputs: Array<string | false | null | undefined>): string {
  return inputs.filter(Boolean).join(" ");
}

/**
 * Merge class names with deduplication.
 * Use this when combining classes that might conflict.
 */
export function cnMerge(...inputs: Array<string | false | null | undefined>): string {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const input of inputs) {
    if (!input) continue;
    for (const cls of input.split(" ").filter(Boolean)) {
      if (!seen.has(cls)) {
        seen.add(cls);
        result.push(cls);
      }
    }
  }
  return result.join(" ");
}

export function makeOrderNumber(): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-5);
  const rand = Math.floor(Math.random() * 46656)
    .toString(36)
    .toUpperCase()
    .padStart(3, "0");
  return `OSZ-${stamp}${rand}`;
}

export function makeReference(prefix: string): string {
  const rand = Math.floor(Math.random() * 1679616)
    .toString(36)
    .toUpperCase()
    .padStart(4, "0");
  return `${prefix}-${rand}`;
}

export const ORDER_STATUSES = [
  "placed",
  "processing",
  "ready",
  "out_for_delivery",
  "delivered",
  "returned",
  "cancelled",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  placed: "Placed",
  processing: "Processing",
  ready: "Ready",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  returned: "Returned",
  cancelled: "Cancelled",
  requested: "Requested",
  confirmed: "Confirmed",
  completed: "Completed",
  pending: "Pending",
  paid: "Paid",
  draft: "Draft",
  published: "Published",
};

export const PAYMENT_LABELS: Record<string, string> = {
  mobile_money_mtn: "MTN Mobile Money",
  mobile_money_orange: "Orange Money",
  card: "Card (Visa / Mastercard)",
  cash_on_delivery: "Cash or MoMo on delivery",
};

export const DELIVERY_LABELS: Record<string, string> = {
  douala_local: "Douala local delivery",
  national: "National shipping",
  pickup: "In-store pickup",
};

export function formatDate(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(value: Date | string | null | undefined): string {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;
  return `${formatDate(date)} · ${date.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

export function waLink(phone: string, message: string): string {
  const clean = phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
