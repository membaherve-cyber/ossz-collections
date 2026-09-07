import Link from "next/link";
import { desc, eq, gte, and } from "drizzle-orm";
import { db } from "@/db";
import { addresses, appointments, orders, wishlists } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { StatusPill, Stat } from "@/components/ui";
import { formatDateTime, formatXAF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountOverview() {
  const user = await getCurrentUser();
  if (!user) return null;

  const [recent, addressRows, wish, upcoming] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt)).limit(3),
    db.select().from(addresses).where(eq(addresses.userId, user.id)),
    db.select().from(wishlists).where(eq(wishlists.userId, user.id)),
    db.select().from(appointments).where(and(eq(appointments.userId, user.id), gte(appointments.slotStart, new Date()))),
  ]);

  const spend = recent.reduce((sum, o) => sum + o.total, 0);

  return (
    <div>
      <h1 className="display text-3xl">Good to see you, {(user.fullName || user.email).split(" ")[0]}</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <Stat label="Recent orders" value={String(recent.length)} hint={spend ? `${formatXAF(spend)} recently` : undefined} />
        <Stat label="Saved addresses" value={String(addressRows.length)} />
        <Stat label="Wishlist" value={String(wish.length)} />
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="display text-2xl">Latest orders</h2>
          <Link href="/account/orders" className="text-xs text-accent link-underline">All orders</Link>
        </div>
        {recent.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            No orders yet. <Link href="/shop" className="text-accent link-underline">Browse the shop →</Link>
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {recent.map((order) => (
              <li key={order.id} className="flex items-center justify-between gap-4 py-4 text-sm">
                <Link href={`/order/${order.orderNumber}`} className="link-underline">{order.orderNumber}</Link>
                <span className="text-muted">{formatXAF(order.total)}</span>
                <StatusPill status={order.status} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="display text-2xl">Upcoming appointments</h2>
        {upcoming.length === 0 ? (
          <p className="mt-4 text-sm text-ink-soft">
            None booked. <Link href="/appointments" className="text-accent link-underline">Reserve a fitting →</Link>
          </p>
        ) : (
          <ul className="mt-4 space-y-2 text-sm">
            {upcoming.map((a) => (
              <li key={a.id} className="card flex items-center justify-between p-4">
                <span>{a.service} · {formatDateTime(a.slotStart)}</span>
                <StatusPill status={a.status} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
