"use client";

import { useActionState } from "react";
import { saveAddressAction, updateProfileAction, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function AddressForm() {
  const [state, action, pending] = useActionState(saveAddressAction, initial);
  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="label">Label</label>
        <input id="label" name="label" defaultValue="Home" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="fullName">Recipient name</label>
        <input id="fullName" name="fullName" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="city">City</label>
        <input id="city" name="city" defaultValue="Douala" className="field" />
      </div>
      <div>
        <label className="label" htmlFor="area">Neighbourhood</label>
        <input id="area" name="area" className="field" placeholder="Ange Raphael" />
      </div>
      <div>
        <label className="label" htmlFor="street">Street & landmark</label>
        <input id="street" name="street" className="field" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="notes">Notes for the courier</label>
        <input id="notes" name="notes" className="field" />
      </div>
      <div className="sm:col-span-2">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save address"}</button>
        {state.message ? (
          <span className={`ml-3 text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}

export function ProfileForm({ fullName, phone, email }: { fullName: string; phone: string; email: string }) {
  const [state, action, pending] = useActionState(updateProfileAction, initial);
  return (
    <form action={action} className="card grid gap-4 p-6 sm:grid-cols-2">
      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" defaultValue={fullName} className="field" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" defaultValue={phone} className="field" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="emailRO">Email</label>
        <input id="emailRO" defaultValue={email} disabled className="field opacity-70" />
      </div>
      <div className="sm:col-span-2">
        <label className="label" htmlFor="password">New password (leave blank to keep current)</label>
        <input id="password" name="password" type="password" className="field" autoComplete="new-password" />
      </div>
      <div className="sm:col-span-2">
        <button className="btn btn-primary" disabled={pending}>{pending ? "Saving…" : "Save changes"}</button>
        {state.message ? (
          <span className={`ml-3 text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
