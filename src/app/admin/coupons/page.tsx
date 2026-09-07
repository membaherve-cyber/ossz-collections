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
    <div>
      <h1 className="display text-3xl">Discounts & coupons</h1>
      <p className="mt-2 text-sm text-ink-soft">Percentage off, a fixed amount off, or free delivery.</p>

      <ActionForm action={saveCouponAction} submitLabel="Save code" className="card mt-6 grid gap-4 p-6 sm:grid-cols-2">
        <div><label className="label" htmlFor="code">Code</label><input id="code" name="code" required className="field" placeholder="WELCOME10" /></div>
        <div>
          <label className="label" htmlFor="type">Type</label>
          <select id="type" name="type" className="field">
            <option value="percentage">Percentage off</option>
            <option value="fixed">Fixed amount off (FCFA)</option>
            <option value="free_delivery">Free delivery</option>
          </select>
        </div>
        <div><label className="label" htmlFor="value">Value</label><input id="value" name="value" type="number" defaultValue={10} className="field" /></div>
        <div><label className="label" htmlFor="usageLimit">Usage limit (0 = unlimited)</label><input id="usageLimit" name="usageLimit" type="number" defaultValue={0} className="field" /></div>
        <div className="sm:col-span-2"><label className="label" htmlFor="expiresAt">Expires (optional)</label><input id="expiresAt" name="expiresAt" type="date" className="field" /></div>
      </ActionForm>

      <table className="mt-8 w-full text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase text-muted">
            <th className="py-3">Code</th><th>Type</th><th>Value</th><th>Used</th><th>Expires</th><th>Active</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((coupon) => (
            <tr key={coupon.id} className="border-b border-line/60">
              <td className="py-2 font-medium">{coupon.code}</td>
              <td className="text-xs">{coupon.type.replace(/_/g, " ")}</td>
              <td>{coupon.type === "fixed" ? formatXAF(coupon.value) : coupon.type === "percentage" ? `${coupon.value}%` : "—"}</td>
              <td>{coupon.timesUsed}{coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}</td>
              <td className="text-xs text-muted">{coupon.expiresAt ? formatDate(coupon.expiresAt) : "No expiry"}</td>
              <td>
                <form action={toggleCouponAction}>
                  <input type="hidden" name="id" value={coupon.id} />
                  <input type="hidden" name="isActive" value={String(coupon.isActive)} />
                  <button className="chip">{coupon.isActive ? "Active — switch off" : "Off — switch on"}</button>
                </form>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
