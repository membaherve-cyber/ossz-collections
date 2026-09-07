import Link from "next/link";
import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/lib/actions";

const LINKS = [
  ["/account", "Overview"],
  ["/account/orders", "Orders & tracking"],
  ["/account/addresses", "Saved addresses"],
  ["/account/wishlist", "Wishlist"],
  ["/account/appointments", "Appointments"],
  ["/account/profile", "Profile & security"],
];

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/account");

  return (
    <div className="wrap grid gap-10 py-12 lg:grid-cols-[240px_1fr]">
      <aside className="lg:sticky lg:top-32 lg:self-start">
        <p className="eyebrow">Your account</p>
        <p className="display mt-1 text-2xl">{user.fullName || user.email}</p>
        <nav className="mt-6 flex flex-col gap-1 text-sm">
          {LINKS.map(([href, label]) => (
            <Link key={href} href={href} className="border-b border-line py-2 text-ink-soft hover:text-accent">
              {label}
            </Link>
          ))}
          {user.role !== "customer" ? (
            <Link href="/admin" className="border-b border-line py-2 text-accent">Back office →</Link>
          ) : null}
        </nav>
        <form action={logoutAction} className="mt-6">
          <button className="btn btn-ghost px-0 text-xs">Sign out</button>
        </form>
      </aside>
      <section>{children}</section>
    </div>
  );
}
