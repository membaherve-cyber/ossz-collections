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
    <div>
      <h1 className="display text-3xl">Customers</h1>
      <p className="mt-2 text-sm text-ink-soft">Registered accounts and guest buyers, with lifetime value.</p>

      <h2 className="display mt-8 text-2xl">Accounts</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[620px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="py-3">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Lifetime value</th><th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.user.id} className="border-b border-line/60">
                <td className="py-2">{row.user.fullName || "—"}</td>
                <td>{row.user.email}</td>
                <td>{row.user.phone ?? "—"}</td>
                <td>{Number(row.orderCount)}</td>
                <td>{formatXAF(Number(row.spend))}</td>
                <td className="text-xs text-muted">{formatDate(row.user.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="display mt-10 text-2xl">Guest buyers</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="py-3">Name</th><th>Email</th><th>Phone</th><th>Orders</th><th>Spend</th>
            </tr>
          </thead>
          <tbody>
            {guests.map((g) => (
              <tr key={`${g.email}-${g.phone}`} className="border-b border-line/60">
                <td className="py-2">{g.name}</td><td>{g.email}</td><td>{g.phone}</td>
                <td>{Number(g.n)}</td><td>{formatXAF(Number(g.spend))}</td>
              </tr>
            ))}
            {guests.length === 0 ? <tr><td className="py-3 text-muted" colSpan={5}>No guest orders yet.</td></tr> : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
