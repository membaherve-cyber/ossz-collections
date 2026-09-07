import Link from "next/link";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/lib/admin-actions";
import { StatusPill } from "@/components/ui";
import { DELIVERY_LABELS, ORDER_STATUSES, PAYMENT_LABELS, STATUS_LABELS, formatDateTime, formatXAF } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  await guardPage("orders");
  const { id } = await params;
  const order = (await db.select().from(orders).where(eq(orders.id, Number(id))).limit(1))[0];
  if (!order) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  const ship = (order.shippingSnapshot ?? {}) as Record<string, string>;

  return (
    <div>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="display text-3xl">{order.orderNumber}</h1>
          <p className="text-xs text-muted">Placed {formatDateTime(order.createdAt)}</p>
        </div>
        <StatusPill status={order.status} />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <p className="eyebrow">Packing slip</p>
            <Link
              href={`/admin/orders/${order.id}/packing-slip`}
              target="_blank"
              className="btn btn-secondary btn-sm print:hidden"
            >
              Print / share
            </Link>
          </div>
          <table className="mt-4 w-full text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase text-muted">
                <th className="py-2">Piece</th><th>Variant</th><th>Qty</th><th className="text-right">Line</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className="border-b border-line/60">
                  <td className="py-2">{item.productName}</td>
                  <td className="text-muted">{item.variantLabel}</td>
                  <td>{item.quantity}</td>
                  <td className="text-right">{formatXAF(item.unitPrice * item.quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <dl className="mt-4 space-y-1 text-sm text-ink-soft">
            <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatXAF(order.subtotal)}</dd></div>
            {order.discount > 0 ? <div className="flex justify-between"><dt>Discount {order.couponCode}</dt><dd>− {formatXAF(order.discount)}</dd></div> : null}
            <div className="flex justify-between"><dt>Delivery</dt><dd>{formatXAF(order.deliveryFee)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base text-ink"><dt>Total</dt><dd>{formatXAF(order.total)}</dd></div>
          </dl>
        </div>

        <div className="space-y-6">
          <div className="card p-6 text-sm">
            <p className="eyebrow">Customer</p>
            <p className="mt-2 font-medium">{order.customerName}</p>
            <p className="text-ink-soft">{order.guestEmail}</p>
            <p className="text-ink-soft">{order.guestPhone}</p>
            <p className="mt-3 eyebrow">Deliver to</p>
            <p className="text-ink-soft">{DELIVERY_LABELS[order.deliveryMethod]} — {order.deliveryZone}</p>
            {ship.street ? <p className="text-ink-soft">{ship.street}, {ship.area}, {ship.city}</p> : null}
            {ship.notes ? <p className="text-muted">Note: {ship.notes}</p> : null}
          </div>

          <div className="card p-6">
            <p className="eyebrow">Fulfilment</p>
            <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="status" defaultValue={order.status} className="field">
                {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
              </select>
              <button className="btn btn-primary btn-sm">Update</button>
            </form>
            <p className="mt-5 eyebrow">Payment — {PAYMENT_LABELS[order.paymentMethod]}</p>
            <form action={updatePaymentStatusAction} className="mt-2 flex gap-2">
              <input type="hidden" name="id" value={order.id} />
              <select name="paymentStatus" defaultValue={order.paymentStatus} className="field">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="refunded">Refunded</option>
              </select>
              <button className="btn btn-secondary btn-sm">Save</button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
