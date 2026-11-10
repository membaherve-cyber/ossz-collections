import Link from "next/link";
import { and, desc, eq, gte, sql } from "drizzle-orm";
import { db } from "@/db";
import { appointments, orderItems, orders, productVariants, products, users } from "@/db/schema";
import { canFulfilOrders, getCurrentUser, isAdmin } from "@/lib/auth";
import { StatusPill } from "@/components/ui";
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
    <div className="space-y-8">
      <DefaultCredentialsNotice />

      {/* Header section with greeting and status */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Overview</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Dashboard</h1>
          <p className="mt-1 text-sm text-ink-soft">
            {showMoney ? "Revenue metrics, live orders, and stock health at a glance." : "Today's fulfillment tasks and stock priorities."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            Live Storefront Active
          </span>
        </div>
      </div>

      {/* Summary KPI Cards Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {showMoney ? (
          <>
            <div className="card rounded-2xl p-5 border border-line bg-paper relative overflow-hidden group hover:border-accent/40 transition-all">
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Revenue Today</p>
                <span className="p-2 rounded-xl bg-accent-soft text-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </span>
              </div>
              <p className="display mt-3 text-2xl sm:text-3xl font-semibold text-ink">{formatXAF(Number(today[0]?.total ?? 0))}</p>
              <p className="mt-1 text-xs text-muted flex items-center gap-1">
                <span>{today[0]?.n ?? 0}</span> orders placed today
              </p>
            </div>

            <div className="card rounded-2xl p-5 border border-line bg-paper relative overflow-hidden group hover:border-accent/40 transition-all">
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Last 7 Days</p>
                <span className="p-2 rounded-xl bg-accent-soft text-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </span>
              </div>
              <p className="display mt-3 text-2xl sm:text-3xl font-semibold text-ink">{formatXAF(Number(week[0]?.total ?? 0))}</p>
              <p className="mt-1 text-xs text-muted flex items-center gap-1">
                <span>{week[0]?.n ?? 0}</span> orders this week
              </p>
            </div>

            <div className="card rounded-2xl p-5 border border-line bg-paper relative overflow-hidden group hover:border-accent/40 transition-all">
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Last 30 Days</p>
                <span className="p-2 rounded-xl bg-accent-soft text-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </span>
              </div>
              <p className="display mt-3 text-2xl sm:text-3xl font-semibold text-ink">{formatXAF(Number(month[0]?.total ?? 0))}</p>
              <p className="mt-1 text-xs text-muted flex items-center gap-1">
                <span>{month[0]?.n ?? 0}</span> orders this month
              </p>
            </div>

            <div className="card rounded-2xl p-5 border border-line bg-paper relative overflow-hidden group hover:border-accent/40 transition-all">
              <div className="absolute top-0 right-0 h-16 w-16 bg-gradient-to-bl from-accent/10 to-transparent rounded-bl-3xl pointer-events-none" />
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Total Customers</p>
                <span className="p-2 rounded-xl bg-accent-soft text-accent">
                  <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </span>
              </div>
              <p className="display mt-3 text-2xl sm:text-3xl font-semibold text-ink">{String(customerCount[0]?.n ?? 0)}</p>
              <p className="mt-1 text-xs text-muted">Registered client accounts</p>
            </div>
          </>
        ) : (
          <>
            <div className="card rounded-2xl p-5 border border-line bg-paper">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Orders to Fulfil</p>
              <p className="display mt-2 text-3xl font-semibold text-ink">{String(queue[0]?.n ?? 0)}</p>
              <p className="mt-1 text-xs text-muted">Awaiting packing / dispatch</p>
            </div>
            <div className="card rounded-2xl p-5 border border-line bg-paper">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Low Stock Lines</p>
              <p className="display mt-2 text-3xl font-semibold text-amber-700">{String(lowStock.length)}</p>
              <p className="mt-1 text-xs text-muted">Variants below threshold</p>
            </div>
            <div className="card rounded-2xl p-5 border border-line bg-paper">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Upcoming Appointments</p>
              <p className="display mt-2 text-3xl font-semibold text-ink">{String(upcoming.length)}</p>
              <p className="mt-1 text-xs text-muted">Confirmed client fittings</p>
            </div>
            <div className="card rounded-2xl p-5 border border-line bg-paper">
              <p className="text-[11px] font-semibold tracking-wider uppercase text-muted">Orders This Week</p>
              <p className="display mt-2 text-3xl font-semibold text-ink">{String(week[0]?.n ?? 0)}</p>
              <p className="mt-1 text-xs text-muted">Processed in last 7 days</p>
            </div>
          </>
        )}
      </div>

      {showMoney ? (
        <section className="grid gap-6 lg:grid-cols-2">
          {/* Revenue Chart Card */}
          <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Performance</span>
                <h2 className="text-base font-semibold text-ink mt-0.5">Revenue Trend (Last 14 Days)</h2>
              </div>
              <span className="text-xs text-muted px-2.5 py-1 rounded-full bg-canvas border border-line">Daily Aggregated</span>
            </div>
            <div className="mt-4">
              <SalesTrend points={trend} />
            </div>
          </div>

          {/* Best Sellers Card */}
          <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Analytics</span>
                <h2 className="text-base font-semibold text-ink mt-0.5">Best Selling Pieces</h2>
              </div>
              <span className="text-xs text-muted px-2.5 py-1 rounded-full bg-canvas border border-line">By Units Sold</span>
            </div>
            <ul className="mt-5 space-y-4">
              {bestSellers.map((row) => {
                const max = Number(bestSellers[0]?.qty ?? 1);
                const pct = Math.round((Number(row.qty) / max) * 100);
                return (
                  <li key={row.name} className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-ink truncate max-w-[220px]">{row.name}</span>
                      <span className="text-accent font-semibold">{row.qty} sold</span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-canvas border border-line/60">
                      <div className="h-full rounded-full bg-gradient-to-r from-accent to-accent/80 transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                  </li>
                );
              })}
              {bestSellers.length === 0 ? <li className="text-sm text-muted py-6 text-center">No sales recorded yet.</li> : null}
            </ul>
          </div>

          {/* Bookkeeping & Exports Card */}
          <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Financial Reporting</span>
                <h2 className="text-base font-semibold text-ink mt-0.5">Accounting & Bookkeeping Data Exports</h2>
                <p className="mt-1 text-xs text-ink-soft max-w-2xl">
                  Download structured CSV spreadsheets of detailed orders or monthly revenue totals for financial reconciliation.
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 shrink-0">
                <a className="btn btn-secondary btn-sm flex items-center gap-1.5 rounded-xl border-line hover:border-ink" href="/api/admin/export?type=orders">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                  </svg>
                  Export Orders CSV
                </a>
                <a className="btn btn-secondary btn-sm flex items-center gap-1.5 rounded-xl border-line hover:border-ink" href="/api/admin/export?type=summary">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Sales Summary CSV
                </a>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {/* Tables section: Recent Orders & Stock Alerts */}
      <section className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders Panel */}
        <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Fulfillment</span>
              <h2 className="text-base font-semibold text-ink mt-0.5">Recent Orders</h2>
            </div>
            {canFulfilOrders(user.role) ? (
              <Link href="/admin/orders" className="text-xs text-accent hover:underline font-medium">
                View all orders →
              </Link>
            ) : null}
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line/60 text-muted">
                  <th className="py-2.5 font-semibold">Order</th>
                  <th className="py-2.5 font-semibold">Client</th>
                  <th className="py-2.5 font-semibold">Total</th>
                  <th className="py-2.5 font-semibold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {recent.map((order) => (
                  <tr key={order.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3 font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="text-ink hover:text-accent font-mono">
                        {order.orderNumber}
                      </Link>
                    </td>
                    <td className="py-3 text-muted truncate max-w-[130px]">{order.customerName}</td>
                    <td className="py-3 font-semibold text-ink">{formatXAF(order.total)}</td>
                    <td className="py-3 text-right">
                      <StatusPill status={order.status} />
                    </td>
                  </tr>
                ))}
                {recent.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-muted">No orders found.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low Stock Watchlist */}
        <div className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Inventory Health</span>
              <h2 className="text-base font-semibold text-ink mt-0.5">Low Stock Alert</h2>
            </div>
            <Link href="/admin/inventory" className="text-xs text-accent hover:underline font-medium">
              Manage stock →
            </Link>
          </div>

          <div className="overflow-x-auto mt-2">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-line/60 text-muted">
                  <th className="py-2.5 font-semibold">Product & Variant</th>
                  <th className="py-2.5 font-semibold text-right">Available Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {lowStock.map((row) => (
                  <tr key={row.variant.id} className="hover:bg-canvas/50 transition-colors">
                    <td className="py-3">
                      <span className="font-medium text-ink block">{row.product.name}</span>
                      <span className="text-[11px] text-muted">
                        {row.variant.size} • {row.variant.colour}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${row.variant.stockQty === 0 ? "bg-red-50 text-red-700 border border-red-200" : "bg-amber-50 text-amber-800 border border-amber-200"}`}>
                        {row.variant.stockQty === 0 ? "Out of Stock" : `${row.variant.stockQty} left`}
                      </span>
                    </td>
                  </tr>
                ))}
                {lowStock.length === 0 ? (
                  <tr>
                    <td colSpan={2} className="py-6 text-center text-emerald-700">All inventory variants are well-stocked.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Non-admin upcoming appointments display */}
      {!showMoney && upcoming.length > 0 ? (
        <section className="card rounded-2xl p-6 border border-line bg-paper shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-line/60">
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted">Schedule</span>
              <h2 className="text-base font-semibold text-ink mt-0.5">Upcoming Client Appointments</h2>
            </div>
            <Link href="/admin/appointments" className="text-xs text-accent hover:underline font-medium">
              View all appointments →
            </Link>
          </div>
          <ul className="mt-4 divide-y divide-line/60">
            {upcoming.map((appt) => (
              <li key={appt.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-medium text-ink">{appt.guestName}</span>
                  <span className="text-muted block">{formatDateTime(appt.slotStart)}</span>
                </div>
                <StatusPill status={appt.status} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
