"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { randomBytes } from "node:crypto";
import { db } from "@/db";
import {
  addresses,
  appointments,
  cartItems,
  carts,
  contactMessages,
  newsletterSignups,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  users,
  wishlists,
  passwordResets,
  coupons,
} from "@/db/schema";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  peekGuestId,
  verifyPassword,
} from "@/lib/auth";
import {
  computeDiscount,
  getCart,
  getCoupon,
  getOrCreateCartId,
  listDeliveryZones,
} from "@/lib/store";
import { makeOrderNumber, makeReference } from "@/lib/utils";
import { notifyAppointment, notifyOrderPlaced, sendEmail } from "@/lib/notify";

export type ActionState = { ok: boolean; message: string; redirectTo?: string };

/* ------------------------------- Cart ------------------------------ */

export async function addToCart(variantId: number, quantity = 1) {
  const cartId = await getOrCreateCartId();
  const existing = await db
    .select()
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)))
    .limit(1);

  if (existing[0]) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + quantity })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db.insert(cartItems).values({ cartId, variantId, quantity });
  }
  revalidatePath("/cart");
  revalidatePath("/");
  return { ok: true, message: "Added to your cart." };
}

export async function updateCartLine(itemId: number, quantity: number) {
  if (quantity <= 0) {
    await db.delete(cartItems).where(eq(cartItems.id, itemId));
  } else {
    await db.update(cartItems).set({ quantity }).where(eq(cartItems.id, itemId));
  }
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, message: "Cart updated." };
}

export async function removeCartLine(itemId: number) {
  await db.delete(cartItems).where(eq(cartItems.id, itemId));
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, message: "Item removed." };
}

export async function applyCoupon(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const cartId = await getOrCreateCartId();
  if (!code) {
    await db.update(carts).set({ couponCode: null }).where(eq(carts.id, cartId));
    revalidatePath("/cart");
    return { ok: true, message: "Coupon removed." };
  }
  const coupon = await getCoupon(code);
  if (!coupon || !coupon.isActive) {
    return { ok: false, message: "That code is not recognised." };
  }
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    return { ok: false, message: "That code has expired." };
  }
  await db.update(carts).set({ couponCode: code }).where(eq(carts.id, cartId));
  revalidatePath("/cart");
  revalidatePath("/checkout");
  return { ok: true, message: `Code ${code} applied.` };
}

/* ------------------------------ Auth ------------------------------- */

async function mergeGuestCart(userId: number) {
  const guestId = await peekGuestId();
  if (!guestId) return;
  const guestCart = (await db.select().from(carts).where(eq(carts.sessionId, guestId)).limit(1))[0];
  if (!guestCart) return;
  const userCart = (await db.select().from(carts).where(eq(carts.userId, userId)).limit(1))[0];
  if (!userCart) {
    await db.update(carts).set({ userId, sessionId: null }).where(eq(carts.id, guestCart.id));
    return;
  }
  const guestLines = await db.select().from(cartItems).where(eq(cartItems.cartId, guestCart.id));
  for (const line of guestLines) {
    const match = (
      await db
        .select()
        .from(cartItems)
        .where(and(eq(cartItems.cartId, userCart.id), eq(cartItems.variantId, line.variantId)))
        .limit(1)
    )[0];
    if (match) {
      await db
        .update(cartItems)
        .set({ quantity: match.quantity + line.quantity })
        .where(eq(cartItems.id, match.id));
    } else {
      await db
        .insert(cartItems)
        .values({ cartId: userCart.id, variantId: line.variantId, quantity: line.quantity });
    }
  }
  await db.delete(carts).where(eq(carts.id, guestCart.id));
}


/**
 * Staff sign in with a short username, customers with their email address.
 * Both arrive in the same field, so resolve whichever matches.
 */
async function findUserByIdentifier(identifier: string) {
  const id = identifier.trim().toLowerCase();
  if (!id) return null;
  const byUsername = (
    await db.select().from(users).where(eq(users.username, id)).limit(1)
  )[0];
  if (byUsername) return byUsername;
  return (await db.select().from(users).where(eq(users.email, id)).limit(1))[0] ?? null;
}

export async function registerAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const next = String(formData.get("next") ?? "/account");

  if (!email || !password || password.length < 6) {
    return { ok: false, message: "Please enter an email and a password of at least 6 characters." };
  }
  const existing = await db.select().from(users).where(eq(users.email, email)).limit(1);
  if (existing[0]) {
    return { ok: false, message: "An account with that email already exists. Please sign in." };
  }
  const inserted = await db
    .insert(users)
    .values({ email, phone, fullName, passwordHash: hashPassword(password), role: "customer" })
    .returning();
  await mergeGuestCart(inserted[0].id);
  await createSession(inserted[0].id);
  redirect(next);
}

export async function loginAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const identifier = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "");
  const user = await findUserByIdentifier(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, message: "Those details did not match our records." };
  }
  await mergeGuestCart(user.id);
  await createSession(user.id);
  const target =
    next || (user.role === "customer" ? "/account" : "/admin");
  redirect(target);
}

export async function logoutAction() {
  await destroySession();
  redirect("/");
}

