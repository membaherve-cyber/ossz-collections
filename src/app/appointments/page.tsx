import Image from "next/image";
import type { Metadata } from "next";
import { gte } from "drizzle-orm";
import { db } from "@/db";
import { appointments } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { AppointmentForm } from "@/components/appointment-form";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Book an appointment" };

export default async function AppointmentsPage() {
  const [upcoming, settings, locale] = await Promise.all([
    db.select().from(appointments).where(gte(appointments.slotStart, new Date())),
    getSettings(),
    getLocale(),
  ]);
  const taken = upcoming
    .filter((a) => a.status === "confirmed")
    .map((a) => {
      const d = new Date(a.slotStart);
      const pad = (n: number) => String(n).padStart(2, "0");
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    });

  return (
    <div className="wrap grid gap-12 py-14 md:grid-cols-[1fr_1.1fr]">
      <div>
        <p className="eyebrow">{t(locale, "appt.eyebrow")}</p>
        <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "appt.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {t(locale, "appt.intro")}
        </p>
        <ul className="mt-6 space-y-2 text-sm text-ink-soft">
          <li>{t(locale, "appt.p1")}</li>
          <li>{t(locale, "appt.p2")}</li>
          <li>{t(locale, "appt.p3")}</li>
        </ul>
        <p className="mt-6 text-xs text-muted">{settings.store_address} · {settings.business_hours}</p>
        <div className="relative mt-8 aspect-[4/3] overflow-hidden bg-clay">
          <Image
            src="/ossz-logo.jpeg"
            alt="OSSZ Collections — Bring Out The Class in You" fill sizes="50vw" quality={75} className="object-contain p-4"
          />
        </div>
      </div>
      <AppointmentForm takenSlots={taken} />
    </div>
  );
}
