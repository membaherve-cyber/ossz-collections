"use client";

import Link from "next/link";

/** Page-level boundary — keeps the header, footer and navigation usable. */
export default function PageError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="wrap flex min-h-[55vh] max-w-lg flex-col items-center justify-center py-20 text-center">
      <h1 className="display text-3xl">This page could not be displayed</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        Our apologies. You may try again, or continue browsing the collection.
      </p>
      {error.digest ? <p className="mt-2 text-xs text-muted">Reference: {error.digest}</p> : null}
      <div className="mt-7 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">Try again</button>
        <button
          onClick={() => {
            // Most often this page appears because the browser is holding a
            // cached copy of an older build. Clear everything and reload.
            void (async () => {
              try {
                if ("serviceWorker" in navigator) {
                  const regs = await navigator.serviceWorker.getRegistrations();
                  await Promise.all(regs.map((r) => r.unregister()));
                }
                if ("caches" in window) {
                  const keys = await caches.keys();
                  await Promise.all(keys.map((k) => caches.delete(k)));
                }
              } finally {
                window.location.reload();
              }
            })();
          }}
          className="btn btn-secondary"
        >
          Clear cache &amp; reload
        </button>
        <Link href="/shop" className="btn btn-ghost">Browse the shop</Link>
      </div>
    </div>
  );
}