export async function updateProfileAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in." };
  const fullName = String(formData.get("fullName") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const patch: Record<string, string> = { fullName, phone };
  if (password) {
    if (password.length < 6) return { ok: false, message: "Password must be at least 6 characters." };
    patch.passwordHash = hashPassword(password);
  }
  await db.update(users).set(patch).where(eq(users.id, user.id));
  revalidatePath("/account/profile");
  return { ok: true, message: "Your details have been saved." };
}

/* ---------------------------- Addresses ---------------------------- */

export async function saveAddressAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in." };
  const id = Number(formData.get("id") ?? 0);
  const values = {
    userId: user.id,
    label: String(formData.get("label") ?? "Home"),
    fullName: String(formData.get("fullName") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    city: String(formData.get("city") ?? "Douala"),
    area: String(formData.get("area") ?? ""),
    street: String(formData.get("street") ?? ""),
    notes: String(formData.get("notes") ?? ""),
  };
  if (!values.fullName || !values.phone) {
    return { ok: false, message: "A name and phone number are required." };
  }
  if (id) {
    await db.update(addresses).set(values).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  } else {
    await db.insert(addresses).values(values);
  }
  revalidatePath("/account/addresses");
  return { ok: true, message: "Address saved." };
}

export async function deleteAddressAction(formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return;
  const id = Number(formData.get("id") ?? 0);
  await db.delete(addresses).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  revalidatePath("/account/addresses");
}

/* ---------------------------- Wishlist ----------------------------- */

export async function toggleWishlist(productId: number): Promise<ActionState> {
  const user = await getCurrentUser();
  if (!user) return { ok: false, message: "Please sign in to save pieces to your wishlist." };
  const existing = await db
    .select()
    .from(wishlists)
    .where(and(eq(wishlists.userId, user.id), eq(wishlists.productId, productId)))
    .limit(1);
  if (existing[0]) {
    await db.delete(wishlists).where(eq(wishlists.id, existing[0].id));
    revalidatePath("/account/wishlist");
    return { ok: true, message: "Removed from your wishlist." };
  }
  await db.insert(wishlists).values({ userId: user.id, productId });
  revalidatePath("/account/wishlist");
  return { ok: true, message: "Saved to your wishlist." };
}

/* ---------------------------- Checkout ----------------------------- */

export async function placeOrderAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
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

  if (!email || !phone || !customerName) {
    return { ok: false, message: "Please give us a name, an email and a phone number." };
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
    if (coupon) {
      await db
        .update(coupons)
        .set({ timesUsed: coupon.timesUsed + 1 })
        .where(eq(coupons.id, coupon.id));
    }
  }
  if (discount > subtotal) discount = subtotal;

  const total = subtotal - discount + deliveryFee;

  let userId = user?.id ?? null;
  if (!user && createAccount && password.length >= 6) {
    const exists = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
    if (!exists) {
      const created = await db
        .insert(users)
        .values({
          email,
          phone,
          fullName: customerName,
          passwordHash: hashPassword(password),
          role: "customer",
        })
        .returning();
      userId = created[0].id;
      await createSession(created[0].id);
    }
  }

  const shipping = {
    fullName: customerName,
    phone,
    city: String(formData.get("city") ?? "Douala"),
    area: String(formData.get("area") ?? ""),
    street: String(formData.get("street") ?? ""),
    notes: String(formData.get("notes") ?? ""),
    zone: zone?.name ?? "In-store pickup",
  };

  const orderNumber = makeOrderNumber();
  const inserted = await db
    .insert(orders)
    .values({
      orderNumber,
      userId,
      guestEmail: email,
      guestPhone: phone,
      customerName,
      status: "placed",
      subtotal,
      discount,
      deliveryFee,
      total,
      couponCode: cart.couponCode ?? "",
      paymentMethod,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "paid",
      deliveryMethod,
      deliveryZone: zone?.name ?? "In-store pickup",
      shippingSnapshot: shipping,
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

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  await db.update(carts).set({ couponCode: null }).where(eq(carts.id, cart.id));

  // Confirmation by email and WhatsApp (§6.5, §12.2)
  await notifyOrderPlaced(order.id);

  revalidatePath("/cart");
  redirect(`/order/${orderNumber}?email=${encodeURIComponent(email)}`);
}

/* -------------------------- Appointments --------------------------- */

export async function bookAppointmentAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const user = await getCurrentUser();
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const service = String(formData.get("service") ?? "Styling session");
  const date = String(formData.get("date") ?? "");
  const time = String(formData.get("time") ?? "");
  const notes = String(formData.get("notes") ?? "");

  if (!name || !contact || !date || !time) {
    return { ok: false, message: "Please complete your name, contact, date and time." };
  }
  const start = new Date(`${date}T${time}:00`);
  if (Number.isNaN(start.getTime())) {
    return { ok: false, message: "That date and time could not be read." };
  }
  if (start.getTime() < Date.now()) {
    return { ok: false, message: "Please choose a time in the future." };
  }
  const end = new Date(start.getTime() + 60 * 60 * 1000);

  const clash = await db
    .select()
    .from(appointments)
    .where(and(eq(appointments.slotStart, start), eq(appointments.status, "confirmed")))
    .limit(1);
  if (clash[0]) {
    return { ok: false, message: "That slot has just been taken — please choose another time." };
  }

  const reference = makeReference("APT");
  const inserted = await db.insert(appointments).values({
    reference,
    userId: user?.id ?? null,
    guestName: name,
    guestContact: contact,
    service,
    slotStart: start,
    slotEnd: end,
    status: "requested",
    notes,
  }).returning();
  await notifyAppointment({
    appointmentId: inserted[0]?.id ?? 0,
    contact,
    name,
    reference,
    when: start.toLocaleString("en-GB"),
    kind: "requested",
  });

  revalidatePath("/appointments");
  revalidatePath("/account/appointments");
  return { ok: true, message: `Thank you, ${name}. Your request ${reference} has been received — our stylist will confirm shortly.` };
}

