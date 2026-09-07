import { redirect } from "next/navigation";
import { canFulfilOrders, canManageCatalogue, getCurrentUser, isAdmin } from "@/lib/auth";

/**
 * Page-level access control for the back office.
 *
 * The layout only checks that a visitor may enter /admin at all; without these
 * guards a staff account could open an admin-only page by typing the URL, even
 * though it is absent from their navigation. Server actions were already
 * protected, so this closes read access to match.
 */
export async function guardPage(area: "orders" | "catalogue" | "admin") {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");

  const allowed =
    area === "orders"
      ? canFulfilOrders(user.role)
      : area === "catalogue"
        ? canManageCatalogue(user.role)
        : isAdmin(user.role);

  if (!allowed) redirect("/admin");
  return user;
}
