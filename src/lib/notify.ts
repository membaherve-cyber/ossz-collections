import { eq } from "drizzle-orm";
import { db } from "@/db";
import { notifications, orders, orderItems } from "@/db/schema";
import { getSettings } from "@/lib/store";
import { DELIVERY_LABELS, STATUS_LABELS, formatXAF, waLink } from "@/lib/utils";

/**
 * Transactional messaging (§5, §12.2).
 *
 * Every message is written to `notifications` first, then delivery is
 * attempted. If no provider key is configured the row stays queued rather than
 * failing — staff can still see exactly what should go out, and the WhatsApp
 * deep link on the order page lets them send it by hand. This keeps the shop
 * usable before the business has signed up with a provider.
 */

type Channel = "email" | "whatsapp" | "sms";

async function record(row: {
  orderId?: number | null;
  appointmentId?: number | null;
  channel: Channel;
  recipient: string;
  subject: string;
  body: string;
  status: string;
  error?: string;
}) {
  await db.insert(notifications).values({
    orderId: row.orderId ?? null,
    appointmentId: row.appointmentId ?? null,
    channel: row.channel,
    recipient: row.recipient,
    subject: row.subject,
    body: row.body,
    status: row.status,
    error: row.error ?? "",
  });
}

/** Sends through Resend when RESEND_API_KEY is present; queues otherwise. */
export async function sendEmail(opts: {
  to: string;
  subject: string;
  body: string;
  orderId?: number | null;
  appointmentId?: number | null;
}) {
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    await record({ ...opts, recipient: opts.to, channel: "email", status: "queued" });
    return { ok: false, queued: true };
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { authorization: `Bearer ${key}`, "content-type": "application/json" },
      body: JSON.stringify({
        from: process.env.RESEND_FROM || "OSSZ Collections <hello@osszcollections.cm>",
        to: [opts.to],
        subject: opts.subject,
        text: opts.body,
      }),
    });
    await record({
      ...opts,
      recipient: opts.to,
      channel: "email",
      status: res.ok ? "sent" : "failed",
      error: res.ok ? "" : `HTTP ${res.status}`,
    });
    return { ok: res.ok, queued: false };
  } catch (error) {
    await record({
      ...opts,
      recipient: opts.to,
      channel: "email",
      status: "failed",
      error: String(error).slice(0, 200),
    });
    return { ok: false, queued: false };
  }
}

/**
 * Queues the WhatsApp copy of a status update. At v1 the hand-off is a wa.me
 * deep link (§5), so this records the exact wording for staff to send; the
 * upgrade path to the Cloud API only changes this function.
 */
export async function queueWhatsApp(opts: {
  to: string;
  body: string;
  orderId?: number | null;
  appointmentId?: number | null;
}) {
  await record({
    orderId: opts.orderId,
    appointmentId: opts.appointmentId,
    channel: "whatsapp",
    recipient: opts.to,
    subject: "",
    body: opts.body,
    status: "queued",
  });
  return waLink(opts.to, opts.body);
}

function statusLine(status: string, locale: "en" | "fr" = "en"): string {
  const en: Record<string, string> = {
    placed: "We have received your order and it is being prepared.",
    processing: "Your order is being prepared in our Ange Raphael atelier.",
    ready: "Your order is ready.",
    out_for_delivery: "Your order is on its way to you.",
    delivered: "Your order has been delivered. We hope you love it.",
    returned: "Your return has been received.",
    cancelled: "Your order has been cancelled.",
  };
  const fr: Record<string, string> = {
    placed: "Nous avons bien reçu votre commande, elle est en préparation.",
    processing: "Votre commande est en préparation dans notre atelier d'Ange Raphael.",
    ready: "Votre commande est prête.",
    out_for_delivery: "Votre commande est en route.",
    delivered: "Votre commande a été livrée. Nous espérons qu'elle vous plaira.",
    returned: "Votre retour a bien été reçu.",
    cancelled: "Votre commande a été annulée.",
  };
  return (locale === "fr" ? fr : en)[status] ?? STATUS_LABELS[status] ?? status;
}

