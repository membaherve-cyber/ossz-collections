"use server";

import { eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { db } from "@/db";
import {
  appointments,
  auditLog,
  collections,
  coupons,
  deliveryZones,
  faqs,
  homeBlocks,
  journalPosts,
  lookbookItems,
  media,
  productImages,
  productVariants,
  products,
  orders,
  settings,
  users,
} from "@/db/schema";
import { canFulfilOrders, canManageCatalogue, getCurrentUser, hashPassword, isAdmin } from "@/lib/auth";
import { slugify } from "@/lib/utils";
import { notifyOrderStatus } from "@/lib/notify";
import type { ActionState } from "@/lib/actions";

async function requireRole(check: "catalogue" | "orders" | "admin") {
  const user = await getCurrentUser();
  if (!user) throw new Error("Not signed in");
  const allowed =
    check === "catalogue"
      ? canManageCatalogue(user.role)
      : check === "orders"
        ? canFulfilOrders(user.role)
        : isAdmin(user.role);
  if (!allowed) throw new Error("You do not have permission for this action");
  return user;
}

async function log(actorId: number, actorEmail: string, action: string, detail: string) {
  await db.insert(auditLog).values({ actorId, actorEmail, action, detail });
}

/* ---------------------------- Orders ------------------------------- */

export async function trackOrderAction(formData: FormData) {
  const user = await requireRole("orders");
  const orderNumber = String(formData.get("orderNumber") ?? "").trim().toUpperCase();
  const status = String(formData.get("status"));
  if (!orderNumber) return;
  const order = (
    await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1)
  )[0];
  if (!order) return;
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, order.id));
  await notifyOrderStatus(order.id, status);
  await log(user.id, user.email, "order.quickTrack", `${orderNumber} → ${status}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${order.id}`);
}

