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
    <div className="space-y-10">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Store Configuration</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Settings & Concierge</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Global store communication details, payment flags, logistics zones, and knowledge base for the OSSZ Concierge.
          </p>
        </div>
      </div>

      {/* Global Store Settings */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Contact & Concierge Defaults</span>
        </div>
        <div className="card rounded-2xl border border-line bg-paper p-6 shadow-xs">
          <ActionForm action={saveSettingsAction} submitLabel="Save store settings" className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="whatsapp_number">WhatsApp Dispatch / Hand-off Number</label>
              <input id="whatsapp_number" name="whatsapp_number" defaultValue={settings.whatsapp_number} className="field rounded-xl" placeholder="+237 6XX XXX XXX" />
            </div>
            <div>
              <label className="label" htmlFor="contact_email">Public Contact Email</label>
              <input id="contact_email" name="contact_email" type="email" defaultValue={settings.contact_email} className="field rounded-xl" placeholder="concierge@osszcollections.com" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="store_address">Flagship Atelier / Studio Address</label>
              <input id="store_address" name="store_address" defaultValue={settings.store_address} className="field rounded-xl" placeholder="Akwa / Bonanjo, Douala, Cameroon" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="business_hours">Opening Hours</label>
              <input id="business_hours" name="business_hours" defaultValue={settings.business_hours} className="field rounded-xl" placeholder="Mon – Sat: 09:00 – 19:00" />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="concierge_greeting">Concierge AI Welcome Greeting</label>
              <textarea id="concierge_greeting" name="concierge_greeting" rows={2} defaultValue={settings.concierge_greeting} className="field rounded-xl" />
            </div>
            <div>
              <label className="label" htmlFor="free_delivery_threshold">Free Douala Delivery Threshold (FCFA)</label>
              <input id="free_delivery_threshold" name="free_delivery_threshold" type="number" defaultValue={settings.free_delivery_threshold} className="field rounded-xl" />
            </div>
            <div className="flex flex-col justify-end gap-3 text-xs pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="mobile_money_enabled" defaultChecked={settings.mobile_money_enabled === "true"} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                <span className="font-medium text-ink">Enable Mobile Money checkout (MTN / Orange)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="card_enabled" defaultChecked={settings.card_enabled === "true"} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                <span className="font-medium text-ink">Enable International Card processing (Visa / Mastercard)</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input type="checkbox" name="cod_enabled" defaultChecked={settings.cod_enabled === "true"} className="h-4 w-4 rounded border-line text-accent focus:ring-accent" />
                <span className="font-medium text-ink">Enable Cash on Delivery (Douala metropolitan zone only)</span>
              </label>
            </div>
          </ActionForm>
          <p className="mt-4 text-xs text-muted pt-3 border-t border-line/60">
            Payment API secret keys and SMTP mail credentials are read directly from server environment variables for high security.
          </p>
        </div>
      </section>

      {/* Delivery Zones */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Delivery Zones & Rates ({zones.length})</span>
        </div>
        <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-left text-xs">
              <thead className="bg-canvas/50 border-b border-line/60">
                <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3 px-4">Zone Name</th>
                  <th className="py-3 px-4">Method</th>
                  <th className="py-3 px-4">Shipping Fee</th>
                  <th className="py-3 px-4 text-right">Estimated Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {zones.map((zone) => (
                  <tr key={zone.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3 px-4 font-medium text-ink">{zone.name}</td>
                    <td className="py-3 px-4 text-ink-soft capitalize">{zone.method.replace(/_/g, " ")}</td>
                    <td className="py-3 px-4 font-semibold text-accent">{zone.fee === 0 ? "Free" : formatXAF(zone.fee)}</td>
                    <td className="py-3 px-4 text-right text-muted">{zone.etaLabel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Add Delivery Zone Form */}
        <div className="card rounded-2xl border border-line bg-paper p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">+ Add New Delivery Zone</p>
          <ActionForm action={saveZoneAction} submitLabel="Add zone" compact className="grid gap-4 sm:grid-cols-4">
            <div>
              <label className="label" htmlFor="zname">Zone name</label>
              <input id="zname" name="name" required className="field rounded-xl" placeholder="e.g. Yaoundé Express" />
            </div>
            <div>
              <label className="label" htmlFor="zmethod">Method category</label>
              <select id="zmethod" name="method" className="field rounded-xl">
                <option value="douala_local">Douala local</option>
                <option value="national">National delivery</option>
                <option value="pickup">Atelier pickup</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="zfee">Flat Fee (FCFA)</label>
              <input id="zfee" name="fee" type="number" defaultValue={2000} className="field rounded-xl" />
            </div>
            <div>
              <label className="label" htmlFor="zeta">ETA Label</label>
              <input id="zeta" name="etaLabel" className="field rounded-xl" placeholder="e.g. 24–48 hours" />
            </div>
          </ActionForm>
        </div>
      </section>

      {/* FAQ & Policies */}
      <section className="space-y-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">Concierge Knowledge Base ({faqRows.length})</span>
          <p className="text-xs text-muted mt-0.5">The AI Concierge actively quotes from these entries to assist visitors.</p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {faqRows.map((faq) => (
            <div key={faq.id} className="card rounded-2xl border border-line bg-paper p-5 shadow-xs hover:border-accent/40 transition-all">
              <span className="text-[10px] font-semibold uppercase tracking-widest text-accent bg-accent/10 px-2 py-0.5 rounded-full inline-block mb-2">
                {faq.category || "General"}
              </span>
              <p className="font-semibold text-ink text-xs">{faq.question}</p>
              <p className="mt-1.5 text-xs text-ink-soft leading-relaxed">{faq.answer}</p>
            </div>
          ))}
        </div>

        {/* Add FAQ Form */}
        <div className="card rounded-2xl border border-line bg-paper p-5 shadow-xs">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted mb-3">+ Add New Knowledge Entry / FAQ</p>
          <ActionForm action={saveFaqAction} submitLabel="Save entry" compact className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="fcat">Category</label>
                <input id="fcat" name="category" defaultValue="General" className="field rounded-xl" />
              </div>
              <div>
                <label className="label" htmlFor="fsort">Sort order</label>
                <input id="fsort" name="sortOrder" type="number" defaultValue={faqRows.length} className="field rounded-xl" />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="fq">Question / Topic</label>
              <input id="fq" name="question" required className="field rounded-xl" placeholder="e.g. What is your return and alterations policy?" />
            </div>
            <div>
              <label className="label" htmlFor="fa">Concierge Answer</label>
              <textarea id="fa" name="answer" rows={3} required className="field rounded-xl" placeholder="Explain clearly..." />
            </div>
          </ActionForm>
        </div>
      </section>

      {/* Audit Log */}
      <section className="space-y-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted">Recent Administrative Audit Activity</span>
        <div className="card rounded-2xl border border-line bg-paper p-5 shadow-xs">
          <ul className="divide-y divide-line/40 text-xs text-ink-soft">
            {log.map((entry) => (
              <li key={entry.id} className="py-2.5 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 truncate">
                  <span className="font-semibold uppercase text-[10px] tracking-wide text-accent bg-accent/10 px-2 py-0.5 rounded">
                    {entry.action}
                  </span>
                  <span className="text-ink truncate">{entry.detail}</span>
                </div>
                <div className="text-[11px] text-muted shrink-0">
                  <span>{entry.actorEmail}</span> · <span>{formatDateTime(entry.createdAt)}</span>
                </div>
              </li>
            ))}
            {log.length === 0 ? <li className="py-3 text-muted text-center">No recent administrative activities logged.</li> : null}
          </ul>
        </div>
      </section>
    </div>
  );
}