/** Order confirmation on both channels (§6.5 step 6). */
export async function notifyOrderPlaced(orderId: number) {
  const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
  if (!order) return;
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  const settings = await getSettings();

  // ── Build item lines ──────────────────────────────────────────────────
  const itemLines = items.map((it) => {
    const lineTotal = it.unitPrice * it.quantity;
    return `  • ${it.productName} (${it.variantLabel}) × ${it.quantity}  —  ${formatXAF(lineTotal)}`;
  });

  const itemList = itemLines.join("\n");
  const itemCount = items.reduce((n, it) => n + it.quantity, 0);

  // ── Email body (rich, detailed) ───────────────────────────────────────
  const emailBody = [
    `Dear ${order.customerName},`,
    ``,
    `Thank you for your order with OSSZ Collections.`,
    ``,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `  ORDER  ${order.orderNumber}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    ``,
    `Items (${itemCount}):`,
    itemList,
    ``,
    `───────────────────────────────────────────`,
    `  Subtotal:      ${formatXAF(order.subtotal)}`,
    ...(order.discount > 0 ? [`  Discount:      −${formatXAF(order.discount)}`] : []),
    `  Delivery:      ${order.deliveryFee === 0 ? "Complimentary" : formatXAF(order.deliveryFee)}`,
    `  TOTAL:         ${formatXAF(order.total)}`,
    `───────────────────────────────────────────`,
    ``,
    `Payment method: ${order.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
    `Delivery:       ${DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod} — ${order.deliveryZone}`,
    ``,
    `Track your order at any time:`,
    `https://osszcollections.cm/order/${order.orderNumber}`,
    ``,
    `If you have any questions, reply to this email or message us on WhatsApp at ${settings.whatsapp_number}.`,
    ``,
    `With warm regards,`,
    `OSSZ Collections · ${settings.store_address}`,
  ].join("\n");

  await sendEmail({
    to: order.guestEmail,
    subject: `Your OSSZ order ${order.orderNumber} — ${formatXAF(order.total)}`,
    body: emailBody,
    orderId,
  });

  // ── WhatsApp message to customer (detailed) ───────────────────────────
  if (order.guestPhone) {
    const waBody = [
      `🛍️ *OSSZ Collections — Order Confirmation*`,
      ``,
      `Hi ${order.customerName},`,
      ``,
      `Thank you for your order! Here are the details:`,
      ``,
      `📋 *Order:* ${order.orderNumber}`,
      ``,
      `*Items:*`,
      ...items.map((it) => `• ${it.productName} (${it.variantLabel}) × ${it.quantity} — ${formatXAF(it.unitPrice * it.quantity)}`),
      ``,
      `💰 Subtotal: ${formatXAF(order.subtotal)}`,
      ...(order.discount > 0 ? [`🏷️ Discount: −${formatXAF(order.discount)}`] : []),
      `🚚 Delivery: ${order.deliveryFee === 0 ? "Free" : formatXAF(order.deliveryFee)}`,
      `✅ *Total: ${formatXAF(order.total)}*`,
      ``,
      `💳 Payment: ${order.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
      `📦 Delivery: ${DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod}`,
      ``,
      `Track your order: https://osszcollections.cm/order/${order.orderNumber}`,
      ``,
      `We will update you as your order progresses. Thank you for choosing OSSZ! 🙏`,
    ].join("\n");

    await queueWhatsApp({
      to: order.guestPhone,
      body: waBody,
      orderId,
    });
  }

  // ── WhatsApp copy to OSSZ team (backoffice alert) ─────────────────────
  const teamBody = [
    `🛒 *New Order Received*`,
    ``,
    `Order: ${order.orderNumber}`,
    `Customer: ${order.customerName}`,
    `Phone: ${order.guestPhone}`,
    `Email: ${order.guestEmail}`,
    ``,
    `*Items:*`,
    ...items.map((it) => `• ${it.productName} (${it.variantLabel}) × ${it.quantity} — ${formatXAF(it.unitPrice * it.quantity)}`),
    ``,
    `Total: ${formatXAF(order.total)}`,
    `Payment: ${order.paymentMethod.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}`,
    `Delivery: ${DELIVERY_LABELS[order.deliveryMethod] ?? order.deliveryMethod} — ${order.deliveryZone}`,
    ``,
    `Manage: https://osszcollections.cm/admin/orders/${order.id}`,
  ].join("\n");

  await queueWhatsApp({
    to: settings.whatsapp_number,
    body: teamBody,
    orderId,
  });

  // ── Email copy to OSSZ team ───────────────────────────────────────────
  await sendEmail({
    to: settings.contact_email || "info@osszcollection.com",
    subject: `🛒 New order ${order.orderNumber} — ${formatXAF(order.total)}`,
    body: teamBody,
    orderId,
  });
}

/** Status change on both channels (§12.2). */
export async function notifyOrderStatus(orderId: number, status: string) {
  const order = (await db.select().from(orders).where(eq(orders.id, orderId)).limit(1))[0];
  if (!order) return;
  const line = statusLine(status);

  await sendEmail({
    to: order.guestEmail,
    subject: `OSSZ order ${order.orderNumber} — ${STATUS_LABELS[status] ?? status}`,
    body: `Dear ${order.customerName},\n\n${line}\n\nOrder ${order.orderNumber}\nhttps://osszcollections.cm/order/${order.orderNumber}\n\nWith warm regards,\nOSSZ Collections`,
    orderId,
  });

  if (order.guestPhone) {
    await queueWhatsApp({
      to: order.guestPhone,
      body: `OSSZ Collections — order ${order.orderNumber}: ${line}`,
      orderId,
    });
  }
}

/** Appointment confirmation / reminder (§6.7). */
export async function notifyAppointment(opts: {
  appointmentId: number;
  contact: string;
  name: string;
  reference: string;
  when: string;
  kind: "requested" | "confirmed" | "cancelled" | "rescheduled";
}) {
  const settings = await getSettings();
  const verb = {
    requested: "has been received",
    confirmed: "is confirmed",
    cancelled: "has been cancelled",
    rescheduled: "has been moved",
  }[opts.kind];

  const body = `Dear ${opts.name},\n\nYour appointment ${opts.reference} ${verb} for ${opts.when}.\n\nWith warm regards,\nOSSZ Collections`;

  // 1. Notify the customer
  if (opts.contact.includes("@")) {
    await sendEmail({
      to: opts.contact,
      subject: `OSSZ appointment ${opts.reference}`,
      body,
      appointmentId: opts.appointmentId,
    });
  } else {
    await queueWhatsApp({ to: opts.contact, body, appointmentId: opts.appointmentId });
  }

  // 2. Forward a copy to the OSSZ team WhatsApp number (backoffice alert)
  const teamBody = `📅 New appointment ${opts.reference}\n\nName: ${opts.name}\nContact: ${opts.contact}\nWhen: ${opts.when}\nStatus: ${opts.kind}\n\nPlease confirm in the backoffice.`;
  const waLink = await queueWhatsApp({
    to: settings.whatsapp_number,
    body: teamBody,
    appointmentId: opts.appointmentId,
  });

  // 3. Send a copy of the appointment to the OSSZ email address
  await sendEmail({
    to: settings.contact_email || "info@osszcollection.com",
    subject: `New appointment request ${opts.reference} — ${opts.name}`,
    body: [
      `New appointment request`,
      ``,
      `Reference: ${opts.reference}`,
      `Name: ${opts.name}`,
      `Contact: ${opts.contact}`,
      `When: ${opts.when}`,
      `Service: ${opts.kind}`,
      ``,
      `Please confirm in the backoffice.`,
      waLink ? `\nWhatsApp link: ${waLink}` : "",
    ].filter(Boolean).join("\n"),
    appointmentId: opts.appointmentId,
  });
}