export async function updateOrderStatusAction(formData: FormData) {
  const user = await requireRole("orders");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  await db.update(orders).set({ status, updatedAt: new Date() }).where(eq(orders.id, id));
  await notifyOrderStatus(id, status);
  await log(user.id, user.email, "order.status", `Order ${id} → ${status}`);
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function updatePaymentStatusAction(formData: FormData) {
  const user = await requireRole("orders");
  const id = Number(formData.get("id"));
  const paymentStatus = String(formData.get("paymentStatus"));
  await db.update(orders).set({ paymentStatus, updatedAt: new Date() }).where(eq(orders.id, id));
  await log(user.id, user.email, "order.payment", `Order ${id} → ${paymentStatus}`);
  revalidatePath(`/admin/orders/${id}`);
}

/* --------------------------- Inventory ------------------------------ */

export async function updateStockAction(formData: FormData) {
  const user = await requireRole("orders");
  const id = Number(formData.get("variantId"));
  const stockQty = Math.max(0, Number(formData.get("stockQty") ?? 0));
  await db.update(productVariants).set({ stockQty }).where(eq(productVariants.id, id));
  await log(user.id, user.email, "stock.adjust", `Variant ${id} → ${stockQty}`);
  revalidatePath("/admin/inventory");
}

/* ---------------------------- Products ------------------------------ */

export async function saveProductAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("catalogue");
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Please give the piece a name." };

  const values = {
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: String(formData.get("description") ?? ""),
    details: String(formData.get("details") ?? ""),
    careInstructions: String(formData.get("careInstructions") ?? ""),
    basePrice: Number(formData.get("basePrice") ?? 0),
    categoryId: Number(formData.get("categoryId")) || null,
    collectionId: Number(formData.get("collectionId")) || null,
    isPublished: formData.get("isPublished") === "on",
    isFeatured: formData.get("isFeatured") === "on",
    seoTitle: String(formData.get("seoTitle") ?? ""),
    seoDescription: String(formData.get("seoDescription") ?? ""),
  };

  let productId = id;
  if (id) {
    await db.update(products).set(values).where(eq(products.id, id));
  } else {
    const inserted = await db.insert(products).values(values).returning();
    productId = inserted[0].id;
  }

  const photos = String(formData.get("photos") ?? "")
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
  if (photos.length) {
    await db.delete(productImages).where(eq(productImages.productId, productId));
    for (const [index, url] of photos.entries()) {
      await db.insert(productImages).values({ productId, url, altText: name, sortOrder: index });
    }
  }

  const sizes = String(formData.get("sizes") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  const colours = String(formData.get("colours") ?? "")
    .split(",").map((s) => s.trim()).filter(Boolean);
  if (sizes.length && colours.length) {
    const existing = await db.select().from(productVariants).where(eq(productVariants.productId, productId));
    for (const colour of colours) {
      for (const size of sizes) {
        const match = existing.find((v) => v.size === size && v.colour === colour);
        if (!match) {
          await db.insert(productVariants).values({
            productId,
            size,
            colour,
            sku: `${values.slug.slice(0, 8).toUpperCase()}-${size}-${colour.slice(0, 3).toUpperCase()}`,
            stockQty: Number(formData.get("initialStock") ?? 0),
          });
        }
      }
    }
  }

  await log(user.id, user.email, "product.save", `${values.name} (${productId})`);
  revalidateTag("catalogue", "max");
  revalidatePath("/admin/products");
  revalidatePath("/shop");
  revalidatePath(`/product/${values.slug}`);
  return { ok: true, message: `“${values.name}” saved and live on the site.` };
}

export async function deleteProductAction(formData: FormData) {
  const user = await requireRole("catalogue");
  const id = Number(formData.get("id"));
  await db.delete(products).where(eq(products.id, id));
  await log(user.id, user.email, "product.delete", `Product ${id}`);
  revalidatePath("/admin/products");
  revalidatePath("/shop");
}

/* -------------------------- Collections ----------------------------- */

export async function saveCollectionAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("catalogue");
  const id = Number(formData.get("id") ?? 0);
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { ok: false, message: "Please name the collection." };
  const values = {
    name,
    slug: String(formData.get("slug") || slugify(name)),
    description: String(formData.get("description") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    season: String(formData.get("season") ?? ""),
    isFeatured: formData.get("isFeatured") === "on",
    isPublished: formData.get("isPublished") === "on",
  };
  if (id) await db.update(collections).set(values).where(eq(collections.id, id));
  else await db.insert(collections).values(values);
  await log(user.id, user.email, "collection.save", name);
  revalidateTag("catalogue", "max");
  revalidatePath("/admin/collections");
  revalidatePath("/collections");
  return { ok: true, message: `“${name}” saved.` };
}

/* --------------------------- Journal -------------------------------- */

export async function saveJournalAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("catalogue");
  const id = Number(formData.get("id") ?? 0);
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return { ok: false, message: "Please give the entry a title." };
  const status = String(formData.get("status") ?? "draft");
  const values = {
    title,
    slug: String(formData.get("slug") || slugify(title)),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: String(formData.get("body") ?? ""),
    coverImage: String(formData.get("coverImage") ?? ""),
    authorName: String(formData.get("authorName") || "OSSZ Studio"),
    status,
    publishedAt: status === "published" ? new Date() : null,
  };
  if (id) await db.update(journalPosts).set(values).where(eq(journalPosts.id, id));
  else await db.insert(journalPosts).values(values);
  await log(user.id, user.email, "journal.save", title);
  revalidateTag("content", "max");
  revalidatePath("/admin/journal");
  revalidatePath("/journal");
  return { ok: true, message: status === "published" ? `“${title}” is live.` : `Draft “${title}” saved.` };
}

/* -------------------------- Home blocks ------------------------------ */

