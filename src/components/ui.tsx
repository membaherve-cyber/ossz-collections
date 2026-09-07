import Link from "next/link";
import type { ReactNode } from "react";
import { STATUS_LABELS } from "@/lib/utils";

export function SectionHead({
  eyebrow,
  title,
  intro,
  href,
  hrefLabel,
  center = false,
}: {
  eyebrow?: string;
  title: string;
  intro?: string;
  href?: string;
  hrefLabel?: string;
  center?: boolean;
}) {
  return (
    <div
      className={`flex flex-col gap-3 ${
        center ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"
      }`}
    >
      <div className={center ? "max-w-2xl" : "max-w-2xl"}>
        {eyebrow ? <p className="eyebrow">{eyebrow}</p> : null}
        <h2 className="display mt-2 text-3xl md:text-4xl">{title}</h2>
        {intro ? <p className="mt-3 text-sm leading-relaxed text-ink-soft">{intro}</p> : null}
      </div>
      {href && hrefLabel ? (
        <Link href={href} className="link-underline text-[0.75rem] tracking-[0.16em] uppercase text-ink-soft">
          {hrefLabel}
        </Link>
      ) : null}
    </div>
  );
}

export function StatusPill({ status }: { status: string }) {
  const tone =
    status === "delivered" || status === "confirmed" || status === "paid" || status === "published"
      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
      : status === "cancelled" || status === "returned"
        ? "bg-red-50 text-red-700 border-red-200"
        : status === "out_for_delivery" || status === "ready"
          ? "bg-amber-50 text-amber-800 border-amber-200"
          : "bg-accent-soft text-ink border-line";
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.68rem] tracking-wide ${tone}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}

export function EmptyState({ title, body, action }: { title: string; body: string; action?: ReactNode }) {
  return (
    <div className="card flex flex-col items-center gap-3 px-6 py-16 text-center">
      <h3 className="display text-2xl">{title}</h3>
      <p className="max-w-md text-sm text-ink-soft">{body}</p>
      {action}
    </div>
  );
}

export function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="card p-5">
      <p className="eyebrow">{label}</p>
      <p className="display mt-2 text-3xl">{value}</p>
      {hint ? <p className="mt-1 text-xs text-muted">{hint}</p> : null}
    </div>
  );
}
