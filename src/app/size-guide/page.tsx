import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Size guide",
  description: "OSSZ Collections size guide — measurements, fit notes and how our pieces run.",
};

const ROWS = [
  ["XS", "FR 34", "82–85", "63–66", "89–92"],
  ["S", "FR 36", "86–89", "67–70", "93–96"],
  ["M", "FR 38", "90–93", "71–74", "97–100"],
  ["L", "FR 40", "94–98", "75–79", "101–105"],
  ["XL", "FR 42", "99–103", "80–84", "106–110"],
];

export default async function SizeGuidePage() {
  const locale = await getLocale();
  const fr = locale === "fr";

  return (
    <div className="wrap max-w-3xl py-14">
      <p className="eyebrow">{fr ? "Bon à savoir" : "Good to know"}</p>
      <h1 className="display mt-2 text-4xl md:text-5xl">
        {fr ? "Guide des tailles" : "Size guide"}
      </h1>
      <p className="mt-4 text-sm leading-relaxed text-ink-soft">
        {fr
          ? "Notre prêt-à-porter taille normalement, avec une aisance généreuse à l'épaule. Toutes les mesures sont en centimètres et correspondent au corps, non au vêtement."
          : "Our ready-to-wear runs true to size with a generous ease through the shoulder. All measurements are in centimetres and describe the body, not the garment."}
      </p>

      <div className="mt-8 overflow-x-auto">
        <table className="w-full min-w-[520px] text-sm">
          <thead>
            <tr className="border-y border-line text-left text-xs uppercase tracking-[0.12em] text-muted">
              <th className="py-3">{fr ? "Taille" : "Size"}</th>
              <th>FR</th>
              <th>{fr ? "Poitrine" : "Bust"}</th>
              <th>{fr ? "Taille" : "Waist"}</th>
              <th>{fr ? "Hanches" : "Hips"}</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r[0]} className="border-b border-line/60">
                <td className="py-2.5 font-medium">{r[0]}</td>
                <td className="text-ink-soft">{r[1]}</td>
                <td className="text-ink-soft">{r[2]}</td>
                <td className="text-ink-soft">{r[3]}</td>
                <td className="text-ink-soft">{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="display mt-10 text-2xl">{fr ? "Comment mesurer" : "How to measure"}</h2>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-ink-soft">
        <li>· {fr ? "Poitrine — au point le plus fort, le mètre à plat." : "Bust — around the fullest point, tape level."}</li>
        <li>· {fr ? "Taille — au creux naturel, au-dessus du nombril." : "Waist — at the natural hollow, above the navel."}</li>
        <li>· {fr ? "Hanches — au point le plus large, pieds joints." : "Hips — at the widest point, feet together."}</li>
      </ul>

      <div className="card mt-10 p-6">
        <p className="eyebrow">{fr ? "Entre deux tailles ?" : "Between sizes?"}</p>
        <p className="mt-2 text-sm text-ink-soft">
          {fr
            ? "Nos pièces sur mesure sont taillées à vos mesures exactes. Réservez un essayage, ou demandez au Concierge OSSZ dans le coin de cette page."
            : "Our made-to-measure pieces are cut to your exact measurements. Book a fitting, or ask the OSSZ Concierge in the corner of this page."}
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/appointments" className="btn btn-primary btn-sm">
            {t(locale, "home.bookCta")}
          </Link>
          <Link href="/faq" className="btn btn-secondary btn-sm">
            {t(locale, "faq.title")}
          </Link>
        </div>
      </div>
    </div>
  );
}
