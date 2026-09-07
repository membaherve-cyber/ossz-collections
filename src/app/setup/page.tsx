import Link from "next/link";

export const dynamic = "force-dynamic";

/** Human-friendly repair page for a production deployment whose database is empty. */
export default function SetupPage() {
  return (
    <div className="wrap flex min-h-[60vh] max-w-xl flex-col items-center justify-center py-20 text-center">
      <p className="display text-2xl tracking-[0.22em] uppercase">OSSZ<span className="text-accent">.</span></p>
      <h1 className="display mt-6 text-3xl">Repair shop content</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">
        If the shop shows 0 products, click the button below. It will create the database tables
        if needed and load the products, photos, categories, delivery zones and staff logins.
      </p>
      <a href="/api/setup" className="btn btn-primary mt-8">Run setup now</a>
      <Link href="/shop" className="mt-4 text-xs text-accent link-underline">Back to the shop</Link>
    </div>
  );
}
