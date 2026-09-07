"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "@/db";
import {
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  carts,
  cartItems,
  coupons,
} from "@/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { getCart, getSettings, listDeliveryZones } from "@/lib/store";
import { getCurrentUser } from "@/lib/auth";
import { makeOrderNumber } from "@/lib/utils";
import { notifyOrderPlaced } from "@/lib/notify";
import { computeDiscount, getCoupon } from "@/lib/store";
import { cookies } from "next/headers";

export type ActionState = { ok: boolean; message: string; redirectTo?: string };

const PENDING_ORDER_COOKIE = "ossz_pending_order";

export interface PendingOrderData {
  orderNumber: string;
  email: string;
  phone: string;
  customerName: string;
  deliveryMethod: string;
  zoneId: number;
  paymentMethod: string;
  city: string;
  area: string;
  street: string;
  notes: string;
  createAccount: boolean;
  password: string;
  subtotal: number;
  discount: number;
  deliveryFee: number;
  total: number;
  couponCode: string;
}

/**
 * Step 1: Save checkout data as a pending order in a cookie.
 * This is called when the user clicks "Place Order" in the checkout form.
 * It does NOT create the order yet — that happens after proof of payment is uploaded.
 */
export async function createPendingOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const cart = await getCart();
  if (!cart.id || cart.lines.length === 0) {
    return { ok: false, message: "Your cart is empty." };
  }

  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const phone = String(formData.get("phone") ?? "").trim();
  const customerName = String(formData.get("customerName") ?? "").trim();
  const deliveryMethod = String(formData.get("deliveryMethod") ?? "national");
  const zoneId = Number(formData.get("zoneId") ?? 0);
  const paymentMethod = String(formData.get("paymentMethod") ?? "mobile_money_mtn");
  const createAccount = formData.get("createAccount") === "on";
  const password = String(formData.get("password") ?? "");

  if (!customerName) {
    return { ok: false, message: "Please provide your name." };
  }
  if (!email && !phone) {
    return { ok: false, message: "Please provide either an email address or a phone number so we can reach you." };
  }

  const zones = await listDeliveryZones();
  const zone = zones.find((z) => z.id === zoneId) ?? zones.find((z) => z.method === deliveryMethod);
  let deliveryFee = deliveryMethod === "pickup" ? 0 : (zone?.fee ?? 6500);

  const subtotal = cart.subtotal;
  let discount = cart.couponCode ? await computeDiscount(cart.couponCode, subtotal) : 0;
  if (cart.couponCode) {
    const coupon = await getCoupon(cart.couponCode);
    if (coupon?.type === "free_delivery") {
      deliveryFee = 0;
    }
  }
  if (discount > subtotal) discount = subtotal;
  const total = subtotal - discount + deliveryFee;

  const orderNumber = makeOrderNumber();

  const pendingData: PendingOrderData = {
    orderNumber,
    email,
    phone,
    customerName,
    deliveryMethod,
    zoneId,
    paymentMethod,
    city: String(formData.get("city") ?? "Douala"),
    area: String(formData.get("area") ?? ""),
    street: String(formData.get("street") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    createAccount,
    password,
    subtotal,
    discount,
    deliveryFee,
    total,
    couponCode: cart.couponCode ?? "",
  };

  const cookieStore = await cookies();
  cookieStore.set(PENDING_ORDER_COOKIE, JSON.stringify(pendingData), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 30, // 30 minutes
    path: "/",
  });

  redirect(`/checkout/payment-proof?method=${encodeURIComponent(paymentMethod)}&total=${total}&order=${encodeURIComponent(orderNumber)}`);
}

/**
 * Step 2: Finalize the order after the user has uploaded proof of payment.
 * This reads the pending order from the cookie, creates the real order, and clears the cart.
 */
