"use client";

import { useRef, useState } from "react";
import Link from "next/link";

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
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const selected = messages.find((m) => m.id === selectedId);

  function sendReply() {
    if (!selectedId || !replyText.trim()) return;
    setSending(true);
    // Use a hidden form to post to the message endpoint
    const form = document.createElement("form");
    form.method = "POST";
    form.action = "/api/contact-reply";
    const idInput = document.createElement("input");
    idInput.type = "hidden";
    idInput.name = "messageId";
    idInput.value = String(selectedId);
    const replyInput = document.createElement("input");
    replyInput.type = "hidden";
    replyInput.name = "reply";
    replyInput.value = replyText;
    form.appendChild(idInput);
    form.appendChild(replyInput);
    document.body.appendChild(form);
    form.addEventListener("submit", () => setSending(false));
    form.submit();
  }

  // Auto-focus textarea when a message is selected
  useState(() => {
    if (selectedId && textareaRef.current) {
      textareaRef.current.focus();
    }
  });

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      {/* Message list */}
      <div className="card overflow-hidden">
        <div className="h-96 overflow-y-auto space-y-2 p-3">
          {messages.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => {
                setSelectedId(m.id);
                setReplyText("");
              }}
              className={`w-full text-left border rounded-lg p-4 transition-colors text-sm ${
                selectedId === m.id
                  ? "border-ink bg-paper"
                  : "border-transparent hover:bg-accent-soft/30"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{m.name}</span>
                    <span className="text-xs text-muted">
                      {new Date(m.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-ink-soft mt-0.5 break-all">{m.contact}</p>
                </div>
                {!m.handled && (
                  <span className="text-xs text-accent font-medium flex-shrink-0">
                    New
                  </span>
                )}
              </div>
              <p className="mt-2 text-xs text-ink-soft leading-relaxed line-clamp-2">
                {m.message}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Reply panel */}
      <div className="card p-5 flex flex-col">
        {selected ? (
          <>
            <div className="mb-5">
              <h3 className="font-medium text-ink">{selected.name}</h3>
              <p className="text-sm text-ink-soft">{selected.contact}</p>
            </div>

            <div className="rounded-lg border border-line bg-paper p-4 mb-5 text-sm flex-1">
              <p className="text-ink-soft leading-relaxed whitespace-pre-wrap">{selected.message}</p>
            </div>

            <h4 className="text-sm font-medium text-ink mb-2">Your reply</h4>
            <textarea
              ref={textareaRef}
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              rows={6}
              className="field resize-none"
              placeholder="Type your reply here…"
            />

            {lastReplyOk && lastReplyMessageId === String(selectedId) && (
              <p className="mt-3 text-xs text-accent">Reply sent successfully.</p>
            )}
            {lastReplyError && lastReplyMessageId === String(selectedId) && (
              <p className="mt-3 text-xs text-red-600">Failed to send. Please try again.</p>
            )}

            <button
              onClick={sendReply}
              className="btn btn-primary mt-3"
              disabled={sending || !replyText.trim()}
            >
              {sending ? "Sending…" : "Send reply"}
            </button>

            <p className="mt-3 text-xs text-muted">
              The reply will be sent via email (if available) and WhatsApp (if phone number).
            </p>
          </>
        ) : (
          <div className="py-10 text-center text-sm text-muted flex-1 flex flex-col items-center justify-center gap-3">
            <p>Select a message to read and reply to it.</p>
            <Link
              href="/contact"
              className="btn btn-ghost btn-sm"
              target="_blank"
              rel="noreferrer"
            >
              Open contact page
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
