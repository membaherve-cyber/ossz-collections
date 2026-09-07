import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, orders } from "@/db/schema";
import { guardPage } from "@/lib/guard";
import { StatusPill } from "@/components/ui";
import { formatDateTime, waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

/**
 * §12.2 — every customer message the shop has generated. While no email/SMS
 * provider is configured these sit as "queued" with a one-tap WhatsApp link,
 * so the business can still keep customers informed from day one.
 */
export default async function NotificationsPage() {
  await guardPage("orders");

  const rows = await db
    .select({ n: notifications, orderNumber: orders.orderNumber })
    .from(notifications)
    .leftJoin(orders, eq(notifications.orderId, orders.id))
    .orderBy(desc(notifications.createdAt))
    .limit(80);

  const queued = rows.filter((r) => r.n.status === "queued").length;

  return (
    <div>
      <h1 className="display text-3xl">Customer messages</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Order confirmations and delivery updates. {queued > 0
          ? `${queued} waiting to be sent — tap “Send on WhatsApp” to deliver them by hand.`
          : "Everything has been delivered."}
      </p>

      {rows.length === 0 ? (
        <p className="mt-8 text-sm text-muted">No messages yet. They appear as orders are placed.</p>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map(({ n, orderNumber }) => (
            <li key={n.id} className="card p-4 text-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="chip text-[0.65rem] capitalize">{n.channel}</span>
                  {orderNumber ? (
                    <Link href={`/admin/orders?status=`} className="text-xs text-accent link-underline">
                      {orderNumber}
                    </Link>
                  ) : null}
                  <span className="text-xs text-muted">{n.recipient}</span>
                </div>
                <div className="flex items-center gap-2">
                  <StatusPill status={n.status === "sent" ? "delivered" : n.status === "failed" ? "cancelled" : "placed"} />
                  <span className="text-[0.65rem] text-muted">{formatDateTime(n.createdAt)}</span>
                </div>
              </div>

              {n.subject ? <p className="mt-2 font-medium">{n.subject}</p> : null}
              <p className="mt-1 whitespace-pre-wrap text-xs leading-relaxed text-ink-soft">{n.body}</p>
              {n.error ? <p className="mt-1 text-xs text-red-600">{n.error}</p> : null}

              {n.status === "queued" && n.channel !== "email" && n.recipient ? (
                <a
                  href={waLink(n.recipient, n.body)}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-secondary btn-sm mt-3"
                >
                  Send on WhatsApp
                </a>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
