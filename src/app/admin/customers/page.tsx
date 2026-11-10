import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders, users } from "@/db/schema";
import { formatDate, formatXAF } from "@/lib/utils";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function CustomersPage() {
  await guardPage("admin");
  const rows = await db
    .select({
      user: users,
      orderCount: sql<number>`count(${orders.id})`,
      spend: sql<number>`coalesce(sum(${orders.total}),0)`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .where(eq(users.role, "customer"))
    .groupBy(users.id)
    .orderBy(desc(sql`coalesce(sum(${orders.total}),0)`));

  const guests = await db
    .select({
      email: orders.guestEmail,
      name: orders.customerName,
      phone: orders.guestPhone,
      n: sql<number>`count(*)`,
      spend: sql<number>`sum(${orders.total})`,
    })
    .from(orders)
    .where(sql`${orders.userId} is null`)
    .groupBy(orders.guestEmail, orders.customerName, orders.guestPhone);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Clients</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Customer Database</h1>
          <p className="mt-1 text-sm text-ink-soft">Registered client profiles and guest purchasers, ranked by lifetime value.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {rows.length} Registered · {guests.length} Guests
          </span>
        </div>
      </div>

      {/* Registered Accounts Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Registered Accounts ({rows.length})</h2>
          <span className="text-xs text-muted">Ranked by total lifetime spend</span>
        </div>
        <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left text-xs">
              <thead className="bg-canvas/50 border-b border-line/60">
                <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Client Name</th>
                  <th className="py-3.5 px-4">Email Address</th>
                  <th className="py-3.5 px-4">Contact Phone</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4">Lifetime Value</th>
                  <th className="py-3.5 px-4 text-right">Member Since</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {rows.map((row) => (
                  <tr key={row.user.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-ink">
                      {row.user.fullName || "—"}
                    </td>
                    <td className="py-3.5 px-4 text-ink-soft">{row.user.email}</td>
                    <td className="py-3.5 px-4 text-muted">{row.user.phone ?? "—"}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-ink">{Number(row.orderCount)}</td>
                    <td className="py-3.5 px-4 font-semibold text-accent">{formatXAF(Number(row.spend))}</td>
                    <td className="py-3.5 px-4 text-right text-muted">{formatDate(row.user.createdAt)}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">No registered customer accounts yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Guest Buyers Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Guest Buyers ({guests.length})</h2>
          <span className="text-xs text-muted">Purchased without creating an account</span>
        </div>
        <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-canvas/50 border-b border-line/60">
                <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">Phone</th>
                  <th className="py-3.5 px-4 text-center">Orders</th>
                  <th className="py-3.5 px-4 text-right">Total Spent</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {guests.map((g) => (
                  <tr key={`${g.email}-${g.phone}`} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3.5 px-4 font-medium text-ink">{g.name}</td>
                    <td className="py-3.5 px-4 text-ink-soft">{g.email}</td>
                    <td className="py-3.5 px-4 text-muted">{g.phone}</td>
                    <td className="py-3.5 px-4 text-center font-semibold text-ink">{Number(g.n)}</td>
                    <td className="py-3.5 px-4 text-right font-semibold text-ink">{formatXAF(Number(g.spend))}</td>
                  </tr>
                ))}
                {guests.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-8 text-center text-muted">No guest orders recorded yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
