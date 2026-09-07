import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, orderItems, orders, productVariants, products, users } from "@/db/schema";
import { canFulfilOrders, getCurrentUser, isAdmin } from "@/lib/auth";
import { Stat, StatusPill } from "@/components/ui";
import { DefaultCredentialsNotice } from "@/components/default-credentials-notice";
import { SalesTrend } from "@/components/sales-trend";
import { formatDateTime, formatXAF } from "@/lib/utils";

export const dynamic = "force-dynamic";

function startOf(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days);
  return d;
}

export default async function AdminDashboard() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [today, week, month, queue, lowStock, upcoming, customerCount, bestSellers, recent] = await Promise.all([
    db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)`, n: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, startOf(0))),
    db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)`, n: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, startOf(7))),
    db.select({ total: sql<number>`coalesce(sum(${orders.total}),0)`, n: sql<number>`count(*)` }).from(orders).where(gte(orders.createdAt, startOf(30))),
    db.select({ n: sql<number>`count(*)` }).from(orders).where(sql`${orders.status} in ('placed','processing','ready')`),
    db.select({ variant: productVariants, product: products }).from(productVariants).innerJoin(products, eq(productVariants.productId, products.id)).where(sql`${productVariants.stockQty} <= ${productVariants.lowStockThreshold}`).limit(8),
    db.select().from(appointments).where(and(gte(appointments.slotStart, new Date()), sql`${appointments.status} <> 'cancelled'`)).orderBy(appointments.slotStart).limit(5),
    db.select({ n: sql<number>`count(*)` }).from(users).where(eq(users.role, "customer")),
    db.select({ name: orderItems.productName, qty: sql<number>`sum(${orderItems.quantity})` }).from(orderItems).groupBy(orderItems.productName).orderBy(desc(sql`sum(${orderItems.quantity})`)).limit(5),
    db.select().from(orders).orderBy(desc(orders.createdAt)).limit(6),
  ]);

  // §9.2 — 14-day revenue trend
  const trendRows = await db
    .select({
      day: sql<string>`to_char(${orders.createdAt}, 'DD Mon')`,
      key: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM-DD')`,
      total: sql<number>`sum(${orders.total})`,
    })
    .from(orders)
    .where(gte(orders.createdAt, startOf(13)))
    .groupBy(sql`to_char(${orders.createdAt}, 'DD Mon')`, sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM-DD')`);
  const trend = trendRows.map((r) => ({ day: r.day, total: Number(r.total) }));

  const showMoney = isAdmin(user.role);

  return (
    <div>
      <DefaultCredentialsNotice />
      <h1 className="display text-3xl">Dashboard</h1>
      <p className="mt-2 text-sm text-ink-soft">
        {showMoney ? "Revenue, orders and stock at a glance." : "Today's work, at a glance."}
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {showMoney ? (
          <>
            <Stat label="Revenue today" value={formatXAF(Number(today[0]?.total ?? 0))} hint={`${today[0]?.n ?? 0} orders`} />
            <Stat label="Last 7 days" value={formatXAF(Number(week[0]?.total ?? 0))} hint={`${week[0]?.n ?? 0} orders`} />
            <Stat label="Last 30 days" value={formatXAF(Number(month[0]?.total ?? 0))} hint={`${month[0]?.n ?? 0} orders`} />
            <Stat label="Customers" value={String(customerCount[0]?.n ?? 0)} hint="Registered accounts" />
          </>
        ) : (
          <>
            <Stat label="Orders to fulfil" value={String(queue[0]?.n ?? 0)} />
            <Stat label="Low stock lines" value={String(lowStock.length)} />
            <Stat label="Upcoming appointments" value={String(upcoming.length)} />
            <Stat label="Orders this week" value={String(week[0]?.n ?? 0)} />
          </>
        )}
      </div>

      {showMoney ? (
        <section className="mt-10 grid gap-6 lg:grid-cols-2">
          <div className="card p-5">
            <p className="eyebrow">Revenue — last 14 days</p>
            <SalesTrend points={trend} />
          </div>

          <div className="card p-5">
            <p className="eyebrow">Best sellers</p>
            <ul className="mt-4 space-y-3">
              {bestSellers.map((row) => {
                const max = Number(bestSellers[0]?.qty ?? 1);
                const pct = Math.round((Number(row.qty) / max) * 100);
                return (
                  <li key={row.name}>
                    <div className="flex justify-between text-sm">
                      <span>{row.name}</span>
                      <span className="text-muted">{row.qty} sold</span>
                    </div>
                    <div className="mt-1 h-1 w-full bg-line">
                      <div className="h-1 bg-accent" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
              {bestSellers.length === 0 ? <li className="text-sm text-muted">No sales recorded yet.</li> : null}
            </ul>
          </div>
          <div className="card p-5">
            <div className="flex items-center justify-between">
              <p className="eyebrow">Exports</p>
              <span className="text-xs text-muted">For your accountant</span>
            </div>
            <p className="mt-3 text-sm text-ink-soft">
              Download a clean CSV of orders or a monthly sales summary — enough for bookkeeping,
              without pretending to be an accounting system.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="btn btn-secondary btn-sm" href="/api/admin/export?type=orders">Orders CSV</a>
              <a className="btn btn-secondary btn-sm" href="/api/admin/export?type=summary">Sales summary CSV</a>
            </div>
          </div>
        </section>
      ) : null}

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div>
          <div className="flex items-center justify-between">
            <h2 className="display text-2xl">Recent orders</h2>
            {canFulfilOrders(user.role) ? <Link href="/admin/orders" className="text-xs text-accent link-underline">Open the queue</Link> : null}
          </div>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-3 py-3 text-sm">
                <Link href={`/admin/orders/${order.id}`} className="link-underline">{order.orderNumber}</Link>
                <span className="text-muted">{order.customerName}</span>
                <span>{formatXAF(order.total)}</span>
                <StatusPill status={order.status} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="display text-2xl">Low stock</h2>
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {lowStock.map((row) => (
              <li key={row.variant.id} className="flex items-center justify-between py-3 text-sm">
                <span>{row.product.name} <span className="text-muted">· {row.variant.size} / {row.variant.colour}</span></span>
                <span className={row.variant.stockQty === 0 ? "text-red-600" : "text-amber-700"}>
                  {row.variant.stockQty} left
                </span>
              </li>
            ))}
            {lowStock.length === 0 ? <li className="py-3 text-sm text-muted">Everything is well stocked.</li> : null}
          </ul>
          <h2 className="display mt-8 text-2xl">Next appointments</h2>
          <ul className="mt-4 space-y-2 text-sm">
            {upcoming.map((a) => (
              <li key={a.id} className="card flex items-center justify-between p-3">
                <span>{a.guestName} · {a.service}</span>
                <span className="text-muted">{formatDateTime(a.slotStart)}</span>
              </li>
            ))}
            {upcoming.length === 0 ? <li className="text-sm text-muted">No appointments booked.</li> : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
