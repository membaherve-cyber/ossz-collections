"use client";

import { useState } from "react";
import { saveStaffAction } from "@/lib/admin-actions";

type StaffMember = {
  id: number;
  fullName: string | null;
  email: string;
  role: string;
};

interface StaffEditModalProps {
  member: StaffMember;
  onClose?: () => void;
}

export function StaffEditModal({ member, onClose }: StaffEditModalProps) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);

    const formData = new FormData(e.currentTarget);
    try {
      const res = await saveStaffAction({ ok: false, message: "" }, formData);
      setMsg({ ok: res.ok, text: res.message });
      if (res.ok) {
        setTimeout(() => {
          setOpen(false);
          setMsg(null);
          onClose?.();
        }, 800);
      }
    } catch (err: unknown) {
      setMsg({ ok: false, text: err instanceof Error ? err.message : "Update failed." });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn btn-secondary btn-sm !py-1 !px-2.5 text-xs"
      >
        Edit
      </button>

      {open ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
          <div className="card w-full max-w-md rounded-2xl bg-paper p-6 shadow-xl animate-in fade-in-50 zoom-in-95">
            <div className="flex items-center justify-between border-b border-line pb-3 mb-4">
              <div>
                <h3 className="display text-xl">Edit Staff Account</h3>
                <p className="text-xs text-muted">Update details and role permissions</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-muted hover:text-ink text-xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-sm">
              <input type="hidden" name="id" value={member.id} />

              <div>
                <label className="label" htmlFor={`edit-fn-${member.id}`}>Full Name</label>
                <input
                  id={`edit-fn-${member.id}`}
                  name="fullName"
                  defaultValue={member.fullName || ""}
                  className="field"
                  placeholder="e.g. Marie Ngono"
                />
              </div>

              <div>
                <label className="label" htmlFor={`edit-email-${member.id}`}>Email Address</label>
                <input
                  id={`edit-email-${member.id}`}
                  name="email"
                  type="email"
                  required
                  defaultValue={member.email}
                  className="field"
                />
              </div>

              <div>
                <label className="label" htmlFor={`edit-role-${member.id}`}>Role & Access Level</label>
                <select
                  id={`edit-role-${member.id}`}
                  name="role"
                  defaultValue={member.role}
                  className="field"
                >
                  <option value="uploader">Content uploader — catalogue & content only</option>
                  <option value="staff">Staff — orders, stock, appointments</option>
                  <option value="admin">Admin — complete access</option>
                  <option value="customer">Customer — no back office</option>
                </select>
              </div>

              <div>
                <label className="label" htmlFor={`edit-pw-${member.id}`}>
                  New Password <span className="text-xs font-normal text-muted">(Leave empty to keep existing)</span>
                </label>
                <input
                  id={`edit-pw-${member.id}`}
                  name="password"
                  type="password"
                  minLength={6}
                  className="field"
                  placeholder="••••••••"
                />
              </div>

              {msg ? (
                <div
                  className={`p-3 rounded-lg text-xs ${
                    msg.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"
                  }`}
                >
                  {msg.text}
                </div>
              ) : null}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-line">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => setOpen(false)}
                  className="btn btn-ghost btn-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={busy}
                  className="btn btn-primary btn-sm"
                >
                  {busy ? "Saving…" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
