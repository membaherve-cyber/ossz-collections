import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, orders } from "@/db/schema";
import { guardPage } from "@/lib/guard";
import { NotificationArchiveList } from "@/components/admin/notification-archive-list";

export const dynamic = "force-dynamic";

export default async function NotificationsPage() {
  await guardPage("orders");

  const rows = await db
    .select({ n: notifications, orderNumber: orders.orderNumber })
    .from(notifications)
    .leftJoin(orders, eq(notifications.orderId, orders.id))
    .orderBy(desc(notifications.createdAt))
    .limit(100);

  const queued = rows.filter((r) => r.n.status === "queued").length;
  const sent = rows.filter((r) => r.n.status === "sent").length;

  return (
    <div className="space-y-6">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Operations & Communication</p>
        <h1 className="display text-3xl mt-1">Customer Messages & Archive</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Complete log of automated and manual customer notifications (order confirmations, delivery tracking, and contact replies).
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs">
          <span className="px-3 py-1 rounded-full bg-paper border border-line text-ink font-medium shadow-2xs">
            Total Logged: <strong>{rows.length}</strong>
          </span>
          <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 font-medium">
            Delivered: <strong>{sent}</strong>
          </span>
          {queued > 0 ? (
            <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 font-medium">
              Queued: <strong>{queued}</strong>
            </span>
          ) : null}
        </div>
      </header>

      <NotificationArchiveList rows={rows} />
    </div>
  );
}
