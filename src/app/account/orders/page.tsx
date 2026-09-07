import Link from "next/link";
import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { StatusPill, EmptyState } from "@/components/ui";
import { DELIVERY_LABELS, formatDate, formatXAF } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountOrders() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await db.select().from(orders).where(eq(orders.userId, user.id)).orderBy(desc(orders.createdAt));
  const items = rows.length
    ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id)))
    : [];

  return (
    <div>
      <h1 className="display text-3xl">Orders & tracking</h1>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No orders yet"
            body="When you place an order it will appear here, with live tracking from atelier to door."
            action={<Link href="/shop" className="btn btn-primary mt-2">Browse the shop</Link>}
          />
        </div>
      ) : (
        <div className="mt-8 space-y-5">
          {rows.map((order) => (
            <article key={order.id} className="card p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <Link href={`/order/${order.orderNumber}`} className="display text-xl link-underline">{order.orderNumber}</Link>
                  <p className="text-xs text-muted">
                    {formatDate(order.createdAt)} · {DELIVERY_LABELS[order.deliveryMethod]}
                  </p>
                </div>
                <StatusPill status={order.status} />
              </div>
              <ul className="mt-4 space-y-1 text-sm text-ink-soft">
                {items.filter((i) => i.orderId === order.id).map((item) => (
                  <li key={item.id}>{item.quantity} × {item.productName} <span className="text-muted">({item.variantLabel})</span></li>
                ))}
              </ul>
              <p className="mt-3 border-t border-line pt-3 text-sm">Total {formatXAF(order.total)}</p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
