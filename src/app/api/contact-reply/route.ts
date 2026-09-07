import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sendEmail } from "@/lib/notify";
import { queueWhatsApp } from "@/lib/notify";

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const messageId = Number(formData.get("messageId") ?? "0");
  const reply = String(formData.get("reply") ?? "").trim();

  if (!messageId || !reply) {
    return NextResponse.json({ ok: false, error: "Missing messageId or reply" }, { status: 400 });
  }

  const msg = (await db.select().from(contactMessages).where(eq(contactMessages.id, messageId)).limit(1))[0];
  if (!msg) {
    return NextResponse.json({ ok: false, error: "Message not found" }, { status: 404 });
  }

  // Mark as handled
  await db.update(contactMessages).set({ handled: true }).where(eq(contactMessages.id, messageId));

  // Send reply via email if contact has email
  if (msg.contact.includes("@")) {
    await sendEmail({
      to: msg.contact,
      subject: "OSSZ Collections — regarding your message",
      body: `Dear ${msg.name},\n\nThank you for reaching out to OSSZ Collections.\n\n${reply}\n\nWith warm regards,\nOSSZ Collections\nAnge Raphael, Douala, Cameroon\n\nhttps://osszcollections.cm`,
      orderId: null,
      appointmentId: null,
    });
  }

  // Queue WhatsApp message if phone number
  if (msg.contact.replace(/\D/g, "").length >= 7) {
    await queueWhatsApp({
      to: msg.contact,
      body: `Hello ${msg.name}, thank you for your message. ${reply}`,
      orderId: null,
      appointmentId: null,
    });
  }

  return NextResponse.json({ ok: true });
}
