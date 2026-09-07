import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { StatusPill } from "@/components/ui";
import { DELIVERY_LABELS, PAYMENT_LABELS, formatXAF, waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

const TRACK = ["placed", "processing", "ready", "out_for_delivery", "delivered"];

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ number: string }>;
}) {
  const { number } = await params;
  const order = (
    await db.select().from(orders).where(eq(orders.orderNumber, number.toUpperCase())).limit(1)
  )[0];
  if (!order) notFound();
  const [items, settings] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    getSettings(),
  ]);
  const stage = TRACK.indexOf(order.status);

  return (
    <div className="wrap max-w-3xl py-16">
      <p className="eyebrow">Thank you</p>
      <h1 className="display mt-2 text-4xl">Your order is confirmed</h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        We have sent a confirmation to {order.guestEmail} and a WhatsApp message to {order.guestPhone}.
        Please keep your order number: <strong>{order.orderNumber}</strong>.
      </p>

      <div className="card mt-8 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="eyebrow">Order</p>
            <p className="display text-2xl">{order.orderNumber}</p>
          </div>
          <StatusPill status={order.status} />
        </div>

        <ol className="mt-6 grid gap-2 sm:grid-cols-5">
          {TRACK.map((step, index) => (
            <li key={step} className="text-center">
              <div className={`h-1 w-full ${index <= stage ? "bg-accent" : "bg-line"}`} />
              <p className={`mt-2 text-[0.65rem] tracking-[0.1em] uppercase ${index <= stage ? "text-ink" : "text-muted"}`}>
                {step.replace(/_/g, " ")}
              </p>
            </li>
          ))}
        </ol>

        <ul className="mt-8 divide-y divide-line border-y border-line">
          {items.map((item) => (
            <li key={item.id} className="flex justify-between gap-4 py-4 text-sm">
              <div>
                <Link href={`/product/${item.productSlug}`} className="link-underline">{item.productName}</Link>
                <p className="text-xs text-muted">{item.variantLabel} · × {item.quantity}</p>
              </div>
              <p>{formatXAF(item.unitPrice * item.quantity)}</p>
            </li>
          ))}
        </ul>

        <dl className="mt-6 space-y-2 text-sm text-ink-soft">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatXAF(order.subtotal)}</dd></div>
          {order.discount > 0 ? (
            <div className="flex justify-between"><dt>Discount</dt><dd>− {formatXAF(order.discount)}</dd></div>
          ) : null}
          <div className="flex justify-between"><dt>Delivery — {DELIVERY_LABELS[order.deliveryMethod]}</dt><dd>{order.deliveryFee === 0 ? "Complimentary" : formatXAF(order.deliveryFee)}</dd></div>
          <div className="flex justify-between"><dt>Payment</dt><dd>{PAYMENT_LABELS[order.paymentMethod]}</dd></div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-base text-ink"><dt>Total</dt><dd>{formatXAF(order.total)}</dd></div>
        </dl>
      </div>

      {!order.userId ? (
        <div className="card mt-6 bg-accent-soft/40 p-6">
          <h2 className="display text-xl">Keep track of this order</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Create an account with {order.guestEmail} and this order will appear in your history,
            along with saved addresses and a wishlist.
          </p>
          <Link href={`/register?next=/account/orders`} className="btn btn-secondary btn-sm mt-4">
            Create an account
          </Link>
        </div>
      ) : null}

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/shop" className="btn btn-primary">Continue shopping</Link>
        <a
          className="btn btn-secondary"
          target="_blank"
          rel="noreferrer"
          href={waLink(settings.whatsapp_number, `Hello OSSZ Collections, this is about order ${order.orderNumber}.`)}
        >
          Message us on WhatsApp
        </a>
      </div>
    </div>
  );
}
