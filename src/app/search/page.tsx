import Link from "next/link";
import type { Metadata } from "next";
import { listProducts } from "@/lib/store";
import { ProductGrid } from "@/components/product-grid";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const q = typeof params.q === "string" ? params.q : "";
  const locale = await getLocale();
  const results = q ? await listProducts({ q, limit: 40, locale }) : [];
  const suggestions = q ? [] : await listProducts({ sort: "popular", limit: 4, locale });

  return (
    <div className="wrap py-14">
      <p className="eyebrow">{t(locale, "nav.search")}</p>
      <h1 className="display mt-2 text-4xl">{t(locale, "search.title")}</h1>
      <form method="get" className="mt-6 flex max-w-xl gap-2">
        <label className="sr-only" htmlFor="q">{t(locale, "search.title")}</label>
        <input id="q" name="q" defaultValue={q} placeholder={t(locale, "search.placeholder")} className="field" autoFocus />
        <button className="btn btn-primary">{t(locale, "search.cta")}</button>
      </form>

      {q ? (
        <p className="mt-6 text-sm text-ink-soft">
          {t(locale, "search.results", { n: results.length, q })}
        </p>
      ) : (
        <p className="mt-6 text-sm text-ink-soft">{t(locale, "search.popular")}</p>
      )}

      <div className="mt-8">
        <ProductGrid products={q ? results : suggestions} />
      </div>

      {q && results.length === 0 ? (
        <Link href="/shop" className="btn btn-secondary mt-10">{t(locale, "search.browse")}</Link>
      ) : null}
    </div>
  );
}