export async function cancelAppointmentAction(formData: FormData) {
  const user = await getCurrentUser();
  const id = Number(formData.get("id") ?? 0);
  if (!user) return;
  await db
    .update(appointments)
    .set({ status: "cancelled" })
    .where(and(eq(appointments.id, id), eq(appointments.userId, user.id)));
  revalidatePath("/account/appointments");
}

/* ------------------------ Newsletter / contact ---------------------- */

export async function newsletterAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email.includes("@")) return { ok: false, message: "Please enter a valid email address." };
  await db.insert(newsletterSignups).values({ email }).onConflictDoNothing();
  return { ok: true, message: "Thank you — you are on the list." };
}

export async function contactAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  const contact = String(formData.get("contact") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();
  if (!name || !contact || !message) {
    return { ok: false, message: "Please complete every field so we can reply." };
  }
  await db.insert(contactMessages).values({ name, contact, message });
  return { ok: true, message: "Thank you for writing to us. We reply within one business day." };
}

/* --------------------------- Order lookup --------------------------- */

export async function lookupOrder(orderNumber: string, contact: string) {
  const rows = await db
    .select()
    .from(orders)
    .where(eq(orders.orderNumber, orderNumber.trim().toUpperCase()))
    .limit(1);
  const order = rows[0];
  if (!order) return null;
  const match =
    order.guestEmail.toLowerCase() === contact.trim().toLowerCase() ||
    order.guestPhone.replace(/\D/g, "") === contact.replace(/\D/g, "");
  if (!match) return null;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
  return { order, items };
}

export async function getProductImage(productId: number) {
  const rows = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .limit(1);
  return rows[0]?.url ?? "";
}

/**
 * Authenticates without redirecting, so the Buy-now panel can sign a visitor in
 * without navigating away from their selection.
 */
export async function inlineLoginAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const identifier = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (!identifier || !password) {
    return { ok: false, message: "Please enter your email and password." };
  }
  const user = await findUserByIdentifier(identifier);
  if (!user || !verifyPassword(password, user.passwordHash)) {
    return { ok: false, message: "Those details did not match our records." };
  }
  await mergeGuestCart(user.id);
  await createSession(user.id);
  revalidatePath("/");
  return { ok: true, message: user.fullName || user.email };
}

/* --------------------------- Password reset -------------------------- */

/**
 * §4.2 — request a reset link. Always reports success so the form cannot be
 * used to discover which email addresses have accounts.
 */
export async function requestPasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const generic = {
    ok: true,
    message: "If that address has an account, a reset link is on its way.",
  };
  if (!email.includes("@")) return { ok: false, message: "Please enter a valid email address." };

  const user = (await db.select().from(users).where(eq(users.email, email)).limit(1))[0];
  if (!user) return generic;

  const token = randomBytes(24).toString("hex");
  await db.insert(passwordResets).values({
    userId: user.id,
    token,
    expiresAt: new Date(Date.now() + 1000 * 60 * 60),
  });

  await sendEmail({
    to: email,
    subject: "Reset your OSSZ Collections password",
    body: `Dear ${user.fullName || "customer"},\n\nYou may set a new password using the link below. It is valid for one hour.\n\nhttps://osszcollections.cm/reset-password?token=${token}\n\nIf you did not ask for this, you may safely ignore this message.\n\nWith warm regards,\nOSSZ Collections`,
  });

  return generic;
}

/** §4.2 — complete the reset with a valid, unused, unexpired token. */
export async function completePasswordResetAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = String(formData.get("token") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  if (password.length < 6) {
    return { ok: false, message: "Please choose a password of at least 6 characters." };
  }

  const row = (
    await db.select().from(passwordResets).where(eq(passwordResets.token, token)).limit(1)
  )[0];
  if (!row || row.usedAt || new Date(row.expiresAt) < new Date()) {
    return { ok: false, message: "That link has expired. Please request a new one." };
  }

  await db.update(users).set({ passwordHash: hashPassword(password) }).where(eq(users.id, row.userId));
  await db.update(passwordResets).set({ usedAt: new Date() }).where(eq(passwordResets.id, row.id));
  return { ok: true, message: "Your password has been changed. You may now sign in." };
}
