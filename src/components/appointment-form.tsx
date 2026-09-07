"use client";

import { useActionState, useState } from "react";
import { bookAppointmentAction, type ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };
const SLOTS = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "12:00", "12:30", "13:00", "13:30", "14:00", "14:30", "15:00", "15:30", "16:00", "16:30", "17:00", "17:30"];
const SERVICES = ["Styling session", "Fitting", "Bridal consultation", "Made-to-measure"];

export function AppointmentForm({ takenSlots }: { takenSlots: string[] }) {
  const [state, action, pending] = useActionState(bookAppointmentAction, initial);
  const today = new Date();
  const min = today.toISOString().slice(0, 10);
  const [date, setDate] = useState(min);
  const [time, setTime] = useState("");

  // After successful submission, show confirmation
  if (state.ok && state.message) {
    return (
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/10">
          <svg className="h-8 w-8 text-accent" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        </div>
        <h2 className="display text-2xl">Appointment Requested</h2>
        <p className="mt-3 text-sm leading-relaxed text-ink-soft">{state.message}</p>
        <p className="mt-4 text-xs text-muted">
          A confirmation has been sent to your contact. Our team will review and confirm shortly.
        </p>
        <a href="/" className="btn btn-secondary mt-6 inline-block">
          Back to home
        </a>
      </div>
    );
  }

  return (
    <form action={action} className="card space-y-5 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="name">Your name</label>
          <input id="name" name="name" required className="field" />
        </div>
        <div>
          <label className="label" htmlFor="contact">Phone or email</label>
          <input id="contact" name="contact" required className="field" />
        </div>
      </div>

      <div>
        <label className="label" htmlFor="service">What would you like?</label>
        <select id="service" name="service" className="field">
          {SERVICES.map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div>
        <label className="label" htmlFor="date">Preferred date</label>
        <input
          id="date" name="date" type="date" min={min} value={date}
          onChange={(e) => setDate(e.target.value)} required className="field"
        />
      </div>

      <div>
        <p className="label">Preferred time</p>
        <div className="flex flex-wrap gap-2">
          {SLOTS.map((slot) => {
            const taken = takenSlots.includes(`${date}T${slot}`);
            return (
              <button
                key={slot}
                type="button"
                disabled={taken}
                onClick={() => setTime(slot)}
                className={`chip ${time === slot ? "chip-active" : ""} ${taken ? "opacity-40 line-through" : ""}`}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <input type="hidden" name="time" value={time} />
      </div>

      <div>
        <label className="label" htmlFor="notes">Anything we should know? (optional)</label>
        <textarea id="notes" name="notes" rows={3} className="field" placeholder="The occasion, a piece you have seen, sizing concerns…" />
      </div>

      <button className="btn btn-primary w-full" disabled={pending || !time}>
        {pending ? "Requesting…" : "Request this appointment"}
      </button>
      {state.message && !state.ok ? (
        <p className={`text-sm ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</p>
      ) : null}
    </form>
  );
}
