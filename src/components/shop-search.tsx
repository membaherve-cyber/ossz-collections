"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

/**
 * Modern, glossy search bar for the shop page.
 * Submits to /shop?q=… so the server-side catalogue filter does the work.
 */
export function ShopSearch({
  initialQ,
  label,
  hint,
  clearLabel,
  placeholder,
  cta,
}: {
  initialQ?: string;
  label: string;
  hint: string;
  clearLabel: string;
  placeholder: string;
  cta: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [value, setValue] = useState(initialQ ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  // Keep the input in sync when the URL changes (e.g. clear link).
  useEffect(() => {
    setValue(searchParams.get("q") ?? "");
  }, [searchParams]);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const q = value.trim();
    const next = new URLSearchParams(searchParams.toString());
    if (q) next.set("q", q);
    else next.delete("q");
    next.delete("page");
    router.push(`/shop?${next.toString()}`);
  }

  return (
    <form onSubmit={submit} role="search" aria-label={label} className="group relative">
      <div className="glossy-search relative">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-soft/70 transition-colors group-focus-within:text-accent"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
        <input
          ref={inputRef}
          type="search"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          aria-label={label}
          className="w-full bg-transparent py-3.5 pl-11 pr-28 text-sm text-ink outline-none placeholder:text-muted"
        />
        <div className="absolute right-2.5 top-1/2 flex -translate-y-1/2 items-center gap-1.5">
          {value ? (
            <button
              type="button"
              onClick={() => {
                setValue("");
                inputRef.current?.focus();
                const next = new URLSearchParams(searchParams.toString());
                next.delete("q");
                next.delete("page");
                router.push(`/shop?${next.toString()}`);
              }}
              className="rounded-full px-2.5 py-1 text-[0.68rem] tracking-[0.1em] uppercase text-ink-soft transition-colors hover:text-ink"
            >
              {clearLabel}
            </button>
          ) : null}
          <button
            type="submit"
            className="btn btn-sm bg-ink text-white hover:bg-accent"
          >
            {cta}
          </button>
        </div>
      </div>
      <p className="mt-2 text-xs text-muted">{hint}</p>
    </form>
  );
}