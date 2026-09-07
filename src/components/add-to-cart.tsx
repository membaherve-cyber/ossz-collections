"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart, toggleWishlist } from "@/lib/actions";
import { formatXAF } from "@/lib/utils";
import { t, type Locale } from "@/lib/i18n";
import dynamic from "next/dynamic";

const BuyNowModal = dynamic(() => import("@/components/buy-now-modal").then((m) => m.BuyNowModal));

type Variant = { id: number; size: string; colour: string; stockQty: number; price: number };

export function AddToCart({
  productId,
  basePrice,
  variants,
  initiallySaved,
  signedIn,
  locale = "en",
  codEnabled = false,
  name,
  slug,
  image,
  description,
}: {
  productId: number;
  basePrice: number;
  variants: Variant[];
  initiallySaved: boolean;
  signedIn: boolean;
  locale?: Locale;
  codEnabled?: boolean;
  name: string;
  slug: string;
  image: string;
  description: string;
}) {
  const router = useRouter();
  const colours = useMemo(() => Array.from(new Set(variants.map((v) => v.colour))), [variants]);
  const [colour, setColour] = useState(colours[0] ?? "");
  const sizes = useMemo(
    () => variants.filter((v) => v.colour === colour),
    [variants, colour],
  );
  const firstAvailable = sizes.find((v) => v.stockQty > 0) ?? sizes[0];
  const [variantId, setVariantId] = useState<number | undefined>(firstAvailable?.id);
  const [saved, setSaved] = useState(initiallySaved);
  const [note, setNote] = useState("");
  const [pending, startTransition] = useTransition();
  const [buyOpen, setBuyOpen] = useState(false);

  const selected = variants.find((v) => v.id === variantId) ?? firstAvailable;
  const price = selected?.price ?? basePrice;
  const stock = selected?.stockQty ?? 0;

  function pickColour(next: string) {
    setColour(next);
    const candidate = variants.find((v) => v.colour === next && v.stockQty > 0)
      ?? variants.find((v) => v.colour === next);
    setVariantId(candidate?.id);
  }

  function add() {
    if (!selected || stock <= 0) return;
    startTransition(async () => {
      const result = await addToCart(selected.id, 1);
      setNote(result.message);
      router.refresh();
    });
  }

  function save() {
    startTransition(async () => {
      const result = await toggleWishlist(productId);
      setNote(result.message);
      if (result.ok) setSaved((v) => !v);
      router.refresh();
    });
  }

  return (
    <div className="mt-7 border-t border-line pt-6">
      <div>
        <p className="label">Colour — {colour}</p>
        <div className="flex flex-wrap gap-2">
          {colours.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => pickColour(c)}
              className={`chip ${c === colour ? "chip-active" : ""}`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5">
        <p className="label">Size</p>
        <div className="flex flex-wrap gap-2">
          {sizes.map((v) => (
            <button
              key={v.id}
              type="button"
              disabled={v.stockQty <= 0}
              onClick={() => setVariantId(v.id)}
              className={`chip ${v.id === variantId ? "chip-active" : ""} ${
                v.stockQty <= 0 ? "line-through opacity-40" : ""
              }`}
            >
              {v.size}
            </button>
          ))}
        </div>
      </div>

      <p className="mt-4 text-xs text-muted">
        {stock > 0
          ? stock <= 3
            ? `Only ${stock} left in this size — ${formatXAF(price)}`
            : `In stock · ${formatXAF(price)}`
          : "This size is sold out — the concierge can tell you when it returns."}
      </p>

      <div className="mt-5 flex flex-col gap-3">
        <button
          className="btn btn-primary w-full"
          onClick={() => setBuyOpen(true)}
          disabled={pending || stock <= 0}
        >
          {stock > 0 ? t(locale, "buy.now") : t(locale, "buy.soldOut")}
        </button>
        <div className="flex flex-col gap-3 sm:flex-row">
          <button className="btn btn-secondary flex-1" onClick={add} disabled={pending || stock <= 0}>
            {pending ? "…" : t(locale, "buy.addToCart")}
          </button>
          <button className="btn btn-secondary" onClick={save} disabled={pending}>
            {saved ? `\u2665 ${t(locale, "buy.saved")}` : `\u2661 ${t(locale, "buy.wishlist")}`}
          </button>
        </div>
      </div>

      {buyOpen ? (
      <BuyNowModal
        open={buyOpen}
        onClose={() => setBuyOpen(false)}
        locale={locale}
        name={name}
        slug={slug}
        image={image}
        description={description}
        basePrice={basePrice}
        variants={variants.map((v) => ({
          id: v.id, size: v.size, colour: v.colour, stockQty: v.stockQty, price: v.price,
        }))}
        codEnabled={codEnabled}
        signedIn={signedIn}
      />
      ) : null}

      {note ? <p className="mt-3 text-xs text-accent">{note}</p> : null}
      {!signedIn ? (
        <p className="mt-2 text-xs text-muted">
          You may check out as a guest — no account required.
        </p>
      ) : null}
    </div>
  );
}
