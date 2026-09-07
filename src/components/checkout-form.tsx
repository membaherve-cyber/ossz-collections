"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import { placeOrderAction, type ActionState } from "@/lib/actions";
import { formatXAF } from "@/lib/utils";
import { t, type Locale } from "@/lib/i18n";

const initial: ActionState = { ok: false, message: "" };

type Zone = { id: number; name: string; method: string; fee: number; etaLabel: string };
type Address = { id: number; label: string; fullName: string; phone: string; city: string; area: string; street: string };

export function CheckoutForm({
  zones,
  subtotal,
  discount,
  couponCode,
  user,
  addresses,
  codEnabled,
  threshold,
  locale,
  guestMode,
  preferredPayment,
}: {
  zones: Zone[];
  subtotal: number;
  discount: number;
  couponCode: string | null;
  user: { email: string; fullName: string; phone: string | null } | null;
  addresses: Address[];
  codEnabled: boolean;
  threshold: number;
  locale: Locale;
  guestMode: boolean;
  preferredPayment?: string;
}) {
  const [state, action, pending] = useActionState(placeOrderAction, initial);
  const [zoneId, setZoneId] = useState(zones[0]?.id ?? 0);
  const [payment, setPayment] = useState(preferredPayment || "mobile_money_mtn");
  const [createAccount, setCreateAccount] = useState(false);
  const [addressId, setAddressId] = useState(addresses[0]?.id ?? 0);
  const [addressConfirmed, setAddressConfirmed] = useState(false);
  // Live mirror of the address fields so the confirmation panel is truthful.
  const [addr, setAddr] = useState({ city: "Douala", area: "", street: "", name: "", phone: "" });

  const zone = zones.find((z) => z.id === zoneId);
  const freeDelivery = subtotal >= threshold && zone?.method !== "national";
  const deliveryFee = zone?.method === "pickup" || freeDelivery ? 0 : (zone?.fee ?? 0);
  const total = Math.max(subtotal - discount, 0) + deliveryFee;
  const chosen = addresses.find((a) => a.id === addressId);

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
      <div className="space-y-10">
        {guestMode && !user ? (
          <p className="rounded-sm border border-line bg-accent-soft/50 px-4 py-3 text-sm text-ink-soft">
            {t(locale, "checkout.guestBanner")}
          </p>
        ) : null}

        {/* 1. Identity */}
        <section>
          <h2 className="display text-2xl">1 · Your details</h2>
          {!user ? (
            <p className="mt-2 text-sm text-ink-soft">
              Checking out as a guest. Already with us?{" "}
              <Link href="/login?next=/checkout" className="text-accent link-underline">
                Sign in
              </Link>{" "}
              for saved addresses.
            </p>
          ) : (
            <p className="mt-2 text-sm text-ink-soft">Signed in as {user.email}.</p>
          )}
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="customerName">Full name</label>
              <input
                id="customerName"
                name="customerName"
                required
                defaultValue={user?.fullName ?? ""}
                onChange={(e) => setAddr((a) => ({ ...a, name: e.target.value }))}
                className="field"
              />
            </div>
            <div>
              <label className="label" htmlFor="phone">Phone (MoMo number if paying by mobile money)</label>
              <input
                id="phone"
                name="phone"
                required
                defaultValue={user?.phone ?? ""}
                onChange={(e) => setAddr((a) => ({ ...a, phone: e.target.value }))}
                className="field"
                placeholder="+237 6.. .. .. .."
              />
            </div>
            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required defaultValue={user?.email ?? ""} className="field" />
            </div>
          </div>

          {!user ? (
            <div className="mt-4 rounded-sm border border-line bg-accent-soft/40 p-4">
              <label className="flex items-start gap-3 text-sm">
                <input
                  type="checkbox"
                  name="createAccount"
                  checked={createAccount}
                  onChange={(e) => setCreateAccount(e.target.checked)}
                  className="mt-1"
                />
                <span>
                  Create an account to save these details, track this order and keep a wishlist.
                  <span className="block text-xs text-muted">Entirely optional — your order is placed either way.</span>
                </span>
              </label>
              {createAccount ? (
                <div className="mt-3">
                  <label className="label" htmlFor="password">Choose a password</label>
                  <input id="password" name="password" type="password" minLength={6} className="field" />
                </div>
              ) : null}
            </div>
          ) : null}
        </section>

        {/* 2. Delivery */}
        <section>
          <h2 className="display text-2xl">2 · Delivery</h2>
          <div className="mt-5 grid gap-3">
            {zones.map((z) => (
              <label
                key={z.id}
                className={`flex cursor-pointer items-center justify-between gap-4 border p-4 text-sm transition-colors ${
                  zoneId === z.id ? "border-ink bg-paper" : "border-line"
                }`}
              >
                <span className="flex items-center gap-3">
                  <input
                    type="radio"
                    name="zoneId"
                    value={z.id}
                    checked={zoneId === z.id}
                    onChange={() => setZoneId(z.id)}
                  />
                  <span>
                    {z.name}
                    <span className="block text-xs text-muted">{z.etaLabel}</span>
                  </span>
                </span>
                <span>{z.fee === 0 ? "Free" : formatXAF(z.fee)}</span>
              </label>
            ))}
          </div>
          <input type="hidden" name="deliveryMethod" value={zone?.method ?? "national"} />

          {addresses.length > 0 ? (
            <div className="mt-5">
              <label className="label" htmlFor="savedAddress">Saved address</label>
              <select
                id="savedAddress"
                className="field"
                value={addressId}
                onChange={(e) => setAddressId(Number(e.target.value))}
              >
                {addresses.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label} — {a.area}, {a.city}
                  </option>
                ))}
                <option value={0}>Use a new address</option>
              </select>
            </div>
          ) : null}

          {zone?.method !== "pickup" ? (
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="city">City</label>
                <input id="city" name="city" defaultValue={chosen?.city ?? "Douala"} key={`city-${addressId}`}
                  onChange={(e) => setAddr((a) => ({ ...a, city: e.target.value }))} className="field" />
              </div>
              <div>
                <label className="label" htmlFor="area">Neighbourhood / quartier</label>
                <input id="area" name="area" defaultValue={chosen?.area ?? ""} key={`area-${addressId}`}
                  onChange={(e) => setAddr((a) => ({ ...a, area: e.target.value }))} className="field" placeholder="Ange Raphael" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="street">Street & landmark</label>
                <input id="street" name="street" defaultValue={chosen?.street ?? ""} key={`street-${addressId}`}
                  onChange={(e) => setAddr((a) => ({ ...a, street: e.target.value }))} className="field" placeholder="Rue Joss, opposite the pharmacy" />
              </div>
              <div className="sm:col-span-2">
                <label className="label" htmlFor="notes">Delivery notes (optional)</label>
                <textarea id="notes" name="notes" rows={2} className="field" />
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink-soft">
              We will send a message the moment your order is ready at the Ange Raphael boutique.
            </p>
          )}
        </section>

        {/* Confirm delivery address — required for every order */}
        <section className="rounded-sm border border-ink/20 bg-accent-soft/30 p-5">
          <h2 className="display text-2xl">{t(locale, "checkout.confirmAddress")}</h2>
          <p className="mt-2 text-sm text-ink-soft">{t(locale, "checkout.confirmAddressBody")}</p>
          <div className="mt-4 border-l-2 border-accent pl-4 text-sm">
            <p className="font-medium">{addr.name || user?.fullName || "—"}</p>
            <p className="text-ink-soft">{addr.phone || user?.phone || "—"}</p>
            {zone?.method === "pickup" ? (
              <p className="text-ink-soft">{zone?.name}</p>
            ) : (
              <>
                <p className="text-ink-soft">{addr.street || chosen?.street || "—"}</p>
                <p className="text-ink-soft">
                  {(addr.area || chosen?.area) ?? ""}{(addr.area || chosen?.area) ? ", " : ""}
                  {addr.city || chosen?.city || "Douala"}
                </p>
                <p className="mt-1 text-xs text-muted">{zone?.name} · {zone?.etaLabel}</p>
              </>
            )}
          </div>
          <label className="mt-4 flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              checked={addressConfirmed}
              onChange={(e) => setAddressConfirmed(e.target.checked)}
              className="mt-1"
            />
            <span>{t(locale, "checkout.confirmTick")}</span>
          </label>
        </section>

        {/* 3. Payment */}
        <section>
          <h2 className="display text-2xl">3 · Payment</h2>
          <p className="mt-2 text-sm text-ink-soft">
            Mobile money and card are equally welcome. Payments are processed securely; we never
            store your card details.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {[
              ["mobile_money_mtn", "MTN Mobile Money", "Prompt sent to your phone"],
              ["mobile_money_orange", "Orange Money", "Prompt sent to your phone"],
              ["card", "Visa / Mastercard", "Secure card payment"],
              ...(codEnabled ? [["cash_on_delivery", "Pay on delivery", "Cash or MoMo, at pickup"]] : []),
            ].map(([value, label, hint]) => (
              <label
                key={value}
                className={`flex cursor-pointer items-start gap-3 border p-4 text-sm transition-colors ${
                  payment === value ? "border-ink bg-paper" : "border-line"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMethod"
                  value={value}
                  checked={payment === value}
                  onChange={() => setPayment(value)}
                  className="mt-1"
                />
                <span>
                  {label}
                  <span className="block text-xs text-muted">{hint}</span>
                </span>
              </label>
            ))}
          </div>
        </section>
      </div>

      {/* Summary */}
      <aside className="card h-fit p-6 lg:sticky lg:top-32">
        <h2 className="display text-2xl">Order review</h2>
        <dl className="mt-5 space-y-2 text-sm text-ink-soft">
          <div className="flex justify-between"><dt>Subtotal</dt><dd>{formatXAF(subtotal)}</dd></div>
          {discount > 0 ? (
            <div className="flex justify-between"><dt>Discount ({couponCode})</dt><dd>− {formatXAF(discount)}</dd></div>
          ) : null}
          <div className="flex justify-between">
            <dt>Delivery</dt>
            <dd>{deliveryFee === 0 ? "Complimentary" : formatXAF(deliveryFee)}</dd>
          </div>
          <div className="mt-3 flex justify-between border-t border-line pt-3 text-base text-ink">
            <dt>Total due</dt>
            <dd>{formatXAF(total)}</dd>
          </div>
        </dl>

        <button className="btn btn-primary mt-6 w-full" disabled={pending || !addressConfirmed}>
          {pending ? t(locale, "checkout.placing") : t(locale, "checkout.place")}
        </button>
        {!addressConfirmed ? (
          <p className="mt-2 text-center text-xs text-muted">{t(locale, "checkout.mustConfirm")}</p>
        ) : null}
        {state.message && !state.ok ? (
          <p className="mt-3 text-xs text-red-600">{state.message}</p>
        ) : null}
        <p className="mt-4 text-xs leading-relaxed text-muted">
          By placing this order you agree to our returns policy. You will receive an email and a
          WhatsApp confirmation with your order number.
        </p>
      </aside>
    </form>
  );
}
