import { asc, desc } from "drizzle-orm";
import { db } from "@/db";
import { auditLog, deliveryZones, faqs } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { saveFaqAction, saveSettingsAction, saveZoneAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatDateTime, formatXAF } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  await guardPage("admin");
  const [settings, zones, faqRows, log] = await Promise.all([
    getSettings(),
    db.select().from(deliveryZones).orderBy(asc(deliveryZones.fee)),
    db.select().from(faqs).orderBy(asc(faqs.sortOrder)),
    db.select().from(auditLog).orderBy(desc(auditLog.createdAt)).limit(12),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="display text-3xl">Settings & concierge</h1>
        <p className="mt-2 text-sm text-ink-soft">
          These details appear across the site and are what the OSSZ Concierge quotes to visitors.
        </p>
        <ActionForm action={saveSettingsAction} submitLabel="Save settings" className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <div><label className="label" htmlFor="whatsapp_number">WhatsApp number (hand-off)</label><input id="whatsapp_number" name="whatsapp_number" defaultValue={settings.whatsapp_number} className="field" /></div>
          <div><label className="label" htmlFor="contact_email">Contact email</label><input id="contact_email" name="contact_email" defaultValue={settings.contact_email} className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="store_address">Store address</label><input id="store_address" name="store_address" defaultValue={settings.store_address} className="field" /></div>
          <div className="sm:col-span-2"><label className="label" htmlFor="business_hours">Business hours</label><input id="business_hours" name="business_hours" defaultValue={settings.business_hours} className="field" /></div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="concierge_greeting">Concierge greeting</label>
            <textarea id="concierge_greeting" name="concierge_greeting" rows={2} defaultValue={settings.concierge_greeting} className="field" />
          </div>
          <div><label className="label" htmlFor="free_delivery_threshold">Free Douala delivery above (FCFA)</label><input id="free_delivery_threshold" name="free_delivery_threshold" type="number" defaultValue={settings.free_delivery_threshold} className="field" /></div>
          <div className="flex flex-col justify-end gap-2 text-sm">
            <label className="flex items-center gap-2"><input type="checkbox" name="mobile_money_enabled" defaultChecked={settings.mobile_money_enabled === "true"} /> Mobile money at checkout</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="card_enabled" defaultChecked={settings.card_enabled === "true"} /> Card payments</label>
            <label className="flex items-center gap-2"><input type="checkbox" name="cod_enabled" defaultChecked={settings.cod_enabled === "true"} /> Pay on delivery (Douala)</label>
          </div>
        </ActionForm>
        <p className="mt-3 text-xs text-muted">
          Payment provider keys (Stripe, mobile money aggregator) are read from server environment
          variables and never stored in the database.
        </p>
      </section>

      <section>
        <h2 className="display text-2xl">Delivery zones</h2>
        <table className="mt-4 w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs uppercase text-muted">
              <th className="py-2">Zone</th><th>Method</th><th>Fee</th><th>Timeline</th>
            </tr>
          </thead>
          <tbody>
            {zones.map((zone) => (
              <tr key={zone.id} className="border-b border-line/60">
                <td className="py-2">{zone.name}</td>
                <td className="text-xs">{zone.method}</td>
                <td>{zone.fee === 0 ? "Free" : formatXAF(zone.fee)}</td>
                <td className="text-xs text-muted">{zone.etaLabel}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <ActionForm action={saveZoneAction} submitLabel="Add zone" compact className="card mt-4 grid gap-4 p-5 sm:grid-cols-4">
          <div><label className="label" htmlFor="zname">Zone name</label><input id="zname" name="name" className="field" /></div>
          <div>
            <label className="label" htmlFor="zmethod">Method</label>
            <select id="zmethod" name="method" className="field">
              <option value="douala_local">Douala local</option><option value="national">National</option><option value="pickup">Pickup</option>
            </select>
          </div>
          <div><label className="label" htmlFor="zfee">Fee (FCFA)</label><input id="zfee" name="fee" type="number" defaultValue={2000} className="field" /></div>
          <div><label className="label" htmlFor="zeta">Timeline</label><input id="zeta" name="etaLabel" className="field" placeholder="Next day" /></div>
        </ActionForm>
      </section>

      <section>
        <h2 className="display text-2xl">FAQ & policies</h2>
        <p className="mt-2 text-sm text-ink-soft">The concierge answers from these entries, so keep them current.</p>
        <ul className="mt-4 space-y-2 text-sm">
          {faqRows.map((faq) => (
            <li key={faq.id} className="card p-4">
              <p className="font-medium">{faq.question}</p>
              <p className="mt-1 text-xs text-ink-soft">{faq.answer}</p>
            </li>
          ))}
        </ul>
        <ActionForm action={saveFaqAction} submitLabel="Add FAQ" compact className="card mt-4 grid gap-4 p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <div><label className="label" htmlFor="fcat">Category</label><input id="fcat" name="category" defaultValue="General" className="field" /></div>
            <div><label className="label" htmlFor="fsort">Order</label><input id="fsort" name="sortOrder" type="number" defaultValue={faqRows.length} className="field" /></div>
          </div>
          <div><label className="label" htmlFor="fq">Question</label><input id="fq" name="question" className="field" /></div>
          <div><label className="label" htmlFor="fa">Answer</label><textarea id="fa" name="answer" rows={2} className="field" /></div>
        </ActionForm>
      </section>

      <section>
        <h2 className="display text-2xl">Recent admin activity</h2>
        <ul className="mt-4 space-y-1 text-xs text-ink-soft">
          {log.map((entry) => (
            <li key={entry.id} className="border-b border-line/60 py-2">
              {formatDateTime(entry.createdAt)} · <span className="text-accent">{entry.action}</span> · {entry.detail} · {entry.actorEmail}
            </li>
          ))}
          {log.length === 0 ? <li className="text-muted">Nothing logged yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
