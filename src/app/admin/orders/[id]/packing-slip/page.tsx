import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { guardPage } from "@/lib/guard";
import { PrintButton } from "@/components/print-button";
import { DELIVERY_LABELS, PAYMENT_LABELS, formatDateTime, formatXAF } from "@/lib/utils";

export const dynamic = "force-dynamic";

/** §9.1 — printable / shareable packing slip, one per order. */
export default async function PackingSlip({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("orders");
  const { id } = await params;
  const order = (await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1))[0];
  if (!order) notFound();
  const [items, settings] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    getSettings(),
  ]);
  const ship = (order.shippingSnapshot ?? {}) as Record<string, string>;

  return (
    <div className="mx-auto max-w-2xl bg-white p-8 text-ink print:p-0">
      <PrintButton />

      <header className="flex items-start justify-between border-b border-line pb-5">
        <div>
          <p className="display text-2xl tracking-[0.22em] uppercase">OSSZ</p>
          <p className="mt-1 text-xs text-muted">{settings.store_address}</p>
          <p className="text-xs text-muted">{settings.contact_email} · {settings.whatsapp_number}</p>
        </div>
        <div className="text-right">
          <p className="eyebrow">Packing slip</p>
          <p className="display text-xl">{order.orderNumber}</p>
          <p className="text-xs text-muted">{formatDateTime(order.createdAt)}</p>
        </div>
      </header>

      <section className="mt-6 grid grid-cols-2 gap-6 text-sm">
        <div>
          <p className="eyebrow">Deliver to</p>
          <p className="mt-1 font-medium">{order.customerName}</p>
          <p className="text-ink-soft">{order.guestPhone}</p>
          <p className="text-ink-soft">{order.guestEmail}</p>
          {ship.street ? <p className="mt-1 text-ink-soft">{ship.street}</p> : null}
          {ship.area || ship.city ? (
            <p className="text-ink-soft">{[ship.area, ship.city].filter(Boolean).join(", ")}</p>
          ) : null}
          {ship.notes ? <p className="mt-1 text-xs text-muted">Note: {ship.notes}</p> : null}
        </div>
        <div>
          <p className="eyebrow">Method</p>
          <p className="mt-1 text-ink-soft">{DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}</p>
          <p className="text-ink-soft">{order.deliveryZone}</p>
          <p className="mt-2 eyebrow">Payment</p>
          <p className="text-ink-soft">{PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}</p>
          <p className="text-xs text-muted">{order.paymentStatus}</p>
        </div>
      </section>

      <table className="mt-7 w-full text-sm">
        <thead>
          <tr className="border-y border-line text-left text-xs uppercase text-muted">
            <th className="py-2">Piece</th>
            <th>Size / colour</th>
            <th className="text-center">Qty</th>
            <th className="text-right">Line</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id} className="border-b border-line/60">
              <td className="py-2.5">{item.productName}</td>
              <td className="text-muted">{item.variantLabel}</td>
              <td className="text-center">{item.quantity}</td>
              <td className="text-right">{formatXAF(item.unitPrice * item.quantity)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <dl className="mt-5 ml-auto max-w-xs space-y-1 text-sm">
        <div className="flex justify-between text-ink-soft"><dt>Subtotal</dt><dd>{formatXAF(order.subtotal)}</dd></div>
        {order.discount > 0 ? (
          <div className="flex justify-between text-ink-soft"><dt>Discount</dt><dd>− {formatXAF(order.discount)}</dd></div>
        ) : null}
        <div className="flex justify-between text-ink-soft"><dt>Delivery</dt><dd>{formatXAF(order.deliveryFee)}</dd></div>
        <div className="flex justify-between border-t border-line pt-2 text-base"><dt>Total</dt><dd>{formatXAF(order.total)}</dd></div>
      </dl>

      <div className="mt-10 grid grid-cols-2 gap-8 text-xs text-muted">
        <div className="border-t border-line pt-2">Packed by</div>
        <div className="border-t border-line pt-2">Received by</div>
      </div>

      <p className="mt-8 text-center text-xs text-muted">
        Thank you for choosing OSSZ Collections. Returns accepted within 14 days, unworn with tags.
      </p>
    </div>
  );
}
