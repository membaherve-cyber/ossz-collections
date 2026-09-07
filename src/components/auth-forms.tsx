"use client";

import Link from "next/link";
import { useActionState } from "react";
import { loginAction, registerAction, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function LoginForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(loginAction, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="email">Email or username</label>
        <input id="email" name="email" type="text" required className="field" autoComplete="username" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password</label>
        <input id="password" name="password" type="password" required className="field" autoComplete="current-password" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Signing in…" : "Sign in"}</button>
      {state.message ? <p className="text-xs text-red-600">{state.message}</p> : null}
      <p className="text-center text-xs text-muted">
        <Link href="/forgot-password" className="text-accent link-underline">Forgotten your password?</Link>
      </p>
      <p className="text-center text-xs text-muted">
        New here? <Link href="/register" className="text-accent link-underline">Create an account</Link>
      </p>
    </form>
  );
}

export function RegisterForm({ next }: { next: string }) {
  const [state, action, pending] = useActionState(registerAction, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <input type="hidden" name="next" value={next} />
      <div>
        <label className="label" htmlFor="fullName">Full name</label>
        <input id="fullName" name="fullName" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="phone">Phone</label>
        <input id="phone" name="phone" className="field" placeholder="+237 6.. .. .. .." />
      </div>
      <div>
        <label className="label" htmlFor="email">Email</label>
        <input id="email" name="email" type="email" required className="field" autoComplete="email" />
      </div>
      <div>
        <label className="label" htmlFor="password">Password (6 characters or more)</label>
        <input id="password" name="password" type="password" minLength={6} required className="field" autoComplete="new-password" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>{pending ? "Creating…" : "Create my account"}</button>
      {state.message ? <p className="text-xs text-red-600">{state.message}</p> : null}
      <p className="text-center text-xs text-muted">
        Already with us? <Link href="/login" className="text-accent link-underline">Sign in</Link>
      </p>
    </form>
  );
}
