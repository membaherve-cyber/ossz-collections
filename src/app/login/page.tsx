import type { Metadata } from "next";
import { LoginForm } from "@/components/auth-forms";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const next = typeof params.next === "string" ? params.next : "";
  return (
    <div className="wrap max-w-md py-20">
      <p className="eyebrow">Welcome back</p>
      <h1 className="display mt-2 text-4xl">Sign in</h1>
      <p className="mt-3 text-sm text-ink-soft">
        An account keeps your addresses, order history and wishlist to hand. You may always check
        out as a guest instead.
      </p>
      <div className="mt-8">
        <LoginForm next={next} />
      </div>
      <div className="mt-6 rounded-sm border border-line bg-accent-soft/40 p-4 text-xs text-ink-soft">
        <p className="font-medium">Back office</p>
        <p className="mt-1">admin / admin · full access</p>
        <p>manager / manager · full access (owner &amp; manager)</p>
        <p>staff / staff · orders, stock, appointments</p>
        <p className="mt-3 font-medium">Other demonstration accounts (password: ossz2026)</p>
        <p className="mt-1">studio@osszcollections.cm · content uploader</p>
        <p>client@example.com · customer</p>
      </div>
    </div>
  );
}
