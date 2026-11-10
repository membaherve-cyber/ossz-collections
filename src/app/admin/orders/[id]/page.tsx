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
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Order Details</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">{order.orderNumber}</h1>
          <p className="mt-1 text-xs text-muted">Placed on {formatDateTime(order.createdAt)}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusPill status={order.status} />
          <Link
            href={`/admin/orders/${order.id}/packing-slip`}
            target="_blank"
            className="btn btn-secondary btn-sm flex items-center gap-1.5 rounded-xl border-line hover:border-ink print:hidden"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            Print Packing Slip
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        {/* Left Column: Packing Slip & Items Table */}
        <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Manifest</span>
              <h2 className="text-base font-semibold text-ink mt-0.5">Order Items & Summary</h2>
            </div>
            <span className="text-xs text-muted">{items.length} items</span>
          </div>

          <div className="overflow-x-auto mt-4">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-line/60 text-muted uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5">Piece</th>
                  <th className="py-2.5">Variant</th>
                  <th className="py-2.5 text-center">Qty</th>
                  <th className="py-2.5 text-right">Line Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {items.map((item) => (
                  <tr key={item.id}>
                    <td className="py-3 font-medium text-ink">{item.productName}</td>
                    <td className="py-3 text-muted">{item.variantLabel}</td>
                    <td className="py-3 text-center">{item.quantity}</td>
                    <td className="py-3 text-right font-medium text-ink">{formatXAF(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 rounded-xl bg-canvas/60 p-4 border border-line/60">
            <dl className="space-y-2 text-xs text-ink-soft">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="font-medium text-ink">{formatXAF(order.subtotal)}</dd>
              </div>
              {order.discount > 0 ? (
                <div className="flex justify-between text-emerald-700 font-medium">
                  <dt>Discount ({order.couponCode})</dt>
                  <dd>− {formatXAF(order.discount)}</dd>
                </div>
              ) : null}
              <div className="flex justify-between">
                <dt className="text-muted">Delivery Fee</dt>
                <dd className="font-medium text-ink">{formatXAF(order.deliveryFee)}</dd>
              </div>
              <div className="flex justify-between border-t border-line/80 pt-2.5 text-sm font-semibold text-ink">
                <dt>Total Amount</dt>
                <dd className="text-base text-accent">{formatXAF(order.total)}</dd>
              </div>
            </dl>
          </div>
        </div>

        {/* Right Column: Customer Info & Fulfillment Control */}
        <div className="space-y-6">
          {/* Customer Details Card */}
          <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Customer & Delivery</span>
            <h2 className="text-base font-semibold text-ink mt-0.5">{order.customerName}</h2>
            <div className="mt-3 space-y-1.5 text-xs text-ink-soft">
              <p className="flex items-center gap-2">
                <span className="text-muted">Email:</span>
                <span className="font-medium text-ink">{order.guestEmail}</span>
              </p>
              <p className="flex items-center gap-2">
                <span className="text-muted">Phone:</span>
                <span className="font-medium text-ink">{order.guestPhone}</span>
              </p>
            </div>

            <div className="mt-5 pt-4 border-t border-line/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Delivery Logistics</span>
              <p className="mt-1 text-xs font-medium text-ink">
                {DELIVERY_LABELS[order.deliveryMethod]} — {order.deliveryZone}
              </p>
              {ship.street ? (
                <p className="mt-1 text-xs text-ink-soft">
                  {ship.street}, {ship.area}, {ship.city}
                </p>
              ) : null}
              {ship.notes ? (
                <p className="mt-2 text-xs italic text-muted bg-canvas p-2.5 rounded-lg border border-line/60">
                  Note: {ship.notes}
                </p>
              ) : null}
            </div>
          </div>

          {/* Fulfillment Actions Card */}
          <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs space-y-5">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Fulfillment Control</span>
              <h2 className="text-base font-semibold text-ink mt-0.5">Order Status Transition</h2>
              <form action={updateOrderStatusAction} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="status" defaultValue={order.status} className="field rounded-xl text-xs flex-1">
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>{STATUS_LABELS[s]}</option>
                  ))}
                </select>
                <button className="btn btn-primary btn-sm rounded-xl px-4">Update</button>
              </form>
            </div>

            <div className="pt-4 border-t border-line/60">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">
                Payment Status ({PAYMENT_LABELS[order.paymentMethod]})
              </span>
              <form action={updatePaymentStatusAction} className="mt-3 flex gap-2">
                <input type="hidden" name="id" value={order.id} />
                <select name="paymentStatus" defaultValue={order.paymentStatus} className="field rounded-xl text-xs flex-1">
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="refunded">Refunded</option>
                </select>
                <button className="btn btn-secondary btn-sm rounded-xl px-4 border-line hover:border-ink">Save</button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
