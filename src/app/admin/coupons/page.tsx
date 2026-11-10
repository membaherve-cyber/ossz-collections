import { db } from "@/db";
import { coupons } from "@/db/schema";
import { saveCouponAction, toggleCouponAction } from "@/lib/admin-actions";
import { ActionForm } from "@/components/action-form";
import { formatDate, formatXAF } from "@/lib/utils";
import { guardPage } from "@/lib/guard";

export const dynamic = "force-dynamic";

export default async function CouponsPage() {
  await guardPage("admin");
  const rows = await db.select().from(coupons);

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Promotions</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">Discounts & Coupons</h1>
          <p className="mt-1 text-sm text-ink-soft">Create promotional vouchers: percentage discounts, fixed value reductions, or complimentary delivery.</p>
        </div>
      </div>

      {/* Create Coupon Form Card */}
      <div className="card rounded-2xl border border-line bg-paper p-6 shadow-xs">
        <div className="flex items-center gap-2 pb-4 border-b border-line/60">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent font-semibold">+</span>
          <div>
            <h2 className="text-base font-semibold text-ink">Generate New Promo Code</h2>
            <p className="text-xs text-muted">Configured discounts apply immediately in checkout.</p>
          </div>
        </div>
        <ActionForm action={saveCouponAction} submitLabel="Create coupon" className="mt-5 grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="code">Coupon Code (Uppercase)</label>
            <input id="code" name="code" required className="field rounded-xl font-mono uppercase" placeholder="e.g. WELCOME10" />
          </div>
          <div>
            <label className="label" htmlFor="type">Discount Mechanism</label>
            <select id="type" name="type" className="field rounded-xl">
              <option value="percentage">Percentage off cart subtotal (%)</option>
              <option value="fixed">Fixed amount off subtotal (FCFA)</option>
              <option value="free_delivery">Complimentary Free Delivery</option>
            </select>
          </div>
          <div>
            <label className="label" htmlFor="value">Discount Value (Percentage or Amount)</label>
            <input id="value" name="value" type="number" defaultValue={10} className="field rounded-xl font-semibold" />
          </div>
          <div>
            <label className="label" htmlFor="usageLimit">Max Total Redemptions (0 = unlimited)</label>
            <input id="usageLimit" name="usageLimit" type="number" defaultValue={0} className="field rounded-xl" />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="expiresAt">Expiration Date (Optional)</label>
            <input id="expiresAt" name="expiresAt" type="date" className="field rounded-xl" />
          </div>
        </ActionForm>
      </div>

      {/* Coupons List Table */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-semibold text-ink">Active & Archived Codes ({rows.length})</h2>
          <span className="text-xs text-muted">Click toggle to activate/deactivate instantly</span>
        </div>
        <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[620px] text-left text-xs">
              <thead className="bg-canvas/50 border-b border-line/60">
                <tr className="text-muted uppercase text-[10px] tracking-wider font-semibold">
                  <th className="py-3.5 px-4">Coupon Code</th>
                  <th className="py-3.5 px-4">Mechanism</th>
                  <th className="py-3.5 px-4">Value</th>
                  <th className="py-3.5 px-4">Usage Counter</th>
                  <th className="py-3.5 px-4">Validity</th>
                  <th className="py-3.5 px-4 text-right">Status Toggle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line/40">
                {rows.map((coupon) => (
                  <tr key={coupon.id} className="hover:bg-canvas/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-mono font-semibold text-xs tracking-wider px-2 py-0.5 rounded-lg bg-canvas border border-line text-ink">
                        {coupon.code}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-ink-soft capitalize">
                      {coupon.type.replace(/_/g, " ")}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-accent">
                      {coupon.type === "fixed" ? formatXAF(coupon.value) : coupon.type === "percentage" ? `${coupon.value}%` : "Free Delivery"}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      <span className="font-medium text-ink">{coupon.timesUsed}</span>
                      {coupon.usageLimit ? <span className="text-muted"> / {coupon.usageLimit} max</span> : " (unlimited)"}
                    </td>
                    <td className="py-3.5 px-4 text-muted">
                      {coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiration"}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <form action={toggleCouponAction}>
                        <input type="hidden" name="id" value={coupon.id} />
                        <input type="hidden" name="isActive" value={String(coupon.isActive)} />
                        <button
                          type="submit"
                          className={`btn btn-sm rounded-lg text-xs transition-colors ${
                            coupon.isActive
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                              : "bg-canvas text-muted border border-line hover:text-ink"
                          }`}
                        >
                          {coupon.isActive ? "● Active (Click to Pause)" : "○ Inactive (Click to Activate)"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted">No promotional coupons configured yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
