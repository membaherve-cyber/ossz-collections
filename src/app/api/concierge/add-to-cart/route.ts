import { NextRequest, NextResponse } from "next/server";
import { and, eq, asc } from "drizzle-orm";
import { db } from "@/db";
import { productVariants, products } from "@/db/schema";
import { addToCart } from "@/lib/actions";

export async function POST(request: NextRequest) {
  const body = (await request.json().catch(() => ({}))) as { slug?: string };
  const slug = typeof body.slug === "string" ? body.slug.trim() : "";
  if (!slug) {
    return NextResponse.json({ ok: false, message: "A product slug is required." }, { status: 400 });
  }

  const product = (
    await db.select().from(products).where(and(eq(products.isPublished, true), eq(products.slug, slug))).limit(1)
  )[0];
  if (!product) {
    return NextResponse.json({ ok: false, message: "That product is not in the catalogue." }, { status: 404 });
  }

  const variants = await db.select().from(productVariants).where(eq(productVariants.productId, product.id)).orderBy(asc(productVariants.id));
  const inStock = variants.find((v) => v.stockQty > 0);
  if (!inStock) {
    return NextResponse.json({ ok: false, message: "That piece is currently out of stock." }, { status: 409 });
  }

  const result = await addToCart(inStock.id, 1);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: 400 });
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    addedVariantId: inStock.id,
    productSlug: slug,
  });
}
