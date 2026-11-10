import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { canEnterBackOffice, canFulfilOrders, canManageCatalogue, getCurrentUser, isAdmin } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";
import { AdminBack } from "@/components/admin-back";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export const dynamic = "force-dynamic";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/admin");
  if (!canEnterBackOffice(user.role)) redirect("/account");

  const groups: Array<{ title: string; links: Array<{ href: string; label: string }> }> = [];

  if (canFulfilOrders(user.role)) {
    groups.push({
      title: "Operations",
      links: [
        { href: "/admin", label: "Dashboard" },
        { href: "/admin/orders", label: "Orders queue" },
        { href: "/admin/inventory", label: "Stock counts" },
        { href: "/admin/appointments", label: "Appointments" },
        { href: "/admin/notifications", label: "Customer messages" },
      ],
    });
  }
  if (canManageCatalogue(user.role)) {
    groups.push({
      title: "Content",
      links: [
        ...(canFulfilOrders(user.role) ? [] : [{ href: "/admin", label: "Dashboard" }]),
        { href: "/admin/products", label: "Products" },
        { href: "/admin/collections", label: "Collections" },
        { href: "/admin/homepage", label: "Homepage blocks" },
        { href: "/admin/lookbook", label: "Lookbook" },
        { href: "/admin/journal", label: "Journal" },
        { href: "/admin/media", label: "Media library" },
      ],
    });
  }
  if (isAdmin(user.role)) {
    groups.push({
      title: "Business",
      links: [
        { href: "/admin/customers", label: "Customers" },
        { href: "/admin/coupons", label: "Discounts" },
        { href: "/admin/settings", label: "Settings & concierge" },
        { href: "/admin/staff", label: "Staff & roles" },
      ],
    });
  }

  return (
    <div className="admin-shell min-h-screen bg-canvas">
      {/* Modern Vertical Sidebar (Desktop + Mobile) */}
      <AdminSidebar
        user={{
          fullName: user.fullName,
          email: user.email,
          role: user.role,
        }}
        groups={groups}
        logoutAction={logoutAction}
      />

      {/* Main Content Area */}
      <div className="min-w-0 transition-all duration-300 lg:pl-64">
        <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
          <AdminBack />
          {children}
        </main>
      </div>
    </div>
  );
}
