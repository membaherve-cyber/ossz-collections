import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Journal" };

export default async function JournalPage() {
  const [posts, locale] = await Promise.all([
    db.select().from(journalPosts).where(eq(journalPosts.status, "published")).orderBy(desc(journalPosts.publishedAt)),
    getLocale(),
  ]);
  return (
    <div className="wrap py-14">
      <header className="max-w-2xl">
        <p className="eyebrow">{t(locale, "nav.journal")}</p>
        <h1 className="display mt-2 text-4xl md:text-5xl">{t(locale, "jour.title")}</h1>
      </header>
      <div className="mt-12 grid gap-10 md:grid-cols-3">
        {posts.map((post) => (
          <article key={post.id}>
            <Link href={`/journal/${post.slug}`} className="group block zoom-parent">
              <div className="relative flex aspect-[4/3] items-center justify-center overflow-hidden bg-accent-soft">
                {post.coverImage ? (
                  <Image src={post.coverImage} alt={post.title} fill sizes="33vw" quality={65} className="object-cover object-top" />
                ) : (
                  <span className="display text-3xl tracking-[0.22em] uppercase text-ink/25">
                    OSSZ
                  </span>
                )}
              </div>
              <p className="mt-3 text-xs text-muted">{formatDate(post.publishedAt)} · {post.authorName}</p>
              <h2 className="display mt-1 text-2xl leading-tight">{pick(locale, post.title, post.titleFr)}</h2>
              <p className="mt-2 text-sm leading-relaxed text-ink-soft">{pick(locale, post.excerpt, post.excerptFr)}</p>
            </Link>
          </article>
        ))}
      </div>
    </div>
  );
}
