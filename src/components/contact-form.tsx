"use client";

import { useActionState } from "react";
import { contactAction, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function ContactForm() {
  const [state, action, pending] = useActionState(contactAction, initial);
  return (
    <form action={action} className="card space-y-4 p-6">
      <div>
        <label className="label" htmlFor="name">Your name</label>
        <input id="name" name="name" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="contact">Email or phone</label>
        <input id="contact" name="contact" required className="field" />
      </div>
      <div>
        <label className="label" htmlFor="message">How may we help?</label>
        <textarea id="message" name="message" rows={5} required className="field" />
      </div>
      <button className="btn btn-primary w-full" disabled={pending}>
        {pending ? "Sending…" : "Send message"}
      </button>
      {state.message ? (
        <p className={`text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
