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
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Services</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Appointments Calendar</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Review bespoke fittings, bridal consultations, and styling sessions day by day.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft shadow-2xs">
            <span className="h-2 w-2 rounded-full bg-accent" />
            {rows.length} Total Bookings
          </span>
        </div>
      </div>

      <div className="space-y-8">
        {[...grouped.entries()].map(([day, items]) => (
          <section key={day} className="space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted">{day}</span>
              <div className="h-px flex-1 bg-line/60"></div>
            </div>
            <ul className="space-y-3">
              {items.map((a) => {
                const isPast = new Date(a.slotStart) < now;
                return (
                  <li
                    key={a.id}
                    className={`card rounded-2xl border border-line bg-paper p-5 shadow-xs transition-all hover:border-accent/30 flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${
                      isPast ? "opacity-75 bg-canvas/40" : ""
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2.5">
                        <span className="font-semibold text-ink text-sm">
                          {formatDateTime(a.slotStart)}
                        </span>
                        <span className="text-xs px-2.5 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                          {a.service}
                        </span>
                      </div>
                      <p className="text-xs text-muted">
                        <span className="font-medium text-ink-soft">{a.guestName}</span> · {a.guestContact} · Ref: <span className="font-mono">{a.reference}</span>
                      </p>
                      {a.notes ? (
                        <p className="text-xs text-ink-soft italic bg-canvas/60 rounded-lg p-2 mt-1 border border-line/40 max-w-xl">
                          “{a.notes}”
                        </p>
                      ) : null}
                    </div>

                    <div className="flex flex-wrap items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-line/60">
                      <StatusPill status={a.status} />
                      <div className="flex items-center gap-1">
                        {["confirmed", "completed", "cancelled"].map((status) => (
                          <form action={setAppointmentStatusAction} key={status}>
                            <input type="hidden" name="id" value={a.id} />
                            <input type="hidden" name="status" value={status} />
                            <button
                              type="submit"
                              className={`btn btn-sm rounded-lg text-xs capitalize ${
                                a.status === status
                                  ? "bg-ink text-paper font-semibold cursor-default"
                                  : "btn-secondary border-line hover:border-ink"
                              }`}
                            >
                              {status}
                            </button>
                          </form>
                        ))}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}

        {rows.length === 0 ? (
          <div className="card rounded-2xl border border-dashed border-line bg-paper/40 p-12 text-center text-sm text-muted">
            No appointments booked yet. Client bookings made through the concierge calendar will appear here.
          </div>
        ) : null}
      </div>
    </div>
  );
}
