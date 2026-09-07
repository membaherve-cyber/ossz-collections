import { asc } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { setAppointmentStatusAction } from "@/lib/admin-actions";
import { StatusPill } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function AdminAppointments() {
  await guardPage("orders");
  const rows = await db.select().from(appointments).orderBy(asc(appointments.slotStart));
  const now = new Date();
  const grouped = new Map<string, typeof rows>();
  for (const row of rows) {
    const key = new Date(row.slotStart).toDateString();
    grouped.set(key, [...(grouped.get(key) ?? []), row]);
  }

  return (
    <div>
      <h1 className="display text-3xl">Appointments calendar</h1>
      <p className="mt-2 text-sm text-ink-soft">Day by day, with one-tap confirmation.</p>

      <div className="mt-8 space-y-8">
        {[...grouped.entries()].map(([day, items]) => (
          <section key={day}>
            <p className="eyebrow">{day}</p>
            <ul className="mt-3 space-y-2">
              {items.map((a) => (
                <li key={a.id} className={`card flex flex-wrap items-center justify-between gap-3 p-4 text-sm ${new Date(a.slotStart) < now ? "opacity-60" : ""}`}>
                  <div>
                    <p className="font-medium">{formatDateTime(a.slotStart)} · {a.service}</p>
                    <p className="text-xs text-muted">{a.guestName} — {a.guestContact} · {a.reference}</p>
                    {a.notes ? <p className="mt-1 text-xs text-ink-soft">{a.notes}</p> : null}
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill status={a.status} />
                    {["confirmed", "completed", "cancelled"].map((status) => (
                      <form action={setAppointmentStatusAction} key={status}>
                        <input type="hidden" name="id" value={a.id} />
                        <input type="hidden" name="status" value={status} />
                        <button className="btn btn-ghost btn-sm capitalize">{status}</button>
                      </form>
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {rows.length === 0 ? <p className="text-sm text-muted">No appointments booked yet.</p> : null}
      </div>
    </div>
  );
}
