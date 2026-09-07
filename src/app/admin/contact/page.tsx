import type { Metadata } from "next";
import { desc } from "drizzle-orm";
import { db } from "@/db";
import { contactMessages } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminContactInbox } from "@/components/admin-contact-inbox";

export const metadata: Metadata = { title: "Contact Messages — Admin" };

export default async function AdminContactPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await getCurrentUser();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/admin");
  }

  const messages = await db
    .select()
    .from(contactMessages)
    .orderBy(desc(contactMessages.createdAt))
    .limit(50);

  const messageIdParam = (typeof params.messageId === "string" ? params.messageId : params.messageId?.[0]) ?? undefined;
  const okParam = params.ok === "1";
  const errorParam = params.error === "1";

  const unread = messages.filter((m) => !m.handled).length;

  return (
    <div className="max-w-4xl">
      <header className="border-b border-ink/10 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Messages from customers</p>
            <h1 className="display mt-1 text-2xl">Messages</h1>
            <p className="text-sm text-ink-soft mt-1">
              {messages.length} message{messages.length !== 1 ? "s" : ""} · {unread} unread
            </p>
          </div>
        </div>
      </header>

      <AdminContactInbox
        messages={messages}
        lastReplyMessageId={messageIdParam}
        lastReplyOk={okParam ? "1" : undefined}
        lastReplyError={errorParam ? "1" : undefined}
      />
    </div>
  );
}
