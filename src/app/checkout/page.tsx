import Link from "next/link";
import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { addresses as addressTable } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { getCart, getSettings, listDeliveryZones } from "@/lib/store";
import { CheckoutForm } from "@/components/checkout-form";
import { getLocale } from "@/lib/locale-server";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Checkout" };

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const guestMode = params.guest === "1";
  const preferredPayment = typeof params.pay === "string" ? params.pay : "";
  const [cart, zones, user, settings, locale] = await Promise.all([
    getCart(),
    listDeliveryZones(),
    getCurrentUser(),
    getSettings(),
    getLocale(),
  ]);

  if (cart.lines.length === 0) {
    return (
      <div className="wrap py-16">
        <EmptyState
          title="There is nothing to check out yet"
          body="Add a piece to your cart and we will take good care of the rest."
          action={<Link href="/shop" className="btn btn-primary mt-2">Browse the shop</Link>}
        />
      </div>
    );
  }

  const saved = user
    ? await db.select().from(addressTable).where(eq(addressTable.userId, user.id))
    : [];

  return (
    <div className="wrap py-12 md:py-16">
      <header className="max-w-2xl">
        <p className="eyebrow">Checkout</p>
        <h1 className="display mt-2 text-4xl">Almost yours</h1>
        <p className="mt-3 text-sm text-ink-soft">
          {user
            ? "Your saved details are pre-filled — adjust anything you wish."
            : "No account needed. If you would like one, you may create it as you check out."}
        </p>
      </header>

      <div className="mt-10">
        <CheckoutForm
          zones={zones.map((z) => ({ id: z.id, name: z.name, method: z.method, fee: z.fee, etaLabel: z.etaLabel }))}
          subtotal={cart.subtotal}
          discount={cart.discount}
          couponCode={cart.couponCode}
          user={user ? { email: user.email, fullName: user.fullName, phone: user.phone } : null}
          addresses={saved.map((a) => ({
            id: a.id, label: a.label, fullName: a.fullName, phone: a.phone,
            city: a.city, area: a.area, street: a.street,
          }))}
          codEnabled={settings.cod_enabled === "true"}
          threshold={Number(settings.free_delivery_threshold)}
          locale={locale}
          guestMode={guestMode}
          preferredPayment={preferredPayment}
        />
      </div>
    </div>
  );
}
