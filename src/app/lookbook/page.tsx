import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { lookbookItems } from "@/db/schema";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";
import { BuyNowButton } from "@/components/buy-now-button";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lookbook", description: "The OSSZ Collections editorial lookbook, shot in Douala." };

export default async function LookbookPage() {
  const [looks, locale] = await Promise.all([
    db.select().from(lookbookItems).orderBy(asc(lookbookItems.sortOrder)),
    getLocale(),
  ]);
  return (
    <div className="wrap py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">{t(locale, "look.eyebrow")}</p>
        <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "look.title")}</h1>
        <p className="mt-4 text-sm leading-relaxed text-ink-soft">
          {t(locale, "look.intro")}
        </p>
      </header>
      <div className="mt-12 columns-1 gap-5 sm:columns-2 lg:columns-3">
        {looks.map((look) => (
          <figure key={look.id} className="group relative mb-5 break-inside-avoid">
            <Link href={look.productSlug ? `/product/${look.productSlug}` : "/shop"} className="block zoom-parent">
              <div className="photo-frame relative aspect-[3/4]">
                <Image src={look.imageUrl} alt={look.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" quality={65} className="object-cover object-top" />
              </div>
              <figcaption className="mt-2 flex items-center justify-between text-xs text-muted">
                <span>{pick(locale, look.caption, look.captionFr)}</span>
                <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">{t(locale, "look.shop")}</span>
              </figcaption>
            </Link>
            {look.productSlug ? (
              <BuyNowButton slug={look.productSlug} locale={locale} inStock variant="overlay" />
            ) : null}
          </figure>
        ))}
      </div>
    </div>
  );
}