export async function saveHomeBlockAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("catalogue");
  const id = Number(formData.get("id") ?? 0);
  const values = {
    type: String(formData.get("type") ?? "banner"),
    eyebrow: String(formData.get("eyebrow") ?? ""),
    heading: String(formData.get("heading") ?? ""),
    body: String(formData.get("body") ?? ""),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    ctaLabel: String(formData.get("ctaLabel") ?? ""),
    ctaHref: String(formData.get("ctaHref") ?? "/shop"),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    isPublished: formData.get("isPublished") === "on",
  };
  if (id) await db.update(homeBlocks).set(values).where(eq(homeBlocks.id, id));
  else await db.insert(homeBlocks).values(values);
  await log(user.id, user.email, "home.block.save", values.heading);
  revalidatePath("/admin/homepage");
  revalidatePath("/");
  return { ok: true, message: "Homepage updated — view the live site to see it." };
}

export async function deleteHomeBlockAction(formData: FormData) {
  await requireRole("catalogue");
  await db.delete(homeBlocks).where(eq(homeBlocks.id, Number(formData.get("id"))));
  revalidatePath("/admin/homepage");
  revalidatePath("/");
}

/* ---------------------------- Lookbook ------------------------------- */

export async function saveLookAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("catalogue");
  const imageUrl = String(formData.get("imageUrl") ?? "").trim();
  if (!imageUrl) return { ok: false, message: "A photo or video is required." };
  const mediaType = String(formData.get("mediaType") ?? "image") === "video" ? "video" : "image";
  await db.insert(lookbookItems).values({
    title: String(formData.get("title") ?? ""),
    caption: String(formData.get("caption") ?? ""),
    imageUrl,
    mediaType,
    videoUrl: mediaType === "video" ? String(formData.get("videoUrl") ?? imageUrl) : null,
    posterUrl: mediaType === "video" ? String(formData.get("posterUrl") ?? "") || null : null,
    durationSeconds: mediaType === "video" ? Number(formData.get("durationSeconds")) || null : null,
    productSlug: String(formData.get("productSlug") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  });
  revalidatePath("/admin/lookbook");
  revalidatePath("/lookbook");
  return { ok: true, message: mediaType === "video" ? "Video added to the lookbook." : "Look added to the lookbook." };
}

export async function deleteLookAction(formData: FormData) {
  await requireRole("catalogue");
  await db.delete(lookbookItems).where(eq(lookbookItems.id, Number(formData.get("id"))));
  revalidatePath("/admin/lookbook");
  revalidatePath("/lookbook");
}

/* ----------------------------- Media --------------------------------- */

export async function addMediaAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("catalogue");
  const url = String(formData.get("url") ?? "").trim();
  if (!url.startsWith("http")) return { ok: false, message: "Please paste a full image link (https://…)." };
  await db.insert(media).values({
    url,
    altText: String(formData.get("altText") ?? ""),
    tags: String(formData.get("tags") ?? ""),
    uploadedBy: user.id,
  });
  revalidatePath("/admin/media");
  return { ok: true, message: "Photo added to the media library." };
}

export async function deleteMediaAction(formData: FormData) {
  await requireRole("catalogue");
  await db.delete(media).where(eq(media.id, Number(formData.get("id"))));
  revalidatePath("/admin/media");
}

/* ---------------------------- Coupons -------------------------------- */

export async function saveCouponAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("admin");
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  if (!code) return { ok: false, message: "A code is required." };
  const expires = String(formData.get("expiresAt") ?? "");
  await db
    .insert(coupons)
    .values({
      code,
      type: String(formData.get("type") ?? "percentage"),
      value: Number(formData.get("value") ?? 0),
      usageLimit: Number(formData.get("usageLimit") ?? 0),
      expiresAt: expires ? new Date(expires) : null,
      isActive: true,
    })
    .onConflictDoUpdate({
      target: coupons.code,
      set: {
        type: String(formData.get("type") ?? "percentage"),
        value: Number(formData.get("value") ?? 0),
        usageLimit: Number(formData.get("usageLimit") ?? 0),
        expiresAt: expires ? new Date(expires) : null,
      },
    });
  await log(user.id, user.email, "coupon.save", code);
  revalidatePath("/admin/coupons");
  return { ok: true, message: `Code ${code} saved.` };
}

