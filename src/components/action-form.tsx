"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import type { ActionState } from "@/lib/actions";

const initial: ActionState = { ok: false, message: "" };

export function ActionForm({
  action,
  children,
  submitLabel = "Save",
  className = "",
  compact = false,
}: {
  action: (prev: ActionState, formData: FormData) => Promise<ActionState>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState(action, initial);
  return (
    <form action={formAction} className={className}>
      {children}
      <div className={`flex items-center gap-3 ${compact ? "mt-3" : "mt-6"}`}>
        <button className={`btn btn-primary ${compact ? "btn-sm" : ""}`} disabled={pending}>
          {pending ? "Saving…" : submitLabel}
        </button>
        {state.message ? (
          <span className={`text-xs ${state.ok ? "text-accent" : "text-red-600"}`}>{state.message}</span>
        ) : null}
      </div>
    </form>
  );
}
