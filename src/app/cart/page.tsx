import Link from "next/link";
import type { Metadata } from "next";
import { getCart, listDeliveryZones } from "@/lib/store";
import { getLocale } from "@/lib/locale-server";
import { getCurrentUser } from "@/lib/auth";
import { t } from "@/lib/i18n-pages";
import { CartLines } from "@/components/cart-lines";
import { CouponForm } from "@/components/coupon-form";
import { EmptyState } from "@/components/ui";
import { formatXAF } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Your cart" };

export default async function CartPage() {
  const [cart, zones, locale, user] = await Promise.all([
    getCart(),
    listDeliveryZones(),
    getLocale(),
    getCurrentUser(),
  ]);
  // Delivery at checkout is national shipping or free in-store pickup;
  // the estimate shown here is the national shipping fee.
  const cheapest = zones.filter((z) => z.fee > 0).sort((a, b) => a.fee - b.fee)[0];
  const estimate = cheapest?.fee ?? 6500;
  const total = Math.max(cart.subtotal - cart.discount, 0) + estimate;

  return (
    <div className="wrap py-12 md:py-16">
      <h1 className="display text-4xl">{t(locale, "cart.title")}</h1>

      {cart.lines.length === 0 ? (
        <div className="mt-10">
          <EmptyState
            title={t(locale, "cart.empty")}
            body={t(locale, "cart.emptyBody")}
            action={
              <Link href="/shop" className="btn btn-primary mt-2">
                {t(locale, "cart.browse")}
              </Link>
            }
          />
        </div>
      ) : (
        <div className="mt-8 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
          <div>
            <CartLines lines={cart.lines} />
            <Link href="/shop" className="mt-6 inline-block text-xs tracking-[0.14em] uppercase text-ink-soft link-underline">
              {t(locale, "cart.continue")}
            </Link>
          </div>

          <aside className="card h-fit p-6 lg:sticky lg:top-32">
            <h2 className="display text-2xl">{t(locale, "cart.summary")}</h2>
            <dl className="mt-5 space-y-2 text-sm">
              <Row label={t(locale, "cart.subtotal")} value={formatXAF(cart.subtotal)} />
              {cart.discount > 0 ? (
                <Row
                  label={`${t(locale, "cart.discount")} (${cart.couponCode})`}
                  value={`− ${formatXAF(cart.discount)}`}
                />
              ) : null}
              <Row
                label={t(locale, "cart.deliveryEstimate")}
                value={estimate === 0 ? t(locale, "cart.complimentary") : formatXAF(estimate)}
              />
              <Row label={t(locale, "cart.vat")} value={t(locale, "cart.vatIncluded")} />
              <div className="mt-3 flex justify-between border-t border-line pt-3 text-base">
                <dt>{t(locale, "cart.total")}</dt>
                <dd>{formatXAF(total)}</dd>
              </div>
            </dl>

            <CouponForm current={cart.couponCode} />

            {user ? (
              <Link href="/checkout" className="btn btn-primary mt-6 w-full">
                {t(locale, "cart.checkoutAccount")}
              </Link>
            ) : (
              <>
                <Link href="/checkout?guest=1" className="btn btn-primary mt-6 w-full">
                  {t(locale, "cart.checkoutGuest")}
                </Link>
                <p className="mt-2 text-center text-xs text-muted">{t(locale, "cart.guestNote")}</p>
                <Link href="/register?next=/checkout" className="btn btn-secondary mt-3 w-full">
                  {t(locale, "choose.account")}
                </Link>
                <Link
                  href="/login?next=/checkout"
                  className="mt-3 block text-center text-xs text-accent link-underline"
                >
                  {t(locale, "choose.signin")}
                </Link>
              </>
            )}
            <p className="mt-4 text-xs leading-relaxed text-muted">
              {t(locale, "cart.freeAbove")}
            </p>
          </aside>
        </div>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-ink-soft">
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