export async function toggleCouponAction(formData: FormData) {
  await requireRole("admin");
  const id = Number(formData.get("id"));
  const active = formData.get("isActive") === "true";
  await db.update(coupons).set({ isActive: !active }).where(eq(coupons.id, id));
  revalidatePath("/admin/coupons");
}

/* --------------------------- Appointments ---------------------------- */

export async function setAppointmentStatusAction(formData: FormData) {
  const user = await requireRole("orders");
  const id = Number(formData.get("id"));
  const status = String(formData.get("status"));
  await db.update(appointments).set({ status }).where(eq(appointments.id, id));
  await log(user.id, user.email, "appointment.status", `Appointment ${id} → ${status}`);
  revalidatePath("/admin/appointments");
}

/* ----------------------------- Settings ------------------------------ */

export async function saveSettingsAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("admin");
  const keys = [
    "whatsapp_number",
    "store_address",
    "business_hours",
    "concierge_greeting",
    "contact_email",
    "free_delivery_threshold",
  ];
  for (const key of keys) {
    const value = String(formData.get(key) ?? "");
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  for (const key of ["cod_enabled", "mobile_money_enabled", "card_enabled"]) {
    const value = formData.get(key) === "on" ? "true" : "false";
    await db
      .insert(settings)
      .values({ key, value })
      .onConflictDoUpdate({ target: settings.key, set: { value } });
  }
  await log(user.id, user.email, "settings.save", "Business settings updated");
  revalidateTag("settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/");
  return { ok: true, message: "Settings saved across the site." };
}

export async function saveZoneAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const id = Number(formData.get("id") ?? 0);
  const values = {
    name: String(formData.get("name") ?? ""),
    method: String(formData.get("method") ?? "douala_local"),
    fee: Number(formData.get("fee") ?? 0),
    etaLabel: String(formData.get("etaLabel") ?? ""),
    isActive: true,
  };
  if (!values.name) return { ok: false, message: "Please name the zone." };
  if (id) await db.update(deliveryZones).set(values).where(eq(deliveryZones.id, id));
  else await db.insert(deliveryZones).values(values);
  revalidateTag("settings", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/checkout");
  return { ok: true, message: "Delivery zone saved." };
}

export async function saveFaqAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  await requireRole("admin");
  const question = String(formData.get("question") ?? "").trim();
  if (!question) return { ok: false, message: "A question is required." };
  await db.insert(faqs).values({
    category: String(formData.get("category") ?? "General"),
    question,
    answer: String(formData.get("answer") ?? ""),
    sortOrder: Number(formData.get("sortOrder") ?? 99),
  });
  revalidateTag("content", "max");
  revalidatePath("/admin/settings");
  revalidatePath("/faq");
  return { ok: true, message: "FAQ entry added — the concierge can now use it." };
}

/* ------------------------------ Staff -------------------------------- */

export async function saveStaffAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const user = await requireRole("admin");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const role = String(formData.get("role") ?? "staff");
  const fullName = String(formData.get("fullName") ?? "");
  const password = String(formData.get("password") ?? "");
  if (!email) return { ok: false, message: "An email is required." };

  const existing = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (existing) {
    await db.update(users).set({ role, fullName: fullName || existing.fullName }).where(eq(users.id, existing.id));
  } else {
    if (password.length < 6) return { ok: false, message: "New accounts need a password of 6+ characters." };
    await db.insert(users).values({ email, fullName, role, passwordHash: hashPassword(password) });
  }
  await log(user.id, user.email, "staff.save", `${email} → ${role}`);
  revalidatePath("/admin/staff");
  return { ok: true, message: `${email} is now a ${role}.` };
}
