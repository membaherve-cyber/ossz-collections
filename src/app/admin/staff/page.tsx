import { desc, ne } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations, users } from "@/db/schema";
import { saveStaffAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatDateTime } from "@/lib/utils";

import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await guardPage("admin");
  const [team, conversations] = await Promise.all([
    db.select().from(users).where(ne(users.role, "customer")),
    db.select().from(aiConversations).orderBy(desc(aiConversations.updatedAt)).limit(8),
  ]);

  return (
    <div className="space-y-12">
      <section>
        <h1 className="display text-3xl">Staff & roles</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Permissions are enforced on the server, not merely hidden in the interface.
        </p>
        <ul className="mt-6 space-y-2 text-sm">
          {team.map((member) => (
            <li key={member.id} className="card flex items-center justify-between p-4">
              <span>{member.fullName || member.email}<span className="block text-xs text-muted">{member.email}</span></span>
              <span className="chip">{member.role}</span>
            </li>
          ))}
        </ul>
        <ActionForm action={saveStaffAction} submitLabel="Save team member" className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
          <div><label className="label" htmlFor="fullName">Name</label><input id="fullName" name="fullName" className="field" /></div>
          <div><label className="label" htmlFor="email">Email</label><input id="email" name="email" type="email" required className="field" /></div>
          <div>
            <label className="label" htmlFor="role">Role</label>
            <select id="role" name="role" className="field">
              <option value="uploader">Content uploader — catalogue & content only</option>
              <option value="staff">Staff — orders, stock, appointments</option>
              <option value="admin">Admin — everything</option>
              <option value="customer">Customer — no back office</option>
            </select>
          </div>
          <div><label className="label" htmlFor="password">Password (new accounts only)</label><input id="password" name="password" type="password" className="field" /></div>
        </ActionForm>
      </section>

      <section>
        <h2 className="display text-2xl">Concierge conversations</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Review what visitors ask, and turn recurring questions into FAQ entries.
        </p>
        <ul className="mt-4 space-y-3">
          {conversations.map((conversation) => {
            const transcript = (conversation.transcript ?? []) as Array<{ role: string; content: string }>;
            const lastUser = [...transcript].reverse().find((m) => m.role === "user");
            return (
              <li key={conversation.id} className="card p-4 text-sm">
                <p className="text-xs text-muted">
                  {formatDateTime(conversation.updatedAt)} · {transcript.length} messages
                  {conversation.escalatedToWhatsapp ? " · handed to WhatsApp" : ""}
                </p>
                <p className="mt-1 text-ink-soft">“{lastUser?.content ?? "—"}”</p>
              </li>
            );
          })}
          {conversations.length === 0 ? <li className="text-sm text-muted">No conversations logged yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
