import Link from "next/link";
import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { trackOrderAction, updateOrderStatusAction } from "@/lib/admin-actions";
import { StatusPill } from "@/components/ui";
import { DELIVERY_LABELS, ORDER_STATUSES, PAYMENT_LABELS, STATUS_LABELS, formatDate, formatXAF } from "@/lib/utils";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function OrdersQueue({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await guardPage("orders");
  const params = await searchParams;
  const filter = typeof params.status === "string" ? params.status : "";
  const rows = await db
    .select()
    .from(orders)
    .where(filter ? sql`${orders.status} = ${filter}` : sql`true`)
    .orderBy(desc(orders.createdAt))
    .limit(100);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Fulfillment</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Orders Queue</h1>
          <p className="mt-1 text-sm text-ink-soft">Review client orders, dispatch status updates, and manage customer shipments.</p>
        </div>
        <div>
          <a
            className="btn btn-secondary btn-sm flex items-center gap-2 rounded-xl border-line hover:border-ink"
            href="/api/admin/export?type=orders"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Export CSV
          </a>
        </div>
      </div>

      {/* Quick Track Card */}
      <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted">
          <svg className="h-4 w-4 text-accent" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Quick Track & Notification Dispatch
        </div>
        <form action={trackOrderAction} className="mt-4 grid gap-4 sm:grid-cols-[1fr_220px_auto] items-end">
          <div>
            <label className="label" htmlFor="qt-order">Order Number</label>
            <input id="qt-order" name="orderNumber" required placeholder="e.g. OSZ-2026-0042" className="field rounded-xl font-mono text-xs" />
          </div>
          <div>
            <label className="label" htmlFor="qt-status">Status Update</label>
            <select id="qt-status" name="status" className="field rounded-xl text-xs">
              <option value="ready">Ready for pickup</option>
              <option value="out_for_delivery">Out for delivery</option>
              <option value="delivered">Delivered</option>
              <option value="processing">Processing</option>
              <option value="placed">Placed</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>
          </div>
          <button className="btn btn-primary btn-sm rounded-xl h-[42px] px-6">
            Dispatch Update
          </button>
        </form>
        <p className="mt-2.5 text-xs text-muted flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
          The client receives an immediate email confirmation and WhatsApp notification upon dispatch.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 pt-2">
        <Link
          href="/admin/orders"
          className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
            !filter ? "bg-ink text-paper shadow-xs font-semibold" : "bg-paper border border-line text-ink-soft hover:border-ink/40"
          }`}
        >
          All Orders
        </Link>
        {ORDER_STATUSES.map((status) => (
          <Link
            key={status}
            href={`/admin/orders?status=${status}`}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filter === status ? "bg-ink text-paper shadow-xs font-semibold" : "bg-paper border border-line text-ink-soft hover:border-ink/40"
            }`}
          >
            {STATUS_LABELS[status]}
          </Link>
        ))}
      </div>

      {/* Orders Table Panel */}
      <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-canvas/50 border-b border-line/60">
              <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                <th className="py-3.5 px-4">Order</th>
                <th className="py-3.5 px-4">Client</th>
                <th className="py-3.5 px-4">Delivery</th>
                <th className="py-3.5 px-4">Payment</th>
                <th className="py-3.5 px-4">Total</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Quick Transition</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {rows.map((order) => (
                <tr key={order.id} className="hover:bg-canvas/40 transition-colors">
                  <td className="py-3.5 px-4">
                    <Link href={`/admin/orders/${order.id}`} className="font-mono font-medium text-ink hover:text-accent underline decoration-line hover:decoration-accent">
                      {order.orderNumber}
                    </Link>
                    <span className="block text-[11px] text-muted mt-0.5">{formatDate(order.createdAt)}</span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className="font-medium text-ink block">{order.customerName}</span>
                    <span className="text-[11px] text-muted">{order.guestPhone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    <span className="font-medium text-ink block">{DELIVERY_LABELS[order.deliveryMethod]}</span>
                    <span className="text-muted">{order.deliveryZone}</span>
                  </td>
                  <td className="py-3.5 px-4 text-[11px]">
                    <span className="font-medium text-ink block">{PAYMENT_LABELS[order.paymentMethod]}</span>
                    <span className="text-muted uppercase text-[10px] tracking-wide">{order.paymentStatus}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-ink">
                    {formatXAF(order.total)}
                  </td>
                  <td className="py-3.5 px-4">
                    <StatusPill status={order.status} />
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <form action={updateOrderStatusAction} className="inline-flex items-center gap-1.5 justify-end">
                      <input type="hidden" name="id" value={order.id} />
                      <select name="status" defaultValue={order.status} className="field rounded-lg px-2 py-1 text-xs w-auto">
                        {ORDER_STATUSES.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
                      </select>
                      <button className="btn btn-secondary btn-sm rounded-lg px-2.5 py-1 text-xs">Save</button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {rows.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted">
            No orders found matching this filter criteria.
          </div>
        ) : null}
      </div>
    </div>
  );
}
