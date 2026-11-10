import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail, queueWhatsApp } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const messageId = Number(formData.get("messageId") ?? "0");
  const reply = String(formData.get("reply") ?? "").trim();
  const customSubject = String(formData.get("subject") ?? "").trim();

  const isJsonRequest = req.headers.get("accept")?.includes("application/json");

  if (!messageId || !reply) {
    if (isJsonRequest) {
      return NextResponse.json({ ok: false, error: "Missing messageId or reply" }, { status: 400 });
    }
    return NextResponse.redirect(new URL("/admin/contact?error=1", req.url));
  }

  const msg = (await db.select().from(contactMessages).where(eq(contactMessages.id, messageId)).limit(1))[0];
  if (!msg) {
    if (isJsonRequest) {
      return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });
    }
    return NextResponse.redirect(new URL("/admin/contact?error=1", req.url));
  }

  // Mark as handled
  await db.update(contactMessages).set({ handled: true }).where(eq(contactMessages.id, messageId));

  const emailSubject = customSubject || "OSSZ Collections — regarding your message";

  // Send reply via email if contact has email
  if (msg.contact.includes("@")) {
    await sendEmail({
      to: msg.contact,
      subject: emailSubject,
      body: `Dear ${msg.name},\n\nThank you for reaching out to OSSZ Collections.\n\n${reply}\n\nWith warm regards,\nOSSZ Collections\nAnge Raphael, Douala, Cameroon\nhttps://osszcollections.cm`,
      orderId: null,
      appointmentId: null,
    });
  }

  // Queue WhatsApp message if phone number
  if (msg.contact.replace(/\D/g, "").length >= 7) {
    await queueWhatsApp({
      to: msg.contact,
      body: `Hello ${msg.name}, thank you for reaching out to OSSZ Collections. ${reply}`,
      orderId: null,
      appointmentId: null,
    });
  }

  if (isJsonRequest) {
    return NextResponse.json({ ok: true });
  }

  return NextResponse.redirect(new URL(`/admin/contact?ok=1&messageId=${messageId}`, req.url));
}
