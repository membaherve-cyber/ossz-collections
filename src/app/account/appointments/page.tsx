import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { cancelAppointmentAction } from "@/lib/actions";
import { StatusPill, EmptyState } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AccountAppointments() {
  const user = await getCurrentUser();
  if (!user) return null;
  const rows = await db.select().from(appointments).where(eq(appointments.userId, user.id)).orderBy(desc(appointments.slotStart));

  return (
    <div>
      <h1 className="display text-3xl">Appointments</h1>
      <p className="mt-2 text-sm text-ink-soft">
        Reschedule or cancel yourself, at any hour. <Link href="/appointments" className="text-accent link-underline">Book another →</Link>
      </p>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No appointments yet"
            body="A fitting takes forty unhurried minutes at our Ange Raphael boutique, and costs nothing."
            action={<Link href="/appointments" className="btn btn-primary mt-2">Book a fitting</Link>}
          />
        </div>
      ) : (
        <ul className="mt-8 space-y-3">
          {rows.map((a) => (
            <li key={a.id} className="card flex flex-wrap items-center justify-between gap-3 p-5 text-sm">
              <div>
                <p className="font-medium">{a.service} · {a.reference}</p>
                <p className="text-xs text-muted">{formatDateTime(a.slotStart)}</p>
              </div>
              <div className="flex items-center gap-3">
                <StatusPill status={a.status} />
                {a.status !== "cancelled" && new Date(a.slotStart) > new Date() ? (
                  <form action={cancelAppointmentAction}>
                    <input type="hidden" name="id" value={a.id} />
                    <button className="text-xs text-red-600 link-underline">Cancel</button>
                  </form>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
