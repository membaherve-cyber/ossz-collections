"use client";

import Link from "next/link";
import { useActionState } from "react";
import {
  completePasswordResetAction,
  requestPasswordResetAction,
  type ActionState,
} from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function RequestResetForm() {
  const [state, action, pending] = useActionState(requestPasswordResetAction, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Email me a reset link"}
      </button>
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      <p className="text-center text-xs text-muted">
        <Link href="/login" className="text-accent link-underline">Back to sign in</Link>
      </p>
    </form>
  );
}

export function CompleteResetForm({ token }: { token: string }) {
  const [state, action, pending] = useActionState(completePasswordResetAction, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="token" value={token} />
      <div>
        <label className="label" htmlFor="password">New password</label>
        <input
          id="password"
          name="password"
          type="password"
          minLength={6}
          required
          className="field"
          autoComplete="new-password"
        />
      </div>
      <button className="btn btn-primary w-full" disabled={pending || state.ok}>
        {pending ? "Saving…" : "Set my new password"}
      </button>
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
      {state.ok ? (
        <Link href="/login" className="btn btn-secondary w-full">Sign in</Link>
      ) : null}
    </form>
  );
}
