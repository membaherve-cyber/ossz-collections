import Image from "next/image";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { listProducts } from "@/lib/store";
import { ProductGrid } from "@/components/product-grid";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const row = (await db.select().from(collections).where(eq(collections.slug, slug)).limit(1))[0];
  return row ? { title: row.name, description: row.description } : { title: "Collection" };
}

export default async function CollectionPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const collection = (await db.select().from(collections).where(eq(collections.slug, slug)).limit(1))[0];
  if (!collection) notFound();
  const locale = await getLocale();
  const products = await listProducts({ collection: slug, locale });

  return (
    <div>
      <section className="relative h-[52vh] min-h-[360px] overflow-hidden bg-clay">
        {collection.coverImage ? (
          <Image src={collection.coverImage} alt={collection.name} fill priority sizes="100vw" quality={65} className="object-cover object-top opacity-90" />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
        <div className="wrap relative flex h-full flex-col justify-end pb-12 text-white">
          <p className="eyebrow text-white/70">{pick(locale, collection.season, collection.seasonFr)}</p>
          <h1 className="display mt-2 text-4xl md:text-5xl">{pick(locale, collection.name, collection.nameFr)}</h1>
          <p className="mt-3 max-w-xl text-sm text-white/85">{pick(locale, collection.description, collection.descriptionFr)}</p>
        </div>
      </section>
      <div className="wrap py-14">
        <p className="text-xs tracking-[0.14em] uppercase text-muted">{products.length} {products.length === 1 ? t(locale, "shop.piece") : t(locale, "shop.pieces")}</p>
        <div className="mt-8">
          <ProductGrid products={products} priorityCount={4} />
        </div>
      </div>
    </div>
  );
}
