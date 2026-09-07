import Link from "next/link";
import type { Metadata } from "next";
import { listFilterFacets, listProducts } from "@/lib/store";
import { ProductGrid } from "@/components/product-grid";
import { ShopSearch } from "@/components/shop-search";
import { EmptyState } from "@/components/ui";
import { formatXAF } from "@/lib/utils";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Shop all pieces",
  description: "Browse every OSSZ Collections piece — filter by category, size, colour and price.",
};

type SearchParams = Record<string, string | string[] | undefined>;

function one(params: SearchParams, key: string): string | undefined {
  const value = params[key];
  return Array.isArray(value) ? value[0] : value;
}

function buildHref(params: SearchParams, patch: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    const v = Array.isArray(value) ? value[0] : value;
    if (v) search.set(key, v);
  }
  for (const [key, value] of Object.entries(patch)) {
    if (value === undefined || value === "") search.delete(key);
    else search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `/shop?${qs}` : "/shop";
}

const SORT_KEYS = [
  ["newest", "shop.newest"],
  ["price_asc", "shop.priceAsc"],
  ["price_desc", "shop.priceDesc"],
  ["popular", "shop.popular"],
] as const;

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const locale = await getLocale();
  const facets = await listFilterFacets();

  const filters = {
    category: one(params, "category"),
    collection: one(params, "collection"),
    size: one(params, "size"),
    colour: one(params, "colour"),
    availability: one(params, "availability"),
    sort: one(params, "sort") ?? "newest",
    minPrice: one(params, "min") ? Number(one(params, "min")) : undefined,
    maxPrice: one(params, "max") ? Number(one(params, "max")) : undefined,
    q: one(params, "q"),
    locale,
  };

  const all = await listProducts(filters);

  // §6.2 grid/list toggle and pagination
  const view = one(params, "view") === "list" ? "list" : "grid";
  const PER_PAGE = 9;
  const pageNo = Math.max(1, Number(one(params, "page") ?? 1) || 1);
  const totalPages = Math.max(1, Math.ceil(all.length / PER_PAGE));
  const current = Math.min(pageNo, totalPages);
  const products = all.slice((current - 1) * PER_PAGE, current * PER_PAGE);
  const activeCount = ["category", "collection", "size", "colour", "availability", "min", "max"].filter(
    (key) => one(params, key),
  ).length;

  const priceBands: Array<[string, string | undefined, string | undefined]> = [
    [t(locale, "shop.under"), undefined, "80000"],
    [t(locale, "shop.band2"), "80000", "150000"],
    [t(locale, "shop.band3"), "150000", "250000"],
    [t(locale, "shop.above"), "250000", undefined],
  ];

  return (
    <div className="wrap py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">{t(locale, "shop.eyebrow")}</p>
        <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "shop.title")}</h1>
      </header>

      <div className="mt-8 max-w-2xl">
        <ShopSearch
          initialQ={filters.q}
          label={t(locale, "shop.searchLabel")}
          hint={t(locale, "shop.searchHint")}
          clearLabel={t(locale, "shop.searchClear")}
          placeholder={t(locale, "search.placeholder")}
          cta={t(locale, "search.cta")}
        />
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-[260px_1fr]">
        <aside className="space-y-8 lg:sticky lg:top-32 lg:self-start">
          <div className="flex items-center justify-between">
            <p className="eyebrow">{t(locale, "shop.filters")} {activeCount ? `(${activeCount})` : ""}</p>
            {activeCount ? (
              <Link href="/shop" className="text-xs text-accent link-underline">
                {t(locale, "shop.clearAll")}
              </Link>
            ) : null}
          </div>

          <FilterGroup title={t(locale, "shop.category")}>
            {facets.categories.map((cat) => (
              <Link
                key={cat.id}
                href={buildHref(params, { category: filters.category === cat.slug ? undefined : cat.slug })}
                className={`chip ${filters.category === cat.slug ? "chip-active" : ""}`}
              >
                {locale === "fr" && cat.nameFr ? cat.nameFr : cat.name}
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title={t(locale, "shop.collection")}>
            {facets.collections.map((col) => (
              <Link
                key={col.id}
                href={buildHref(params, { collection: filters.collection === col.slug ? undefined : col.slug })}
                className={`chip ${filters.collection === col.slug ? "chip-active" : ""}`}
              >
                {locale === "fr" && col.nameFr ? col.nameFr : col.name}
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title={t(locale, "buy.size")}>
            {facets.sizes.map((size) => (
              <Link
                key={size}
                href={buildHref(params, { size: filters.size === size ? undefined : size })}
                className={`chip ${filters.size === size ? "chip-active" : ""}`}
              >
                {size}
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title={t(locale, "buy.colour")}>
            {facets.colours.map((colour) => (
              <Link
                key={colour}
                href={buildHref(params, { colour: filters.colour === colour ? undefined : colour })}
                className={`chip ${filters.colour === colour ? "chip-active" : ""}`}
              >
                {colour}
              </Link>
            ))}
          </FilterGroup>

          <FilterGroup title={`${t(locale, "shop.price")} (${formatXAF(facets.minPrice)} – ${formatXAF(facets.maxPrice)})`}>
            {priceBands.map(([label, min, max]) => {
              const active = one(params, "min") === min && one(params, "max") === max;
              return (
                <Link
                  key={label}
                  href={buildHref(params, {
                    min: active ? undefined : min,
                    max: active ? undefined : max,
                  })}
                  className={`chip ${active ? "chip-active" : ""}`}
                >
                  {label}
                </Link>
              );
            })}
          </FilterGroup>

          <FilterGroup title={t(locale, "shop.availability")}>
            {[
              ["in_stock", t(locale, "shop.inStock")],
              ["out_of_stock", t(locale, "shop.outOfStock")],
            ].map(([value, label]) => (
              <Link
                key={value}
                href={buildHref(params, {
                  availability: filters.availability === value ? undefined : value,
                })}
                className={`chip ${filters.availability === value ? "chip-active" : ""}`}
              >
                {label}
              </Link>
            ))}
          </FilterGroup>
        </aside>

        <section>
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-4">
            <div className="flex items-center gap-3">
              <p className="text-xs tracking-[0.14em] uppercase text-muted">{t(locale, "shop.sortBy")}</p>
              <div className="flex overflow-hidden rounded-sm border border-line">
                <Link
                  href={buildHref(params, { view: undefined, page: undefined })}
                  aria-label={t(locale, "view.grid")}
                  aria-current={view === "grid"}
                  className={`px-3 py-1.5 text-[0.68rem] tracking-[0.12em] uppercase ${view === "grid" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
                >
                  {t(locale, "view.grid")}
                </Link>
                <Link
                  href={buildHref(params, { view: "list", page: undefined })}
                  aria-label={t(locale, "view.list")}
                  aria-current={view === "list"}
                  className={`px-3 py-1.5 text-[0.68rem] tracking-[0.12em] uppercase ${view === "list" ? "bg-ink text-white" : "text-ink-soft hover:text-ink"}`}
                >
                  {t(locale, "view.list")}
                </Link>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {SORT_KEYS.map(([value, key]) => (
                <Link
                  key={value}
                  href={buildHref(params, { sort: value })}
                  className={`chip ${filters.sort === value ? "chip-active" : ""}`}
                >
                  {t(locale, key)}
                </Link>
              ))}
            </div>
          </div>

          {products.length === 0 ? (
            <div className="mt-10">
              <EmptyState
                title={t(locale, "shop.noneTitle")}
                body={t(locale, "shop.noneBody")}
                action={
                  <Link href="/shop" className="btn btn-secondary btn-sm mt-2">
                    {t(locale, "shop.clearFilters")}
                  </Link>
                }
              />
            </div>
          ) : (
            <div className="mt-8">
              <ProductGrid
                products={products}
                columns="lg:grid-cols-3"
                priorityCount={3}
                view={view}
              />

              {totalPages > 1 ? (
                <nav
                  aria-label="Pagination"
                  className="mt-12 flex items-center justify-between border-t border-line pt-6"
                >
                  {current > 1 ? (
                    <Link href={buildHref(params, { page: String(current - 1) })} className="btn btn-secondary btn-sm">
                      ← {t(locale, "view.prev")}
                    </Link>
                  ) : (
                    <span />
                  )}

                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                      <Link
                        key={n}
                        href={buildHref(params, { page: n === 1 ? undefined : String(n) })}
                        aria-current={n === current}
                        className={`flex h-8 min-w-8 items-center justify-center rounded-sm px-2 text-xs ${
                          n === current ? "bg-ink text-white" : "border border-line text-ink-soft hover:border-ink"
                        }`}
                      >
                        {n}
                      </Link>
                    ))}
                  </div>

                  {current < totalPages ? (
                    <Link href={buildHref(params, { page: String(current + 1) })} className="btn btn-secondary btn-sm">
                      {t(locale, "view.next")} →
                    </Link>
                  ) : (
                    <span />
                  )}
                </nav>
              ) : null}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-[0.72rem] tracking-[0.14em] uppercase text-ink">{title}</p>
      <div className="mt-3 flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
