import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { getCurrentUser, isAdmin } from "@/lib/auth";

export const dynamic = "force-dynamic";

function csv(rows: Array<Record<string, string | number>>): string {
  if (rows.length === 0) return "";
  const headers = Object.keys(rows[0]);
  const escape = (value: string | number) => `"${String(value).replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((row) => headers.map((h) => escape(row[h])).join(","))].join("\n");
}

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isAdmin(user.role)) {
    return new Response("Not authorised", { status: 403 });
  }
  const type = new URL(request.url).searchParams.get("type") ?? "orders";

  if (type === "summary") {
    const rows = await db
      .select({
        month: sql<string>`to_char(${orders.createdAt}, 'YYYY-MM')`,
        orders: sql<number>`count(*)`,
        revenue: sql<number>`sum(${orders.total})`,
        delivery: sql<number>`sum(${orders.deliveryFee})`,
        discounts: sql<number>`sum(${orders.discount})`,
      })
      .from(orders)
      .groupBy(sql`to_char(${orders.createdAt}, 'YYYY-MM')`)
      .orderBy(sql`to_char(${orders.createdAt}, 'YYYY-MM') desc`);
    const body = csv(rows.map((r) => ({
      month: r.month, orders: Number(r.orders), revenue_xaf: Number(r.revenue),
      delivery_xaf: Number(r.delivery), discounts_xaf: Number(r.discounts),
    })));
    return new Response(body, {
      headers: {
        "content-type": "text/csv; charset=utf-8",
        "content-disposition": 'attachment; filename="ossz-sales-summary.csv"',
      },
    });
  }

  const rows = await db.select().from(orders).orderBy(desc(orders.createdAt));
  const body = csv(rows.map((o) => ({
    order_number: o.orderNumber,
    date: new Date(o.createdAt).toISOString(),
    customer: o.customerName,
    email: o.guestEmail,
    phone: o.guestPhone,
    status: o.status,
    payment_method: o.paymentMethod,
    payment_status: o.paymentStatus,
    delivery_method: o.deliveryMethod,
    delivery_zone: o.deliveryZone,
    subtotal_xaf: o.subtotal,
    discount_xaf: o.discount,
    delivery_xaf: o.deliveryFee,
    total_xaf: o.total,
  })));
  return new Response(body, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="ossz-orders.csv"',
    },
  });
}
