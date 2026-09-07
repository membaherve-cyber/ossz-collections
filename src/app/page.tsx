import Image from "next/image";
import Link from "next/link";
import { asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { collections, homeBlocks, journalPosts, lookbookItems } from "@/db/schema";
import { listProducts } from "@/lib/store";
import { ProductGrid } from "@/components/product-grid";
import { SectionHead } from "@/components/ui";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";
import { LookbookVideo } from "@/components/lookbook-video";

export const dynamic = "force-dynamic";
export default async function HomePage() {
  const locale = await getLocale();
  const [blocks, newArrivals, featured, cols, looks, posts] = await Promise.all([
    db
      .select()
      .from(homeBlocks)
      .where(eq(homeBlocks.isPublished, true))
      .orderBy(asc(homeBlocks.sortOrder)),
    listProducts({ sort: "newest", limit: 8, locale }),
    listProducts({ featured: true, limit: 8, locale }),
    db.select().from(collections).where(eq(collections.isPublished, true)).limit(3),
    db.select().from(lookbookItems).orderBy(asc(lookbookItems.sortOrder)).limit(3),
    db
      .select()
      .from(journalPosts)
      .where(eq(journalPosts.status, "published"))
      .orderBy(desc(journalPosts.publishedAt))
      .limit(2),
  ]);

  const newArrivalsShown = newArrivals.slice(0, 4);
  const newArrivalIds = new Set(newArrivalsShown.map((p) => p.id));
  const featuredShown = featured.filter((p) => !newArrivalIds.has(p.id)).slice(0, 4);

  const hero = blocks.find((b) => b.type === "hero") ?? blocks[0];
  const banner = blocks.find((b) => b.type === "banner");
  const invite = blocks.find((b) => b.type === "quote");

  return (
    <>
      {/* Hero */}
      <section className="relative w-full overflow-hidden bg-[#1a1a1a]" style={{ height: '90vh', minHeight: '600px' }}>
        {hero?.imageUrl ? (
          <Image
            src={hero.imageUrl}
            alt={hero.heading}
            fill
            priority
            fetchPriority="high"
            sizes="100vw"
            quality={65} className="hero-zoom object-contain object-center opacity-90"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-transparent pointer-events-none" />
        <div className="wrap relative flex h-full flex-col items-center justify-end pb-10 text-center text-white md:pb-16">
          <h1 className="display rise delay-1 max-w-3xl text-lg leading-[1.15] md:text-3xl">
            {pick(locale, hero?.heading, hero?.headingFr)}
          </h1>

          <div className="rise delay-3 mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link href={hero?.ctaHref ?? "/shop"} className="btn btn-primary bg-white text-ink hover:bg-accent hover:text-white">
              {pick(locale, hero?.ctaLabel, hero?.ctaLabelFr)}
            </Link>
            <Link href="/appointments" className="btn bg-ink text-white hover:bg-accent hover:text-white border border-white/20">
              {t(locale, "home.bookCta")}
            </Link>
          </div>
        </div>
      </section>

      {/* New arrivals */}
      <section className="wrap py-20">
        <SectionHead
          eyebrow={t(locale, "home.newEyebrow")}
          title={t(locale, "home.newTitle")}
          intro={t(locale, "home.newIntro")}
          href="/shop"
          hrefLabel={t(locale, "home.shopAll")}
        />
        <div className="mt-10">
          <ProductGrid products={newArrivalsShown} priorityCount={2} />
        </div>
      </section>

      {/* Collection banner */}
      {banner ? (
        <section className="relative overflow-hidden bg-[#1a1a1a]">
          <div className="grid md:grid-cols-2">
            <div className="relative aspect-[4/3] md:aspect-auto md:min-h-[520px]">
              {banner.imageUrl ? (
                <Image src={banner.imageUrl} alt={banner.heading} fill sizes="50vw" quality={90} className="object-cover object-top" />
              ) : null}
            </div>
            <div className="flex flex-col justify-center gap-5 px-8 py-16 text-white md:px-16">
              <p className="eyebrow text-white/70">{pick(locale, banner.eyebrow, banner.eyebrowFr)}</p>
              <h2 className="display text-3xl md:text-4xl">{pick(locale, banner.heading, banner.headingFr)}</h2>
              <p className="max-w-md text-sm leading-relaxed text-white/80">{pick(locale, banner.body, banner.bodyFr)}</p>
              <Link
                href={banner.ctaHref}
                className="btn btn-secondary w-fit border-white text-white hover:bg-white hover:text-ink"
              >
                {pick(locale, banner.ctaLabel, banner.ctaLabelFr)}
              </Link>
            </div>
          </div>
        </section>
      ) : null}

      {/* Featured */}
      <section className="wrap py-20">
        <SectionHead eyebrow={t(locale, "home.editEyebrow")} title={t(locale, "home.editTitle")} href="/shop?sort=popular" hrefLabel={t(locale, "home.editLink")} />
        <div className="mt-10">
          <ProductGrid products={featuredShown} />
        </div>
      </section>

      {/* Collections */}
      <section className="bg-paper py-20">
        <div className="wrap">
          <SectionHead
            eyebrow={t(locale, "home.colsEyebrow")}
            title={t(locale, "home.colsTitle")}
            href="/collections"
            hrefLabel={t(locale, "home.colsLink")}
          />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {cols.map((collection) => (
              <Link
                key={collection.id}
                href={`/collections/${collection.slug}`}
                className="group zoom-parent block"
              >
                <div className="photo-frame relative aspect-[4/5]">
                  {collection.coverImage ? (
                    <Image
                      src={collection.coverImage}
                      alt={collection.name}
                      fill
                      sizes="(min-width: 768px) 33vw, 90vw"
                      quality={65} className="object-cover object-top"
                    />
                  ) : null}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                    <p className="eyebrow text-white/70">{pick(locale, collection.season, collection.seasonFr)}</p>
                    <h3 className="display mt-1 text-2xl">{pick(locale, collection.name, collection.nameFr)}</h3>
                  </div>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-ink-soft">{pick(locale, collection.description, collection.descriptionFr)}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Lookbook teaser */}
      <section className="wrap py-20">
        <SectionHead eyebrow={t(locale, "home.lookEyebrow")} title={t(locale, "home.lookTitle")} href="/lookbook" hrefLabel={t(locale, "home.lookLink")} />
        <div className="mt-10 grid grid-cols-2 gap-4 md:grid-cols-3">
          {looks.map((look, index) => (
            <figure key={look.id} className={index === 0 ? "col-span-2 md:col-span-1" : ""}>
              {look.mediaType === "video" ? (
                <LookbookVideo
                  src={look.videoUrl ?? look.imageUrl}
                  poster={look.posterUrl}
                  title={look.title}
                  caption={pick(locale, look.caption, look.captionFr)}
                  durationSeconds={look.durationSeconds}
                  className="photo-frame aspect-[3/4]"
                />
              ) : (
                <div className="photo-frame relative aspect-[3/4] zoom-parent">
                  <Image
                    src={look.imageUrl}
                    alt={look.title}
                    fill
                    sizes="(min-width: 768px) 33vw, 50vw"
                    quality={65} className="object-cover object-top"
                  />
                </div>
              )}
              <figcaption className="mt-2 text-xs text-muted">{pick(locale, look.caption, look.captionFr)}</figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Brand story + invitation */}
      <section className="bg-accent-soft/40 py-20">
        <div className="wrap grid items-center gap-12 md:grid-cols-2">
          <div>
            <p className="eyebrow">{t(locale, "home.storyEyebrow")}</p>
            <h2 className="display mt-3 text-3xl md:text-4xl">{t(locale, "home.storyTitle")}</h2>
            <p className="mt-5 text-sm leading-relaxed text-ink-soft">{t(locale, "home.storyBody")}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link href="/about" className="btn btn-secondary">{t(locale, "home.storyCta")}</Link>
              <Link href="/journal" className="btn btn-ghost">{t(locale, "home.journalCta")}</Link>
            </div>
          </div>
          <div className="grid gap-5">
            {posts.map((post) => (
              <Link key={post.id} href={`/journal/${post.slug}`} className="card flex gap-4 p-4 hover:border-ink">
                <div className="photo-frame photo-frame-sm relative h-24 w-24 shrink-0">
                  {post.coverImage ? (
                    <Image src={post.coverImage} alt={post.title} fill sizes="96px" quality={65} className="object-cover object-top" />
                  ) : null}
                </div>
                <div>
                  <h3 className="display text-xl leading-tight">{pick(locale, post.title, post.titleFr)}</h3>
                  <p className="mt-1 text-xs leading-relaxed text-ink-soft">{pick(locale, post.excerpt, post.excerptFr)}</p>
                </div>
              </Link>
            ))}
            {invite ? (
              <div className="card bg-paper p-5">
                <p className="eyebrow">{pick(locale, invite.eyebrow, invite.eyebrowFr)}</p>
                <h3 className="display mt-1 text-xl">{pick(locale, invite.heading, invite.headingFr)}</h3>
                <p className="mt-2 text-xs text-ink-soft">{pick(locale, invite.body, invite.bodyFr)}</p>
                <Link href={invite.ctaHref} className="btn btn-primary btn-sm mt-4">
                  {pick(locale, invite.ctaLabel, invite.ctaLabelFr)}
                </Link>
              </div>
            ) : null}
          </div>
        </div>
      </section>

      {/* Bottom-of-page contact CTA */}
      <section className="bg-[#1a1a1a] py-10">
        <div className="wrap flex flex-col items-center justify-center gap-3 text-center">
          <p className="text-sm text-white/90">
            Need help finding the right piece, or want to write us a message? We are here for you.
          </p>
          <Link href="/contact" className="btn bg-white text-ink hover:bg-accent hover:text-white">
            Get in touch
          </Link>
          <p className="text-xs text-white/50">
            Or write to us directly at{" "}
            <a href="mailto:info@osszcollection.com" className="text-accent hover:text-white hover:underline">
              info@osszcollection.com
            </a>
          </p>
        </div>
      </section>
    </>
  );
}
