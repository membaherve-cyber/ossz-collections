import type { Metadata } from "next";
import { getSettings } from "@/lib/store";
import { ContactForm } from "@/components/contact-form";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";
import { waLink } from "@/lib/utils";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Contact & store" };

export default async function ContactPage() {
  const [settings, locale] = await Promise.all([getSettings(), getLocale()]);
  return (
    <div className="wrap grid gap-12 py-14 md:grid-cols-2">
      <div>
        <p className="eyebrow">{t(locale, "contact.eyebrow")}</p>
        <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "contact.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {t(locale, "contact.intro")}
        </p>
        <dl className="mt-8 space-y-5 text-sm">
          <div><dt className="eyebrow">{t(locale, "contact.boutique")}</dt><dd className="mt-1 text-ink-soft">{settings.store_address}</dd></div>
          <div><dt className="eyebrow">{t(locale, "contact.hours")}</dt><dd className="mt-1 text-ink-soft">{settings.business_hours}</dd></div>
          <div><dt className="eyebrow">{t(locale, "contact.email")}</dt><dd className="mt-1 text-ink-soft">{settings.contact_email}</dd></div>
          <div><dt className="eyebrow">{t(locale, "contact.wa")}</dt><dd className="mt-1 text-ink-soft">{settings.whatsapp_number}</dd></div>
        </dl>
        <a
          className="btn btn-primary mt-8"
          target="_blank"
          rel="noreferrer"
          href={waLink(settings.whatsapp_number, "Hello OSSZ Collections, I would like some assistance please.")}
        >
          {t(locale, "contact.waCta")}
        </a>
      </div>
      <ContactForm />
    </div>
  );
}