export async function finalizeOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const proofUrl = String(formData.get("proofUrl") ?? "");
  if (!proofUrl) {
    return { ok: false, message: "Please upload a proof of payment before confirming." };
  }

  const cookieStore = await cookies();
  const raw = cookieStore.get(PENDING_ORDER_COOKIE)?.value;
  if (!raw) {
    return { ok: false, message: "Your checkout session has expired. Please go back to the cart and try again." };
  }

  let pending: PendingOrderData;
  try {
    pending = JSON.parse(raw);
  } catch {
    return { ok: false, message: "Could not read your checkout data. Please start again." };
  }

  const user = await getCurrentUser();
  const cart = await getCart();
  if (!cart.id || cart.lines.length === 0) {
    cookieStore.delete(PENDING_ORDER_COOKIE);
    return { ok: false, message: "Your cart is empty." };
  }

  const zones = await listDeliveryZones();
  const zone = zones.find((z) => z.id === pending.zoneId) ?? zones.find((z) => z.method === pending.deliveryMethod);

  let userId = user?.id ?? null;
  if (!user && pending.createAccount && pending.password.length >= 6) {
    const { hashPassword, createSession } = await import("@/lib/auth");
    const exists = (await db.select().from((await import("@/db/schema")).users).where(
      eq((await import("@/db/schema")).users.email, pending.email)
    ).limit(1))[0];
    if (!exists) {
      const { users } = await import("@/db/schema");
      const created = await db
        .insert(users)
        .values({
          email: pending.email,
          phone: pending.phone,
          fullName: pending.customerName,
          passwordHash: hashPassword(pending.password),
          role: "customer",
        })
        .returning();
      userId = created[0].id;
      await createSession(created[0].id);
    }
  }

  const shipping = {
    fullName: pending.customerName,
    phone: pending.phone,
    city: pending.city,
    area: pending.area,
    street: pending.street,
    notes: pending.notes,
    zone: zone?.name ?? "In-store pickup",
  };

  const inserted = await db
    .insert(orders)
    .values({
      orderNumber: pending.orderNumber,
      userId,
      guestEmail: pending.email,
      guestPhone: pending.phone,
      customerName: pending.customerName,
      status: "placed",
      subtotal: pending.subtotal,
      discount: pending.discount,
      deliveryFee: pending.deliveryFee,
      total: pending.total,
      couponCode: pending.couponCode,
      paymentMethod: pending.paymentMethod,
      paymentStatus: "pending", // awaiting manual verification
      deliveryMethod: pending.deliveryMethod,
      deliveryZone: zone?.name ?? "In-store pickup",
      shippingSnapshot: shipping,
      paymentProofUrl: proofUrl,
    })
    .returning();

  const order = inserted[0];

  for (const line of cart.lines) {
    await db.insert(orderItems).values({
      orderId: order.id,
      variantId: line.variantId,
      productName: line.name,
      productSlug: line.slug,
      variantLabel: `${line.size} · ${line.colour}`,
      imageUrl: line.image,
      quantity: line.quantity,
      unitPrice: line.unitPrice,
    });
    await db
      .update(productVariants)
      .set({ stockQty: sql`greatest(${productVariants.stockQty} - ${line.quantity}, 0)` })
      .where(eq(productVariants.id, line.variantId));
    await db
      .update(products)
      .set({ popularity: sql`${products.popularity} + ${line.quantity}` })
      .where(eq(products.id, line.productId));
  }

  if (pending.couponCode) {
    const coupon = await getCoupon(pending.couponCode);
    if (coupon) {
      await db
        .update(coupons)
        .set({ timesUsed: coupon.timesUsed + 1 })
        .where(eq(coupons.id, coupon.id));
    }
  }

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db.update(carts).set({ couponCode: null }).where(eq(carts.id, cart.id));

  await notifyOrderPlaced(order.id);

  cookieStore.delete(PENDING_ORDER_COOKIE);

  revalidatePath("/cart");
  revalidatePath("/checkout");
  redirect(`/order/${pending.orderNumber}?email=${encodeURIComponent(pending.email)}`);
}
