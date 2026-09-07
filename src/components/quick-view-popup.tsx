"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { addToCart } from "@/lib/actions";
import { formatXAF } from "@/lib/utils";
import { t, type Locale } from "@/lib/i18n";

type QuickViewData = {
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  image: string;
  images: Array<{ url: string; alt: string }>;
  codEnabled: boolean;
  signedIn: boolean;
  variants: Array<{
    id: number;
    size: string;
    colour: string;
    stockQty: number;
    price: number;
  }>;
};

export function QuickViewPopup({
  slug,
  locale,
  children,
}: {
  slug: string;
  locale: Locale;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<QuickViewData | null>(null);
  const [loading, setLoading] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  async function openPopup(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setOpen(true);
    if (data || loading) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/product/${slug}?locale=${locale}`);
      if (res.ok) setData((await res.json()) as QuickViewData);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open]);

  const colours = data ? Array.from(new Set(data.variants.map((v) => v.colour))) : [];
  const [selectedColour, setSelectedColour] = useState("");
  useEffect(() => {
    if (data && colours.length > 0) setSelectedColour(colours[0]);
  }, [data]);

  const sizesForColour = data
    ? data.variants.filter((v) => v.colour === (selectedColour || colours[0]))
    : [];
  const totalStock = data ? data.variants.reduce((s, v) => s + v.stockQty, 0) : 0;

  const [selectedVariantId, setSelectedVariantId] = useState<number | null>(null);
  useEffect(() => {
    if (sizesForColour.length > 0) {
      const inStock = sizesForColour.find((v) => v.stockQty > 0);
      setSelectedVariantId(inStock?.id ?? sizesForColour[0].id);
    }
  }, [selectedColour]);

  const [qty, setQty] = useState(1);
  useEffect(() => { setQty(1); }, [selectedVariantId]);

  const selectedVariant = data?.variants.find((v) => v.id === selectedVariantId);
  const stock = selectedVariant?.stockQty ?? 0;
  const unit = selectedVariant?.price ?? data?.basePrice ?? 0;
  const total = unit * qty;

  const allImages = data ? (data.images.length > 0 ? data.images : [{ url: data.image, alt: data.name }]) : [];
  const [activeImage, setActiveImage] = useState(0);
  useEffect(() => { setActiveImage(0); }, [data]);

  function handleAddToCart() {
    if (!selectedVariant || stock <= 0) return;
    start(async () => {
      await addToCart(selectedVariant.id, qty);
      router.refresh();
      setOpen(false);
    });
  }

  function handleBuyNow() {
    if (!selectedVariant || stock <= 0) return;
    start(async () => {
      await addToCart(selectedVariant.id, qty);
      router.push("/checkout");
      router.refresh();
    });
  }

  return (
    <>
      <span onClick={openPopup} className="cursor-pointer">
        {children}
      </span>

      {open && (
        <div
          className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/50 backdrop-blur-sm p-4 sm:p-8 fade"
          role="dialog"
          aria-modal="true"
          aria-label={data?.name ?? "Product quick view"}
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={panelRef}
            tabIndex={-1}
            className="relative flex h-[90dvh] w-full max-w-4xl overflow-hidden rounded-sm bg-paper shadow-2xl outline-none rise sm:h-[85dvh] sm:flex-row"
          >
            {/* Close button */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close"
              className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-paper/90 text-ink-soft transition-colors hover:bg-paper hover:text-ink shadow-sm"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Image panel — desktop: left column */}
            <div className="relative hidden w-[45%] shrink-0 bg-accent-soft/30 sm:block">
              {allImages.length > 0 && allImages[activeImage] ? (
                <Image
                  src={allImages[activeImage].url}
                  alt={allImages[activeImage].alt || data?.name || ""}
                  fill
                  sizes="400px"
                  quality={65}
                  className="object-cover object-top"
                />
              ) : null}
              {/* Thumbnail strip */}
              {allImages.length > 1 && (
                <div className="absolute bottom-3 left-3 z-10 flex gap-2">
                  {allImages.map((img, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setActiveImage(i)}
                      className={`relative h-11 w-11 overflow-hidden rounded border-2 transition-all duration-200 ${
                        i === activeImage ? "border-white shadow-md" : "border-white/40 opacity-70 hover:opacity-100"
                      }`}
                    >
                      <Image src={img.url} alt={img.alt || ""} fill sizes="44px" quality={40} className="object-cover object-top" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Content panel — right column */}
            <div className="flex h-full min-h-0 flex-1 flex-col overflow-y-auto">
              {/* Mobile image */}
              {allImages.length > 0 && allImages[activeImage] ? (
                <div className="sm:hidden">
                  <div className="relative aspect-[4/5] w-full bg-accent-soft/30">
                    <Image
                      src={allImages[activeImage].url}
                      alt={allImages[activeImage].alt || data?.name || ""}
                      fill
                      sizes="100vw"
                      quality={60}
                      className="object-cover object-top"
                    />
                  </div>
                  {allImages.length > 1 && (
                    <div className="flex gap-2 px-5 py-3">
                      {allImages.map((img, i) => (
                        <button
                          key={i}
                          type="button"
                          onClick={() => setActiveImage(i)}
                          className={`relative h-11 w-11 shrink-0 overflow-hidden rounded border-2 transition-all duration-200 ${
                            i === activeImage ? "border-ink shadow-sm" : "border-line opacity-60 hover:opacity-100"
                          }`}
                        >
                          <Image src={img.url} alt={img.alt || ""} fill sizes="44px" quality={40} className="object-cover object-top" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : null}

              {/* Text content */}
              <div className="flex flex-1 flex-col px-6 py-6 sm:px-8 sm:py-7">
                {loading && !data ? (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted">Loading…</p>
                  </div>
                ) : data ? (
                  <>
                    {/* Header */}
                    <div>
                      <h2 className="display text-2xl leading-tight sm:text-3xl">{data.name}</h2>
                      <p className="mt-2 text-sm leading-relaxed text-ink-soft">{data.description}</p>
                    </div>

                    {/* Price */}
                    <div className="mt-5 border-t border-line pt-4">
                      <p className="display text-2xl sm:text-3xl">{formatXAF(unit)}</p>
                    </div>

                    {/* Colours */}
                    {colours.length > 0 && (
                      <div className="mt-5">
                        <p className="eyebrow mb-2">{t(locale, "buy.colour")} — {selectedColour || colours[0]}</p>
                        <div className="flex flex-wrap gap-2">
                          {colours.map((c) => (
                            <button
                              key={c}
                              type="button"
                              onClick={() => setSelectedColour(c)}
                              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
                                c === (selectedColour || colours[0])
                                  ? "border-ink bg-ink text-white"
                                  : "border-line text-ink-soft hover:border-ink-soft"
                              }`}
                            >
                              {c}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Sizes */}
                    {sizesForColour.length > 0 && (
                      <div className="mt-4">
                        <p className="eyebrow mb-2">{t(locale, "buy.size")}</p>
                        <div className="flex flex-wrap gap-2">
                          {sizesForColour.map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              disabled={v.stockQty <= 0}
                              onClick={() => { setSelectedVariantId(v.id); setQty(1); }}
                              className={`min-w-[2.5rem] rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-200 ${
                                v.id === selectedVariantId
                                  ? "border-ink bg-ink text-white"
                                  : v.stockQty <= 0
                                    ? "border-line text-muted line-through opacity-40"
                                    : "border-line text-ink-soft hover:border-ink-soft"
                              }`}
                            >
                              {v.size}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Quantity + Stock */}
                    <div className="mt-4 flex items-center gap-4">
                      <div>
                        <p className="eyebrow mb-2">{t(locale, "buy.quantity")}</p>
                        <div className="flex items-center rounded-full border border-line">
                          <button
                            type="button"
                            aria-label="Decrease quantity"
                            className="flex h-9 w-9 items-center justify-center text-sm text-ink-soft transition-colors hover:bg-accent-soft disabled:opacity-30"
                            disabled={qty <= 1}
                            onClick={() => setQty((q) => Math.max(1, q - 1))}
                          >
                            −
                          </button>
                          <span className="min-w-[2rem] text-center text-sm font-medium">{qty}</span>
                          <button
                            type="button"
                            aria-label="Increase quantity"
                            className="flex h-9 w-9 items-center justify-center text-sm text-ink-soft transition-colors hover:bg-accent-soft disabled:opacity-30"
                            disabled={qty >= stock}
                            onClick={() => setQty((q) => Math.min(stock, q + 1))}
                          >
                            +
                          </button>
                        </div>
                      </div>
                      <p className="mt-6 text-xs text-muted">
                        {stock <= 0
                          ? t(locale, "buy.sizeSoldOut")
                          : stock <= 3
                            ? t(locale, "buy.onlyLeft", { n: stock })
                            : t(locale, "buy.inStock")}
                      </p>
                    </div>

                    {/* Payment + Delivery */}
                    <div className="mt-5 rounded border border-line bg-canvas px-4 py-3">
                      <p className="eyebrow mb-1.5">{t(locale, "buy.payTitle")}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-ink-soft">
                        <span>{t(locale, "buy.momoMtn")}</span>
                        <span>{t(locale, "buy.momoOrange")}</span>
                        <span>{t(locale, "buy.card")}</span>
                        {data.codEnabled && <span>{t(locale, "buy.cod")}</span>}
                      </div>
                      <div className="mt-2 border-t border-line pt-2 text-xs text-muted">
                        <p>{t(locale, "buy.delivery")}</p>
                        <p className="mt-0.5">{t(locale, "buy.returns")}</p>
                      </div>
                    </div>

                    {/* Total + Actions — pinned to bottom */}
                    <div className="mt-auto pt-5 border-t border-line">
                      <div className="flex items-end justify-between mb-4">
                        <span className="eyebrow">{t(locale, "buy.total")}</span>
                        <span className="display text-2xl sm:text-3xl">{formatXAF(total)}</span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          className="btn btn-primary flex-1"
                          disabled={pending || stock <= 0}
                          onClick={handleAddToCart}
                        >
                          {pending ? "…" : t(locale, "buy.addToCart")}
                        </button>
                        <button
                          className="btn bg-ink text-white flex-1 hover:bg-accent hover:text-white border border-ink"
                          disabled={pending || stock <= 0}
                          onClick={handleBuyNow}
                        >
                          {pending ? "…" : t(locale, "buy.proceed")}
                        </button>
                      </div>
                      <Link
                        href={`/product/${data.slug}`}
                        className="mt-3 block text-center text-xs text-muted link-underline"
                        onClick={() => setOpen(false)}
                      >
                        {t(locale, "buy.fullDetails")} →
                      </Link>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-1 items-center justify-center">
                    <p className="text-sm text-muted">Could not load product details.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
