import { desc, ne } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations, users } from "@/db/schema";
import { saveStaffAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatDateTime } from "@/lib/utils";
import { guardPage } from "@/lib/guard";
import { StaffEditModal } from "@/components/admin/staff-edit-modal";

export const dynamic = "force-dynamic";

export default async function StaffPage() {
  await guardPage("admin");
  const [team, conversations] = await Promise.all([
    db.select().from(users).where(ne(users.role, "customer")),
    db.select().from(aiConversations).orderBy(desc(aiConversations.updatedAt)).limit(8),
  ]);

  return (
    <div className="space-y-10">
      <header className="border-b border-line pb-6">
        <p className="eyebrow">Business Administration</p>
        <h1 className="display text-3xl mt-1">Staff & Role Permissions</h1>
        <p className="mt-2 text-sm text-ink-soft">
          Role-based access is strictly enforced on the server. Manage team credentials, assigned permissions, and edit existing accounts.
        </p>
      </header>

      {/* Staff List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="display text-xl">Active Team Members ({team.length})</h2>
        </div>

        <ul className="space-y-3">
          {team.map((member) => (
            <li
              key={member.id}
              className="card p-4 rounded-xl flex items-center justify-between gap-4 border border-line bg-paper shadow-2xs hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-10 w-10 shrink-0 rounded-full bg-accent-soft text-accent flex items-center justify-center font-bold text-sm">
                  {(member.fullName || member.email)[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <span className="font-medium text-sm text-ink block truncate">
                    {member.fullName || member.email}
                  </span>
                  <span className="block text-xs font-mono text-muted truncate">{member.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`chip !rounded-full !px-2.5 !py-0.5 text-[10px] tracking-wider uppercase font-semibold ${
                    member.role === "admin"
                      ? "bg-accent/10 text-accent border border-accent/20"
                      : member.role === "staff"
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}
                >
                  {member.role}
                </span>

                <StaffEditModal member={member} />
              </div>
            </li>
          ))}
        </ul>

        {/* Add Staff Member Form */}
        <div className="card mt-8 rounded-2xl p-6 bg-paper border border-line shadow-xs">
          <h3 className="display text-lg mb-1">Add New Team Member</h3>
          <p className="text-xs text-muted mb-4">Create a new login for uploader, staff, or admin access.</p>

          <ActionForm action={saveStaffAction} submitLabel="Save team member" className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="fullName">Full Name</label>
              <input id="fullName" name="fullName" className="field" placeholder="e.g. Samuel Eto'o" />
            </div>
            <div>
              <label className="label" htmlFor="email">Email Address</label>
              <input id="email" name="email" type="email" required className="field" placeholder="staff@osszcollections.cm" />
            </div>
            <div>
              <label className="label" htmlFor="role">Role Permission</label>
              <select id="role" name="role" className="field">
                <option value="uploader">Content uploader — catalogue & content only</option>
                <option value="staff">Staff — orders, stock, appointments</option>
                <option value="admin">Admin — complete access</option>
                <option value="customer">Customer — no back office</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="password">Temporary Password</label>
              <input id="password" name="password" type="password" required minLength={6} className="field" placeholder="At least 6 characters" />
            </div>
          </ActionForm>
        </div>
      </section>

      {/* Concierge Section */}
      <section className="pt-6 border-t border-line">
        <h2 className="display text-xl">Concierge Conversations</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Review what visitors ask the AI concierge to turn recurring questions into FAQ entries.
        </p>
        <ul className="mt-4 space-y-3">
          {conversations.map((conversation) => {
            const transcript = (conversation.transcript ?? []) as Array<{ role: string; content: string }>;
            const lastUser = [...transcript].reverse().find((m) => m.role === "user");
            return (
              <li key={conversation.id} className="card p-4 rounded-xl border border-line/80 bg-paper text-sm shadow-2xs">
                <p className="text-xs text-muted">
                  {formatDateTime(conversation.updatedAt)} · {transcript.length} messages
                  {conversation.escalatedToWhatsapp ? " · escalated to WhatsApp" : ""}
                </p>
                <p className="mt-1 text-ink-soft italic">“{lastUser?.content ?? "—"}”</p>
              </li>
            );
          })}
          {conversations.length === 0 ? <li className="text-sm text-muted">No conversations logged yet.</li> : null}
        </ul>
      </section>
    </div>
  );
}
