import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { canEnterBackOffice, canFulfilOrders, canManageCatalogue, getCurrentUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { AdminBack } from "@/components/admin-back";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!canEnterBackOffice(user.role)) redirect("/account");

  const groups: Array<{ title: string; links: Array<[string, string]> }> = [];

  if (canFulfilOrders(user.role)) {
    groups.push({
      title: "Operations",
      links: [
        ["/admin", "Dashboard"],
        ["/admin/orders", "Orders queue"],
        ["/admin/inventory", "Stock counts"],
        ["/admin/appointments", "Appointments"],
        ["/admin/notifications", "Customer messages"],
      ],
    });
  }
  if (canManageCatalogue(user.role)) {
    groups.push({
      title: "Content",
      links: [
        ...(canFulfilOrders(user.role) ? [] : ([["/admin", "Dashboard"]] as Array<[string, string]>)),
        ["/admin/products", "Products"],
        ["/admin/collections", "Collections"],
        ["/admin/homepage", "Homepage blocks"],
        ["/admin/lookbook", "Lookbook"],
        ["/admin/journal", "Journal"],
        ["/admin/media", "Media library"],
      ],
    });
  }
  if (isAdmin(user.role)) {
    groups.push({
      title: "Business",
      links: [
        ["/admin/customers", "Customers"],
        ["/admin/coupons", "Discounts"],
        ["/admin/settings", "Settings & concierge"],
        ["/admin/staff", "Staff & roles"],
      ],
    });
  }

  return (
    <div className="min-h-screen bg-canvas">
      <div className="wrap grid gap-8 py-8 lg:grid-cols-[230px_1fr]">
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">Back office</p>
          <p className="display mt-1 text-xl">{user.fullName || user.email}</p>
          <p className="mt-1 text-xs tracking-[0.14em] uppercase text-accent">{user.role}</p>
          <nav className="mt-6 space-y-6 text-sm">
            {groups.map((group) => (
              <div key={group.title}>
                <p className="eyebrow">{group.title}</p>
                <div className="mt-2 flex flex-col">
                  {group.links.map(([href, label]) => (
                    <Link key={href} href={href} className="border-b border-line py-2 text-ink-soft hover:text-accent">
                      {label}
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
          <div className="mt-6 flex flex-col gap-2 text-xs">
            <Link href="/" className="text-muted link-underline">View the live site →</Link>
            <form action={logoutAction}><button className="text-muted link-underline">Sign out</button></form>
          </div>
        </aside>
        <section className="min-w-0">
          <AdminBack />
          {children}
        </section>
      </div>
    </div>
  );
}
