"use client";

import { useActionState } from "react";
import { applyCoupon, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function CouponForm({ current }: { current: string | null }) {
  const [state, action, pending] = useActionState(applyCoupon, initial);
  return (
    <form action={action} className="mt-5">
      <label className="label" htmlFor="coupon">
        Coupon code
      </label>
      <div className="flex gap-2">
        <input id="coupon" name="code" defaultValue={current ?? ""} placeholder="WELCOME10" className="field" />
        <button className="btn btn-secondary btn-sm" disabled={pending}>
          {pending ? "…" : "Apply"}
        </button>
      </div>
      {state.message ? (
        <p className={`mt-2 text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
