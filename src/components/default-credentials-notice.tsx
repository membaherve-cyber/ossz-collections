import { inArray } from "drizzle-orm";
import { db } from "@/db";
import { users } from "@/db/schema";
import { verifyPassword } from "@/lib/auth";

/** Accounts intentionally shipped with matching username/password. */
const DEFAULTS = ["admin", "manager", "staff"];

/**
 * Surfaces a go-live reminder while any back-office account still uses its
 * default password. It disappears by itself once the passwords are changed.
 */
export async function DefaultCredentialsNotice() {
  const rows = await db.select().from(users).where(inArray(users.username, DEFAULTS));
  const weak = rows
    .filter((u) => u.username && verifyPassword(u.username, u.passwordHash))
    .map((u) => u.username);

  if (weak.length === 0) return null;

  return (
    <div className="mb-6 rounded-sm border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <p className="font-medium">
        {weak.length} back-office account{weak.length === 1 ? "" : "s"} still use a default password
        ({weak.join(", ")}).
      </p>
      <p className="mt-1 text-xs leading-relaxed">
        These are convenient while you are building and testing. Before the shop takes real orders,
        please set proper passwords under Settings → Staff &amp; roles — these accounts can read
        customer details and change payment settings. This notice disappears once they are changed.
      </p>
    </div>
  );
}
