"use client";

import Image from "next/image";
import Link from "next/link";
import { useActionState, useEffect, useMemo, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { addToCart, inlineLoginAction, type ActionState } from "@/lib/actions";
import type { CardVariant } from "@/lib/store";
import { formatXAF } from "@/lib/utils";
import { t, type Locale } from "@/lib/i18n";

type Step = "configure" | "choose" | "login";

const initialLogin: ActionState = { ok: false, message: "" };

export function BuyNowModal({
  open,
  onClose,
  locale,
  name,
  slug,
  image,
  description,
  basePrice,
  variants,
  codEnabled,
  signedIn,
}: {
  open: boolean;
  onClose: () => void;
  locale: Locale;
  name: string;
  slug: string;
  image: string;
  description: string;
  basePrice: number;
  variants: CardVariant[];
  codEnabled: boolean;
  signedIn: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [step, setStep] = useState<Step>("configure");
  const [authed, setAuthed] = useState(signedIn);
  const panelRef = useRef<HTMLDivElement>(null);

  const colours = useMemo(() => Array.from(new Set(variants.map((v) => v.colour))), [variants]);
  const [colour, setColour] = useState(colours[0] ?? "");
  const sizes = useMemo(() => variants.filter((v) => v.colour === colour), [variants, colour]);
  const [variantId, setVariantId] = useState<number | undefined>(
    (sizes.find((v) => v.stockQty > 0) ?? sizes[0])?.id,
  );
  const [qty, setQty] = useState(1);
  const [payment, setPayment] = useState("mobile_money_mtn");

  const [loginState, loginAction, loginPending] = useActionState(inlineLoginAction, initialLogin);

  const selected = variants.find((v) => v.id === variantId);
  const stock = selected?.stockQty ?? 0;
  const unit = selected?.price ?? basePrice;
  const total = unit * qty;

  useEffect(() => {
    if (!open) return;
    setStep("configure");
    setQty(1);
    const first = colours[0] ?? "";
    setColour(first);
    const candidate =
      variants.find((v) => v.colour === first && v.stockQty > 0) ??
      variants.find((v) => v.colour === first);
    setVariantId(candidate?.id);
  }, [open, colours, variants]);

  // A successful inline sign-in moves the visitor straight on to checkout.
  useEffect(() => {
    if (!loginState.ok) return;
    setAuthed(true);
    if (selected) {
      start(async () => {
        await addToCart(selected.id, qty);
        router.push(`/checkout?pay=${payment}`);
        router.refresh();
      });
    }
  }, [loginState.ok]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    panelRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open) return null;

  function pickColour(next: string) {
    setColour(next);
    const candidate =
      variants.find((v) => v.colour === next && v.stockQty > 0) ??
      variants.find((v) => v.colour === next);
    setVariantId(candidate?.id);
    setQty(1);
  }

  function commit(destination: string) {
    if (!selected || stock <= 0) return;
    start(async () => {
      await addToCart(selected.id, qty);
      router.push(destination);
      router.refresh();
    });
  }

  const MEANS: Array<[string, string, string]> = [
    ["mobile_money_mtn", t(locale, "buy.momoMtn"), t(locale, "buy.momoHint")],
    ["mobile_money_orange", t(locale, "buy.momoOrange"), t(locale, "buy.momoHint")],
    ["card", t(locale, "buy.card"), t(locale, "buy.cardHint")],
    ...(codEnabled
      ? ([["cash_on_delivery", t(locale, "buy.cod"), t(locale, "buy.codHint")]] as Array<
          [string, string, string]
        >)
      : []),
  ];

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-ink/60 backdrop-blur-sm sm:items-center sm:p-6 fade"
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      {/*
        Responsive shell.
        • Column layout on phones (bottom sheet), row on desktop.
        • Capped at 92dvh — dvh, not vh, so mobile browser chrome never clips it.
        • The panel never scrolls as a whole; only the body inside each step does,
          which keeps the total and primary action permanently in view.
      */}
      <div
        ref={panelRef}
        tabIndex={-1}
        className="relative flex max-h-[92dvh] w-full max-w-3xl flex-col overflow-hidden rounded-t-xl bg-paper shadow-2xl outline-none rise sm:max-h-[88dvh] sm:flex-row sm:rounded-sm"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t(locale, "buy.close")}
          className="absolute right-3 top-3 z-20 flex h-9 w-9 items-center justify-center rounded-full bg-paper/95 text-lg text-ink-soft shadow hover:text-accent"
        >
          ×
        </button>

        {/* Image — desktop only, fills the full height of its column. */}
        <div className="relative hidden w-2/5 shrink-0 bg-accent-soft/50 sm:block">
          {image ? (
            <Image src={image} alt={name} fill sizes="320px" quality={62} className="object-cover object-top" />
          ) : null}
        </div>

        {/* Content column. min-h-0 lets the inner body scroll within the cap. */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* ------------------------- Step 1 ------------------------- */}
          {step === "configure" ? (
            <>
              <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
                {/* Compact image on phones, where the side image is hidden. */}
                {image ? (
                  <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-sm bg-accent-soft/50 sm:hidden">
                    <Image src={image} alt={name} fill sizes="100vw" quality={60} className="object-cover object-top" />
                  </div>
                ) : null}

                <h2 className="display text-xl leading-tight sm:text-2xl">{name}</h2>
                <p className="mt-1.5 line-clamp-2 text-xs leading-relaxed text-ink-soft">{description}</p>

                <p className="mt-3 text-lg sm:text-xl">{formatXAF(unit)}</p>

                <div className="mt-4">
                  <p className="label">
                    {t(locale, "buy.colour")} — {colour}
                  </p>
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

                <div className="mt-4">
                  <p className="label">{t(locale, "buy.size")}</p>
                  <div className="flex flex-wrap gap-2">
                    {sizes.map((v) => (
                      <button
                        key={v.id}
                        type="button"
                        disabled={v.stockQty <= 0}
                        onClick={() => {
                          setVariantId(v.id);
                          setQty(1);
                        }}
                        className={`chip ${v.id === variantId ? "chip-active" : ""} ${
                          v.stockQty <= 0 ? "line-through opacity-40" : ""
                        }`}
                      >
                        {v.size}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-4">
                  <p className="label">{t(locale, "buy.quantity")}</p>
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="flex items-center border border-line">
                      <button
                        type="button"
                        aria-label="−"
                        className="px-3 py-1.5 text-sm disabled:opacity-30"
                        disabled={qty <= 1}
                        onClick={() => setQty((q) => Math.max(1, q - 1))}
                      >
                        −
                      </button>
                      <span className="min-w-10 text-center text-sm">{qty}</span>
                      <button
                        type="button"
                        aria-label="+"
                        className="px-3 py-1.5 text-sm disabled:opacity-30"
                        disabled={qty >= stock}
                        onClick={() => setQty((q) => Math.min(stock, q + 1))}
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-muted">
                      {stock <= 0
                        ? t(locale, "buy.sizeSoldOut")
                        : stock <= 3
                          ? t(locale, "buy.onlyLeft", { n: stock })
                          : t(locale, "buy.inStock")}
                    </p>
                  </div>
                </div>

                {/* Payment terms & selectable means */}
                <div className="mt-5 rounded-sm border border-line bg-accent-soft/40 p-3.5">
                  <p className="eyebrow">{t(locale, "buy.priceTerms")}</p>
                  <p className="mt-1 text-[0.72rem] text-ink-soft">{t(locale, "buy.payChoose")}</p>
                  <div className="mt-2 grid gap-2">
                    {MEANS.map(([value, label, hint]) => (
                      <label
                        key={value}
                        className={`flex cursor-pointer items-start gap-2.5 border bg-paper p-2.5 text-xs transition-colors ${
                          payment === value ? "border-ink" : "border-line"
                        }`}
                      >
                        <input
                          type="radio"
                          name="buyPayment"
                          value={value}
                          checked={payment === value}
                          onChange={() => setPayment(value)}
                          className="mt-0.5 shrink-0"
                        />
                        <span className="min-w-0">
                          {label}
                          <span className="block text-[0.68rem] text-muted">{hint}</span>
                        </span>
                      </label>
                    ))}
                  </div>
                  <p className="mt-2 text-[0.68rem] leading-relaxed text-muted">
                    {t(locale, "buy.paySecure")}
                  </p>
                </div>

                {/* Secondary actions live in the scroll area. */}
                <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                  <button
                    className="btn btn-secondary btn-sm flex-1"
                    disabled={pending || stock <= 0}
                    onClick={() =>
                      selected &&
                      start(async () => {
                        await addToCart(selected.id, qty);
                        router.refresh();
                        onClose();
                      })
                    }
                  >
                    {t(locale, "buy.addToCart")}
                  </button>
                  <button className="btn btn-ghost btn-sm flex-1" onClick={onClose}>
                    {t(locale, "buy.continueShopping")}
                  </button>
                </div>

                <Link
                  href={`/product/${slug}`}
                  className="mt-3 block text-center text-xs text-muted link-underline"
                >
                  {t(locale, "buy.fullDetails")} →
                </Link>
              </div>

              {/* Pinned footer — total and primary action always visible. */}
              <div className="shrink-0 border-t border-line bg-paper px-5 py-3.5 sm:px-7">
                <div className="flex items-center justify-between">
                  <span className="eyebrow">{t(locale, "buy.total")}</span>
                  <span className="display text-xl sm:text-2xl">{formatXAF(total)}</span>
                </div>
                <button
                  className="btn btn-primary mt-3 w-full"
                  disabled={pending || stock <= 0}
                  onClick={() => setStep("choose")}
                >
                  {stock > 0 ? t(locale, "buy.proceed") : t(locale, "buy.soldOut")}
                </button>
              </div>
            </>
          ) : null}

          {/* ------------------------- Step 2 ------------------------- */}
          {step === "choose" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-7">
              <div className="my-auto">
                <p className="eyebrow">{name}</p>
                <h2 className="display mt-2 text-xl leading-tight sm:text-2xl">
                  {t(locale, "choose.title")}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{t(locale, "choose.body")}</p>

                <dl className="mt-5 space-y-1 border-y border-line py-4 text-sm">
                  <div className="flex justify-between gap-3 text-ink-soft">
                    <dt className="min-w-0 truncate">
                      {selected?.size} · {selected?.colour} × {qty}
                    </dt>
                    <dd className="shrink-0">{formatXAF(total)}</dd>
                  </div>
                </dl>

                {authed ? (
                  <button
                    className="btn btn-primary mt-5 w-full"
                    disabled={pending}
                    onClick={() => commit(`/checkout?pay=${payment}`)}
                  >
                    {pending ? "…" : t(locale, "cart.checkoutAccount")}
                  </button>
                ) : (
                  <>
                    <button
                      className="btn btn-primary mt-5 w-full"
                      disabled={pending}
                      onClick={() => commit(`/register?next=/checkout%3Fpay%3D${payment}`)}
                    >
                      {pending ? "…" : t(locale, "choose.account")}
                    </button>
                    <p className="mt-1.5 text-center text-xs text-muted">
                      {t(locale, "choose.accountHint")}
                    </p>

                    <button
                      className="btn btn-secondary mt-3 w-full"
                      disabled={pending}
                      onClick={() => commit(`/checkout?guest=1&pay=${payment}`)}
                    >
                      {pending ? "…" : t(locale, "choose.guest")}
                    </button>
                    <p className="mt-1.5 text-center text-xs text-muted">
                      {t(locale, "choose.guestHint")}
                    </p>

                    <button
                      type="button"
                      onClick={() => setStep("login")}
                      className="mt-4 block w-full text-center text-xs text-accent link-underline"
                    >
                      {t(locale, "buy.haveAccount")}
                    </button>
                  </>
                )}

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-xs text-muted link-underline"
                    onClick={() => setStep("configure")}
                  >
                    {t(locale, "choose.back")}
                  </button>
                  <button type="button" className="text-xs text-muted link-underline" onClick={onClose}>
                    {t(locale, "buy.continueShopping")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          {/* ------------------- Step 3: inline login ------------------- */}
          {step === "login" ? (
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto px-5 py-6 sm:px-7">
              <div className="my-auto">
                <p className="eyebrow">{name}</p>
                <h2 className="display mt-2 text-xl leading-tight sm:text-2xl">
                  {t(locale, "buy.signInTitle")}
                </h2>
                <p className="mt-2 text-sm text-ink-soft">{t(locale, "buy.signInBody")}</p>

                <form action={loginAction} className="mt-5 space-y-3">
                  <div>
                    <label className="label" htmlFor="buy-email">
                      {t(locale, "buy.email")}
                    </label>
                    <input
                      id="buy-email"
                      name="email"
                      type="text"
                      required
                      autoComplete="username"
                      className="field"
                    />
                  </div>
                  <div>
                    <label className="label" htmlFor="buy-password">
                      {t(locale, "buy.password")}
                    </label>
                    <input
                      id="buy-password"
                      name="password"
                      type="password"
                      required
                      autoComplete="current-password"
                      className="field"
                    />
                  </div>
                  <button className="btn btn-primary w-full" disabled={loginPending || pending}>
                    {loginPending || pending ? t(locale, "buy.signingIn") : t(locale, "buy.signIn")}
                  </button>
                  {loginState.message && !loginState.ok ? (
                    <p className="text-xs text-red-600">{loginState.message}</p>
                  ) : null}
                  {loginState.ok ? (
                    <p className="text-xs text-accent">
                      {t(locale, "buy.welcomeBack")}, {loginState.message} …
                    </p>
                  ) : null}
                </form>

                <button
                  type="button"
                  className="mt-4 block w-full text-center text-xs text-accent link-underline"
                  onClick={() => commit(`/checkout?guest=1&pay=${payment}`)}
                >
                  {t(locale, "buy.noAccount")}
                </button>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    className="text-xs text-muted link-underline"
                    onClick={() => setStep("choose")}
                  >
                    {t(locale, "choose.back")}
                  </button>
                  <button type="button" className="text-xs text-muted link-underline" onClick={onClose}>
                    {t(locale, "buy.continueShopping")}
                  </button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
