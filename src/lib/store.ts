import { cache } from "react";
import { unstable_cache } from "next/cache";
import { and, asc, desc, eq, gte, ilike, inArray, lte, or, sql } from "drizzle-orm";
import { db } from "@/db";
import {
  cartItems,
  carts,
  categories,
  collections,
  coupons,
  deliveryZones,
  faqs,
  productImages,
  productVariants,
  products,
  settings,
} from "@/db/schema";
import { getCurrentUser, getGuestId, peekGuestId } from "@/lib/auth";
import { pick, type Locale } from "@/lib/i18n";

export type VariantRow = typeof productVariants.$inferSelect;

export type CardVariant = {
  id: number;
  size: string;
  colour: string;
  stockQty: number;
  price: number;
};

export type ProductCardData = {
  id: number;
  name: string;
  slug: string;
  basePrice: number;
  image: string;
  imageAlt: string;
  collectionName: string | null;
  categoryName: string | null;
  colours: string[];
  sizes: string[];
  inStock: boolean;
  /** Powers the Buy-now quick purchase panel without a second round-trip. */
  variants: CardVariant[];
  description: string;
};

export type ProductFilters = {
  locale?: Locale;
  category?: string;
  collection?: string;
  size?: string;
  colour?: string;
  minPrice?: number;
  maxPrice?: number;
  availability?: string;
  sort?: string;
  q?: string;
  featured?: boolean;
  limit?: number;
  ids?: number[];
  /** internal: prevents retry loops after the production auto-seed attempt */
  _bootstrapped?: boolean;
};

export async function listProducts(filters: ProductFilters = {}): Promise<ProductCardData[]> {
  const conditions = [eq(products.isPublished, true)];

  if (filters.category) {
    conditions.push(eq(categories.slug, filters.category));
  }
  if (filters.collection) {
    conditions.push(eq(collections.slug, filters.collection));
  }
  if (filters.featured) {
    conditions.push(eq(products.isFeatured, true));
  }
  if (filters.ids) {
    if (filters.ids.length === 0) return [];
    conditions.push(inArray(products.id, filters.ids));
  }
  if (typeof filters.minPrice === "number") {
    conditions.push(gte(products.basePrice, filters.minPrice));
  }
  if (typeof filters.maxPrice === "number") {
    conditions.push(lte(products.basePrice, filters.maxPrice));
  }
  if (filters.q) {
    const STOP = new Set([
      "show","me","the","a","an","in","for","with","and","or","of","do","you","have","any",
      "some","please","looking","look","want","need","find","your","this","that","is","are",
      "what","which","can","i","my","to","dress","piece","pieces","something",
    ]);
    const tokens = filters.q
      .toLowerCase()
      .split(/[^a-z0-9]+/i)
      .filter((token) => token.length > 2 && !STOP.has(token))
      .slice(0, 5);
    const terms = tokens.length ? tokens : [filters.q];
    const clauses = terms.flatMap((token) => {
      const term = `%${token}%`;
      return [
        ilike(products.name, term),
        ilike(products.description, term),
        ilike(products.details, term),
        ilike(products.careInstructions, term),
      ];
    });
    const search = or(...clauses);
    if (search) conditions.push(search);
  }

  const orderBy =
    filters.sort === "price_asc"
      ? asc(products.basePrice)
      : filters.sort === "price_desc"
        ? desc(products.basePrice)
        : filters.sort === "popular"
          ? desc(products.popularity)
          : desc(products.createdAt);

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      basePrice: products.basePrice,
      description: products.description,
      nameFr: products.nameFr,
      descriptionFr: products.descriptionFr,
      collectionName: collections.name,
      collectionNameFr: collections.nameFr,
      categoryName: categories.name,
      categoryNameFr: categories.nameFr,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(and(...conditions))
    .orderBy(orderBy)
    .limit(filters.limit ?? 120);

  if (rows.length === 0) {
    // Radical production safeguard: if the deployed DB is empty, the public
    // shop should not stay empty. Attempt one synchronous self-setup, then
    // re-run the query. If this was just a real "no matches" filter/search, the
    // products table count will be > 0 and we simply return an empty result.
    if (!filters._bootstrapped) {
      const [{ n }] = await db.select({ n: sql<number>`count(*)` }).from(products);
      if (Number(n) === 0) {
        const { bootstrap } = await import("@/lib/bootstrap");
        await bootstrap();
        return listProducts({ ...filters, _bootstrapped: true });
      }
    }
    return [];
  }

  const ids = rows.map((r) => r.id);
  const [images, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(inArray(productImages.productId, ids))
      .orderBy(asc(productImages.sortOrder)),
    db.select().from(productVariants).where(inArray(productVariants.productId, ids)),
  ]);

  const loc = filters.locale ?? "en";
  const cards = rows.map((row) => {
    const img = images.find((i) => i.productId === row.id);
    const vs = variants.filter((v) => v.productId === row.id);
    return {
      id: row.id,
      name: pick(loc, row.name, row.nameFr),
      slug: row.slug,
      basePrice: row.basePrice,
      image: img?.url ?? "",
      imageAlt: img?.altText ?? row.name,
      collectionName: row.collectionName ? pick(loc, row.collectionName, row.collectionNameFr) : null,
      categoryName: row.categoryName ? pick(loc, row.categoryName, row.categoryNameFr) : null,
      colours: Array.from(new Set(vs.map((v) => v.colour))),
      sizes: Array.from(new Set(vs.map((v) => v.size))),
      inStock: vs.some((v) => v.stockQty > 0),
      description: pick(loc, row.description, row.descriptionFr),
      variants: vs.map((v) => ({
        id: v.id,
        size: v.size,
        colour: v.colour,
        stockQty: v.stockQty,
        price: v.priceOverride ?? row.basePrice,
      })),
    } satisfies ProductCardData;
  });

  return cards.filter((card) => {
    if (filters.size && !card.sizes.includes(filters.size)) return false;
    if (filters.colour && !card.colours.includes(filters.colour)) return false;
    if (filters.availability === "in_stock" && !card.inStock) return false;
    if (filters.availability === "out_of_stock" && card.inStock) return false;
    return true;
  });
}

