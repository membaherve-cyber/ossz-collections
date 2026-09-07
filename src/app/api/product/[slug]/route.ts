import { NextResponse } from "next/server";
import { asc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productImages, productVariants, products } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { normaliseLocale, pick } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/**
 * Feeds the Buy-now panel on demand. Keeping variant and stock data out of the
 * initial HTML removes a large serialised payload from every catalogue page,
 * and guarantees the panel always opens against live stock.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const locale = normaliseLocale(new URL(request.url).searchParams.get("locale"));

  const product = (
    await db.select().from(products).where(eq(products.slug, slug)).limit(1)
  )[0];
  if (!product) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const [variants, images, settings, user] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, product.id))
      .orderBy(asc(productVariants.id)),
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, product.id))
      .orderBy(asc(productImages.sortOrder)),
    getSettings(),
    getCurrentUser(),
  ]);

  return NextResponse.json({
    name: pick(locale, product.name, product.nameFr),
    slug: product.slug,
    description: pick(locale, product.description, product.descriptionFr),
    basePrice: product.basePrice,
    image: images[0]?.url ?? "",
    images: images.map((i) => ({ url: i.url, alt: i.altText })),
    codEnabled: settings.cod_enabled === "true",
    signedIn: Boolean(user),
    variants: variants.map((v) => ({
      id: v.id,
      size: v.size,
      colour: v.colour,
      stockQty: v.stockQty,
      price: v.priceOverride ?? product.basePrice,
    })),
  });
}
