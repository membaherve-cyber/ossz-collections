import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { journalPosts } from "@/db/schema";
import { formatDate } from "@/lib/utils";
import { getLocale } from "@/lib/locale-server";
import { t, pick } from "@/lib/i18n-pages";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = (await db.select().from(journalPosts).where(eq(journalPosts.slug, slug)).limit(1))[0];
  return post ? { title: post.title, description: post.excerpt } : { title: "Journal" };
}

export default async function JournalPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = (await db.select().from(journalPosts).where(eq(journalPosts.slug, slug)).limit(1))[0];
  if (!post || post.status !== "published") notFound();
  const locale = await getLocale();
  const title = pick(locale, post.title, post.titleFr);
  const body = pick(locale, post.body, post.bodyFr);

  return (
    <article className="wrap max-w-3xl py-14">
      <Link href="/journal" className="text-xs text-muted link-underline">{t(locale, "jour.all")}</Link>
      <p className="eyebrow mt-6">{formatDate(post.publishedAt)} · {post.authorName}</p>
      <h1 className="display mt-2 text-4xl md:text-5xl">{title}</h1>
      <p className="mt-4 text-lg leading-relaxed text-ink-soft">{pick(locale, post.excerpt, post.excerptFr)}</p>
      {post.coverImage ? (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden bg-accent-soft">
          <Image src={post.coverImage} alt={title} fill priority sizes="100vw" quality={65} className="object-cover object-top" />
        </div>
      ) : null}
      <div className="prose-osz mt-10">
        {body.split("\n\n").map((para, index) => (
          <p key={index}>{para}</p>
        ))}
      </div>
    </article>
  );
}