export async function getProductBySlug(slug: string) {
  const rows = await db
    .select({
      product: products,
      collectionName: collections.name,
      collectionNameFr: collections.nameFr,
      collectionSlug: collections.slug,
      categoryName: categories.name,
      categoryNameFr: categories.nameFr,
      categorySlug: categories.slug,
    })
    .from(products)
    .leftJoin(collections, eq(products.collectionId, collections.id))
    .leftJoin(categories, eq(products.categoryId, categories.id))
    .where(eq(products.slug, slug))
    .limit(1);

  const row = rows[0];
  if (!row) return null;

  const [images, variants] = await Promise.all([
    db
      .select()
      .from(productImages)
      .where(eq(productImages.productId, row.product.id))
      .orderBy(asc(productImages.sortOrder)),
    db
      .select()
      .from(productVariants)
      .where(eq(productVariants.productId, row.product.id))
      .orderBy(asc(productVariants.id)),
  ]);

  return { ...row, images, variants };
}

export const listFilterFacets = unstable_cache(
  async () => {
  const [cats, cols, variants, priceRow] = await Promise.all([
    db.select().from(categories).orderBy(asc(categories.sortOrder)),
    db.select().from(collections).where(eq(collections.isPublished, true)),
    db.select({ size: productVariants.size, colour: productVariants.colour }).from(productVariants),
    db
      .select({ min: sql<number>`coalesce(min(${products.basePrice}), 0)`, max: sql<number>`coalesce(max(${products.basePrice}), 0)` })
      .from(products),
  ]);

  return {
    categories: cats,
    collections: cols,
    sizes: Array.from(new Set(variants.map((v) => v.size))).sort(),
    colours: Array.from(new Set(variants.map((v) => v.colour))).sort(),
    minPrice: Number(priceRow[0]?.min ?? 0),
    maxPrice: Number(priceRow[0]?.max ?? 0),
  };
  },
  ["ossz-facets"],
  { tags: ["catalogue"] },
);

/* ------------------------------------------------------------------ */
/* Cart                                                                */
/* ------------------------------------------------------------------ */

export type CartLine = {
  itemId: number;
  variantId: number;
  productId: number;
  name: string;
  slug: string;
  size: string;
  colour: string;
  unitPrice: number;
  quantity: number;
  stockQty: number;
  image: string;
};

export type CartView = {
  id: number | null;
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  couponCode: string | null;
  discount: number;
};

async function findCartId(create: boolean): Promise<number | null> {
  const user = await getCurrentUser();
  if (user) {
    const existing = await db.select().from(carts).where(eq(carts.userId, user.id)).limit(1);
    if (existing[0]) return existing[0].id;
    if (!create) return null;
    const inserted = await db.insert(carts).values({ userId: user.id }).returning();
    return inserted[0].id;
  }
  const guestId = create ? await getGuestId() : await peekGuestId();
  if (!guestId) return null;
  const existing = await db.select().from(carts).where(eq(carts.sessionId, guestId)).limit(1);
  if (existing[0]) return existing[0].id;
  if (!create) return null;
  const inserted = await db.insert(carts).values({ sessionId: guestId }).returning();
  return inserted[0].id;
}

