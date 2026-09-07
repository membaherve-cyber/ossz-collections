"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { t, type Locale } from "@/lib/i18n";
import type { CardVariant } from "@/lib/store";

const BuyNowModal = dynamic(() =>
  import("@/components/buy-now-modal").then((m) => m.BuyNowModal),
);

type Payload = {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  image: string;
  codEnabled: boolean;
  signedIn: boolean;
  variants: CardVariant[];
};

/**
 * Tiny client island at the foot of each product card. Product detail is
 * fetched only when a visitor actually opens the panel, so catalogue pages
 * ship no variant data and almost no JavaScript.
 */
export function BuyNowButton({
  slug,
  locale,
  inStock,
  variant = "block",
}: {
  slug: string;
  locale: Locale;
  inStock: boolean;
  /** "overlay" places the button on the photograph itself. */
  variant?: "block" | "overlay";
}) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);

  async function openPanel() {
    setOpen(true);
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/product/${slug}?locale=${locale}`);
      if (res.ok) setData((await res.json()) as Payload);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={openPanel}
        disabled={!inStock}
        className={
          variant === "overlay"
            ? "absolute inset-x-3 bottom-3 z-10 rounded-lg bg-paper/95 py-2.5 text-[0.7rem] font-medium tracking-[0.16em] uppercase text-ink shadow-lg backdrop-blur transition hover:bg-ink hover:text-white disabled:opacity-60 md:translate-y-2 md:opacity-0 md:group-hover:translate-y-0 md:group-hover:opacity-100 md:focus-visible:translate-y-0 md:focus-visible:opacity-100"
            : "btn btn-secondary btn-sm mt-3 w-full disabled:cursor-not-allowed"
        }
      >
        {inStock ? t(locale, "buy.now") : t(locale, "buy.soldOut")}
      </button>

      {open && data ? (
        <BuyNowModal
          open={open}
          onClose={() => setOpen(false)}
          locale={locale}
          name={data.name}
          slug={data.slug}
          image={data.image}
          description={data.description}
          basePrice={data.basePrice}
          variants={data.variants}
          codEnabled={data.codEnabled}
          signedIn={data.signedIn}
        />
      ) : null}

      {open && !data ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/60 backdrop-blur-sm">
          <p className="rounded-sm bg-paper px-6 py-4 text-sm text-ink-soft">…</p>
        </div>
      ) : null}
    </>
  );
}
