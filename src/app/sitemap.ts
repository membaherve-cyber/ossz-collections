import type { MetadataRoute } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { collections, journalPosts, products } from "@/db/schema";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://osszcollections.cm";
  const [productRows, collectionRows, posts] = await Promise.all([
    db.select({ slug: products.slug }).from(products).where(eq(products.isPublished, true)),
    db.select({ slug: collections.slug }).from(collections).where(eq(collections.isPublished, true)),
    db.select({ slug: journalPosts.slug }).from(journalPosts).where(eq(journalPosts.status, "published")),
  ]);

  const staticPaths = ["", "/shop", "/collections", "/lookbook", "/about", "/journal", "/appointments", "/faq", "/contact", "/search"];

  return [
    ...staticPaths.map((path) => ({ url: `${base}${path}`, lastModified: new Date() })),
    ...productRows.map((p) => ({ url: `${base}/product/${p.slug}`, lastModified: new Date() })),
    ...collectionRows.map((c) => ({ url: `${base}/collections/${c.slug}`, lastModified: new Date() })),
    ...posts.map((p) => ({ url: `${base}/journal/${p.slug}`, lastModified: new Date() })),
  ];
}