export async function getOrCreateCartId(): Promise<number> {
  const id = await findCartId(true);
  return id as number;
}

/** Read by the header on every page and again by cart/checkout — memoised per request. */
export const getCart = cache(async (): Promise<CartView> => {
  const cartId = await findCartId(false);
  if (!cartId) {
    return { id: null, lines: [], subtotal: 0, itemCount: 0, couponCode: null, discount: 0 };
  }
  const cartRow = (await db.select().from(carts).where(eq(carts.id, cartId)).limit(1))[0];
  const rows = await db
    .select({
      itemId: cartItems.id,
      quantity: cartItems.quantity,
      variant: productVariants,
      product: products,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(cartItems.variantId, productVariants.id))
    .innerJoin(products, eq(productVariants.productId, products.id))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.id));

  const productIds = rows.map((r) => r.product.id);
  const images = productIds.length
    ? await db
        .select()
        .from(productImages)
        .where(inArray(productImages.productId, productIds))
        .orderBy(asc(productImages.sortOrder))
    : [];

  const lines: CartLine[] = rows.map((r) => ({
    itemId: r.itemId,
    variantId: r.variant.id,
    productId: r.product.id,
    name: r.product.name,
    slug: r.product.slug,
    size: r.variant.size,
    colour: r.variant.colour,
    unitPrice: r.variant.priceOverride ?? r.product.basePrice,
    quantity: r.quantity,
    stockQty: r.variant.stockQty,
    image: images.find((i) => i.productId === r.product.id)?.url ?? "",
  }));

  const subtotal = lines.reduce((sum, l) => sum + l.unitPrice * l.quantity, 0);
  const couponCode = cartRow?.couponCode ?? null;
  const discount = couponCode ? await computeDiscount(couponCode, subtotal) : 0;

  return {
    id: cartId,
    lines,
    subtotal,
    itemCount: lines.reduce((sum, l) => sum + l.quantity, 0),
    couponCode,
    discount,
  };
});

export async function computeDiscount(code: string, subtotal: number): Promise<number> {
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  const coupon = rows[0];
  if (!coupon || !coupon.isActive) return 0;
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) return 0;
  if (coupon.usageLimit > 0 && coupon.timesUsed >= coupon.usageLimit) return 0;
  if (coupon.type === "percentage") return Math.round((subtotal * coupon.value) / 100);
  if (coupon.type === "fixed") return Math.min(coupon.value, subtotal);
  return 0; // free_delivery is applied against the delivery fee
}

export async function getCoupon(code: string) {
  const rows = await db.select().from(coupons).where(eq(coupons.code, code.toUpperCase())).limit(1);
  return rows[0] ?? null;
}

/* ------------------------------------------------------------------ */
/* Settings, zones, faqs                                               */
/* ------------------------------------------------------------------ */

export const SETTING_DEFAULTS: Record<string, string> = {
  whatsapp_number: "+237694068219",
  store_address: "Ange Raphael, Douala, Cameroon",
  business_hours: "Monday to Friday, 9:00am - 6pm. Saturday 9:00am - 1pm",
  concierge_greeting:
    "Good day, and welcome to OSSZ Collections. I am the OSSZ Concierge — how may I assist you today?",
  contact_email: "info@osszcollection.com",
  cod_enabled: "false",
  mobile_money_enabled: "true",
  card_enabled: "true",
  free_delivery_threshold: "150000",
};

/**
 * These three are read by the footer, the concierge mount and often the page
 * itself on a single render. `cache()` collapses them to one query per request.
 */
const loadSettings = unstable_cache(
  async () => db.select().from(settings),
  ["ossz-settings"],
  { tags: ["settings"] },
);

export const getSettings = cache(async (): Promise<Record<string, string>> => {
  const rows = await loadSettings();
  const map: Record<string, string> = { ...SETTING_DEFAULTS };
  for (const row of rows) map[row.key] = row.value;
  return map;
});

export const listDeliveryZones = cache(
  unstable_cache(
    async () =>
      db.select().from(deliveryZones).where(eq(deliveryZones.isActive, true)).orderBy(asc(deliveryZones.fee)),
    ["ossz-zones"],
    { tags: ["settings"] },
  ),
);

export const listFaqs = cache(
  unstable_cache(async () => db.select().from(faqs).orderBy(asc(faqs.sortOrder)), ["ossz-faqs"], {
    tags: ["content"],
  }),
);
