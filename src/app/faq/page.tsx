import Link from "next/link";
import type { Metadata } from "next";
import { getSettings, listFaqs } from "@/lib/store";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Delivery, returns & payment" };

export default async function FaqPage() {
  const [faqs, settings, locale] = await Promise.all([listFaqs(), getSettings(), getLocale()]);
  const L = faqs.map((f) => ({
    id: f.id,
    category: pick(locale, f.category, f.categoryFr),
    question: pick(locale, f.question, f.questionFr),
    answer: pick(locale, f.answer, f.answerFr),
  }));
  const groups = Array.from(new Set(L.map((f) => f.category)));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: L.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="wrap max-w-3xl py-14">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <p className="eyebrow">{t(locale, "faq.eyebrow")}</p>
      <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "faq.title")}</h1>
      <p className="mt-4 text-sm text-ink-soft">
        {t(locale, "faq.intro")}
      </p>

      {groups.map((group) => (
        <section key={group} className="mt-12">
          <h2 className="eyebrow">{group}</h2>
          <div className="mt-4 divide-y divide-line border-y border-line">
            {L.filter((f) => f.category === group).map((faq) => (
              <details key={faq.id} className="group py-4">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-sm font-medium">
                  {faq.question}
                  <span className="text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      ))}

      <div className="card mt-12 p-6">
        <p className="eyebrow">{t(locale, "faq.stillEyebrow")}</p>
        <p className="mt-2 text-sm text-ink-soft">
          Write to us at {settings.contact_email}, or visit {settings.store_address}.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/contact" className="btn btn-secondary btn-sm">{t(locale, "faq.contactCta")}</Link>
          <Link href="/order-lookup" className="btn btn-ghost btn-sm">{t(locale, "faq.trackCta")}</Link>
        </div>
      </div>
    </div>
  );
}
