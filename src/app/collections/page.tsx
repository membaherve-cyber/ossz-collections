import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections } from "@/db/schema";
import { SectionHead } from "@/components/ui";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Collections" };

export default async function CollectionsPage() {
  const [rows, locale] = await Promise.all([
    db.select().from(collections).where(eq(collections.isPublished, true)),
    getLocale(),
  ]);
  return (
    <div className="wrap py-14">
      <SectionHead eyebrow={t(locale, "cols.eyebrow")} title={t(locale, "cols.title")} intro={t(locale, "cols.intro")} />
      <div className="mt-12 space-y-16">
        {rows.map((collection, index) => (
          <article key={collection.id} className={`grid items-center gap-8 md:grid-cols-2 ${index % 2 ? "md:[&>a]:order-2" : ""}`}>
            <Link href={`/collections/${collection.slug}`} className="photo-frame relative block aspect-[4/3] zoom-parent">
              {collection.coverImage ? (
                <Image src={collection.coverImage} alt={collection.name} fill sizes="(min-width:768px) 50vw, 100vw" quality={65} className="object-cover object-top" />
              ) : null}
            </Link>
            <div>
              <p className="eyebrow">{pick(locale, collection.season, collection.seasonFr)}</p>
              <h2 className="display mt-2 text-3xl">{pick(locale, collection.name, collection.nameFr)}</h2>
              <p className="mt-4 text-sm leading-relaxed text-ink-soft">{pick(locale, collection.description, collection.descriptionFr)}</p>
              <Link href={`/collections/${collection.slug}`} className="btn btn-secondary mt-6">
                {t(locale, "cols.view")}
              </Link>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
