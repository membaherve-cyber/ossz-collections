"use client";

import { useActionState } from "react";
import { newsletterAction, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function NewsletterForm() {
  const [state, action, pending] = useActionState(newsletterAction, initial);
  return (
    <form action={action} className="mt-4">
      <label className="sr-only" htmlFor="newsletter-email">
        Email address
      </label>
      <div className="flex gap-2">
        <input
          id="newsletter-email"
          name="email"
          type="email"
          required
          placeholder="your@email.com"
          className="field"
        />
        <button className="btn btn-primary btn-sm whitespace-nowrap" disabled={pending}>
          {pending ? "…" : "Join"}
        </button>
      </div>
      {state.message ? (
        <p className={`mt-2 text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
