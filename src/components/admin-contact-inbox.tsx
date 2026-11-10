"use client";

import { useRef, useState } from "react";
import { formatDateTime } from "@/lib/utils";

type Message = {
  id: number;
  name: string;
  contact: string;
  message: string;
  handled: boolean;
  createdAt: Date;
};

interface Props {
  messages: Message[];
  lastReplyMessageId?: string;
  lastReplyOk?: string;
  lastReplyError?: string;
}

export function AdminContactInbox({
  messages,
  lastReplyMessageId,
  lastReplyOk,
  lastReplyError,
}: Props) {
  const [selectedId, setSelectedId] = useState<number | null>(messages[0]?.id ?? null);
  const [subject, setSubject] = useState("Re: Regarding your message to OSSZ Collections");
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ ok: boolean; text: string } | null>(
    lastReplyOk
      ? { ok: true, text: "Reply successfully sent and logged!" }
      : lastReplyError
      ? { ok: false, text: "Error sending reply. Please try again." }
      : null
  );

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const selected = messages.find((m) => m.id === selectedId);

  async function handleSendReply(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId || !replyText.trim()) return;

    setSending(true);
    setStatusMessage(null);

    const formData = new FormData();
    formData.append("messageId", String(selectedId));
    formData.append("subject", subject);
    formData.append("reply", replyText);

    try {
      const res = await fetch("/api/contact-reply", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Failed to send response.");
      }

      setStatusMessage({
        ok: true,
        text: `Reply sent successfully to ${selected?.contact}!`,
      });
      setReplyText("");
      // Mark local message as handled
      if (selected) {
        selected.handled = true;
      }
    } catch (err: unknown) {
      setStatusMessage({
        ok: false,
        text: err instanceof Error ? err.message : "Error sending reply.",
      });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_420px]">
      {/* Message list */}
      <div className="card rounded-2xl overflow-hidden bg-paper border border-line shadow-xs">
        <div className="p-4 border-b border-line bg-canvas/30 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted">
            Customer Inquiries ({messages.length})
          </span>
          <span className="text-xs text-muted">
            {messages.filter((m) => !m.handled).length} unread
          </span>
        </div>

        <div className="max-h-[600px] overflow-y-auto divide-y divide-line/60">
          {messages.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted">No messages received yet.</div>
          ) : (
            messages.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => {
                  setSelectedId(m.id);
                  setSubject(`Re: Regarding inquiry from ${m.name}`);
                  setStatusMessage(null);
                }}
                className={`w-full text-left p-4 transition-all ${
                  selectedId === m.id
                    ? "bg-accent-soft/50 border-l-4 border-accent"
                    : "hover:bg-canvas/50"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-ink">{m.name}</span>
                      {!m.handled ? (
                        <span className="rounded-full bg-accent text-white px-2 py-0.2 text-[10px] uppercase tracking-wider font-semibold">
                          New
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-ink-soft mt-0.5 font-mono">{m.contact}</p>
                  </div>
                  <span className="text-[11px] text-muted shrink-0">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
                <p className="mt-2 text-xs text-ink-soft line-clamp-2 leading-relaxed">
                  {m.message}
                </p>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Reply Workspace Panel */}
      <div className="card rounded-2xl p-6 bg-paper border border-line shadow-xs flex flex-col justify-between">
        {selected ? (
          <form onSubmit={handleSendReply} className="space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <span className="eyebrow">Customer Details</span>
                {selected.handled ? (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Handled
                  </span>
                ) : (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                    Awaiting Response
                  </span>
                )}
              </div>
              <h3 className="display text-xl mt-1 text-ink">{selected.name}</h3>
              <p className="text-xs font-mono text-ink-soft mt-0.5">{selected.contact}</p>
            </div>

            {/* Original message view */}
            <div>
              <label className="text-xs font-medium text-muted uppercase tracking-wider block mb-1.5">
                Original Message
              </label>
              <div className="rounded-xl border border-line bg-canvas/40 p-3.5 text-xs text-ink leading-relaxed whitespace-pre-wrap max-h-44 overflow-y-auto">
                {selected.message}
              </div>
            </div>

            {/* Subject */}
            <div>
              <label className="label" htmlFor="reply-subject">Subject</label>
              <input
                id="reply-subject"
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="field text-xs"
                required
              />
            </div>

            {/* Reply textarea */}
            <div>
              <label className="label" htmlFor="reply-body">Compose Response</label>
              <textarea
                id="reply-body"
                ref={textareaRef}
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                rows={5}
                required
                className="field text-xs resize-none"
                placeholder={`Write your response to ${selected.name}…`}
              />
            </div>

            {statusMessage ? (
              <div
                className={`p-3 rounded-xl text-xs ${
                  statusMessage.ok
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {statusMessage.text}
              </div>
            ) : null}

            <div className="pt-2">
              <button
                type="submit"
                disabled={sending || !replyText.trim()}
                className="btn btn-primary w-full text-xs shadow-xs"
              >
                {sending ? "Sending Reply…" : "Send Email Response"}
              </button>
              <p className="text-[11px] text-muted text-center mt-2">
                Sends through configured OSSZ SMTP mailer and logs to customer messages.
              </p>
            </div>
          </form>
        ) : (
          <div className="flex flex-col items-center justify-center py-16 text-center text-muted text-sm">
            Select a message to view details and reply.
          </div>
        )}
      </div>
    </div>
  );
}
