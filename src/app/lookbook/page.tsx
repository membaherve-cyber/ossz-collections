import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { asc } from "drizzle-orm";
import { db } from "@/db";
import { lookbookItems } from "@/db/schema";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";
import { BuyNowButton } from "@/components/buy-now-button";
import { LookbookVideo } from "@/components/lookbook-video";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Lookbook", description: "The OSSZ Collections editorial lookbook, shot in Douala." };

/**
 * Product page names that exist in the catalogue. Kept here so a look never
 * links to a dead product URL: anything not in this list falls back to /shop.
 * When the catalogue changes, update this map (or clear the productSlug in the
 * backoffice).
 */
const KNOWN_PRODUCT_SLUGS = new Set([
  "amber-heritage-look",
  "burgundy-statement-gown",
  "camel-tailored-coat",
  "charcoal-draped-look",
  "ivoire-occasion-gown",
  "mauve-signature-set",
  "midnight-column-dress",
  "noir-editorial-piece",
  "olive-safari-set",
  "periwinkle-drape-gown",
  "sand-linen-look",
  "wouri-teal-evening-piece",
]);

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
        {looks.map((look) => {
          const isVideo = look.mediaType === "video";
          const caption = pick(locale, look.caption, look.captionFr);
          // Every look leads to the shop; a valid product slug deep-links to
          // its product page, everything else goes to the shop section.
          const href = !look.productSlug || !KNOWN_PRODUCT_SLUGS.has(look.productSlug)
            ? "/shop"
            : `/product/${look.productSlug}`;
          const media = isVideo ? (
            <LookbookVideo
              src={look.videoUrl ?? look.imageUrl}
              poster={look.posterUrl}
              title={look.title}
              caption={caption}
              durationSeconds={look.durationSeconds}
              className="photo-frame aspect-[3/4]"
            />
          ) : (
            <Link href={href} className="block zoom-parent">
              <div className="photo-frame relative aspect-[3/4]">
                <Image src={look.imageUrl} alt={look.title} fill sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw" quality={65} className="object-cover object-top" />
              </div>
            </Link>
          );
          return (
            <figure key={look.id} className="group relative mb-5 break-inside-avoid">
              {isVideo ? (
                media
              ) : (
                <>
                  {media}
                  <figcaption className="mt-2 flex items-center justify-between text-xs text-muted">
                    <span>{caption}</span>
                    <span className="text-accent opacity-0 transition-opacity group-hover:opacity-100">{t(locale, "look.shop")}</span>
                  </figcaption>
                </>
              )}
              {!isVideo && look.productSlug && KNOWN_PRODUCT_SLUGS.has(look.productSlug) ? (
                <BuyNowButton slug={look.productSlug} locale={locale} inStock variant="overlay" />
              ) : null}
            </figure>
          );
        })}
      </div>
    </div>
  );
}
