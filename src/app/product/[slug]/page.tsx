import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { wishlists } from "@/db/schema";
import { getProductBySlug, listProducts, getSettings } from "@/lib/store";
import { getLocale } from "@/lib/locale-server";
import { getCurrentUser } from "@/lib/auth";
import { AddToCart } from "@/components/add-to-cart";
import { ProductGallery } from "@/components/product-gallery";
import { ProductGrid } from "@/components/product-grid";
import { formatXAF, waLink } from "@/lib/utils";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data) return { title: "Piece not found" };
  return {
    title: data.product.seoTitle || data.product.name,
    description: data.product.seoDescription || data.product.description,
    openGraph: {
      title: data.product.name,
      description: data.product.description,
      images: data.images[0] ? [data.images[0].url] : [],
    },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getProductBySlug(slug);
  if (!data || !data.product.isPublished) notFound();

  const [related, user, settings, locale] = await Promise.all([
    listProducts({ collection: data.collectionSlug ?? undefined, limit: 5 }),
    getCurrentUser(),
    getSettings(),
    getLocale(),
  ]);

  const saved = user
    ? (
        await db
          .select()
          .from(wishlists)
          .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, data.product.id)))
          .limit(1)
      ).length > 0
    : false;

  const pname = pick(locale, data.product.name, data.product.nameFr);
  const pdesc = pick(locale, data.product.description, data.product.descriptionFr);
  const inStock = data.variants.some((v) => v.stockQty > 0);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pname,
    description: pdesc,
    image: data.images.map((i) => i.url),
    brand: { "@type": "Brand", name: "OSSZ Collections" },
    offers: {
      "@type": "Offer",
      price: data.product.basePrice,
      priceCurrency: "XAF",
      availability: inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <div className="wrap pb-10 pt-4 md:pb-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <nav className="text-xs text-muted">
        <Link href="/shop" className="link-underline">
          Shop
        </Link>
        {data.categoryName ? (
          <>
            {" / "}
            <Link href={`/shop?category=${data.categorySlug}`} className="link-underline">
              {pick(locale, data.categoryName, data.categoryNameFr)}
            </Link>
          </>
        ) : null}
        {" / "}
        <span className="text-ink-soft">{data.product.name}</span>
      </nav>

      <div className="mt-6 grid gap-10 lg:grid-cols-[1.1fr_1fr]">
        <ProductGallery
          images={data.images.map((i) => ({ id: i.id, url: i.url, altText: i.altText }))}
          name={pname}
        />

        <div className="lg:sticky lg:top-32 lg:self-start">
          {data.collectionName ? (
            <Link href={`/collections/${data.collectionSlug}`} className="eyebrow link-underline">
              {pick(locale, data.collectionName, data.collectionNameFr)}
            </Link>
          ) : null}
          <h1 className="display mt-2 text-3xl md:text-4xl">{pname}</h1>
          <p className="mt-3 text-lg">{formatXAF(data.product.basePrice)}</p>
          <p className="mt-4 text-sm leading-relaxed text-ink-soft">{pdesc}</p>

          <AddToCart
            productId={data.product.id}
            basePrice={data.product.basePrice}
            variants={data.variants.map((v) => ({
              id: v.id,
              size: v.size,
              colour: v.colour,
              stockQty: v.stockQty,
              price: v.priceOverride ?? data.product.basePrice,
            }))}
            initiallySaved={saved}
            signedIn={Boolean(user)}
            locale={locale}
            codEnabled={settings.cod_enabled === "true"}
            name={pname}
            slug={data.product.slug}
            image={data.images[0]?.url ?? ""}
            description={pdesc}
          />

          <div className="mt-8 space-y-3 text-sm">
            <Detail title={t(locale, "pdp.details")}>{pick(locale, data.product.details, data.product.detailsFr)}</Detail>
            <Detail title={t(locale, "pdp.care")}>{pick(locale, data.product.careInstructions, data.product.careInstructionsFr)}</Detail>
            <Detail title={t(locale, "pdp.sizeGuide")}>
              {t(locale, "pdp.sizeGuideBody")}{" "}
              <Link href="/size-guide" className="text-accent link-underline">
                {t(locale, "pdp.sizeGuide")} →
              </Link>
            </Detail>
            <Detail title={t(locale, "pdp.deliveryReturns")}>{t(locale, "pdp.deliveryReturnsBody")}</Detail>
          </div>

          <div className="mt-6 rounded-sm border border-line bg-accent-soft/40 p-4">
            <p className="text-sm text-ink-soft">
              {t(locale, "pdp.askBody")}
            </p>
            <a
              className="btn btn-ghost mt-1 px-0 text-accent"
              href={waLink(
                settings.whatsapp_number,
                `Hello OSSZ Collections, I would like to ask about the ${pname}.`,
              )}
              target="_blank"
              rel="noreferrer"
            >
              {t(locale, "pdp.askWa")}
            </a>
          </div>
        </div>
      </div>

      <section className="mt-20">
        <h2 className="display text-2xl">{t(locale, "pdp.alsoLike")}</h2>
        <div className="mt-8">
          <ProductGrid products={related.filter((p) => p.slug !== slug).slice(0, 4)} />
        </div>
      </section>
    </div>
  );
}

function Detail({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-line pb-3">
      <summary className="flex cursor-pointer list-none items-center justify-between py-2 text-[0.78rem] tracking-[0.12em] uppercase">
        {title}
        <span className="text-muted transition-transform group-open:rotate-45">+</span>
      </summary>
      <p className="pb-2 text-sm leading-relaxed text-ink-soft">{children}</p>
    </details>
  );
}
