"use client";

import { useState } from "react";
import Link from "next/link";
import { deleteNotificationAction } from "@/lib/admin-actions";
import { formatDateTime, waLink } from "@/lib/utils";

type NotificationRow = {
  n: {
    id: number;
    orderId: number | null;
    appointmentId: number | null;
    channel: string;
    recipient: string;
    subject: string;
    body: string;
    status: string;
    error: string;
    createdAt: Date;
  };
  orderNumber: string | null;
};

interface NotificationArchiveListProps {
  rows: NotificationRow[];
}

export function NotificationArchiveList({ rows }: NotificationArchiveListProps) {
  const [filter, setFilter] = useState<"all" | "sent" | "queued" | "failed">("all");
  const [search, setSearch] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filtered = rows.filter((r) => {
    if (filter === "sent" && r.n.status !== "sent") return false;
    if (filter === "queued" && r.n.status !== "queued") return false;
    if (filter === "failed" && r.n.status !== "failed") return false;

    if (search.trim()) {
      const q = search.toLowerCase();
      const matchRecipient = r.n.recipient.toLowerCase().includes(q);
      const matchSubject = r.n.subject.toLowerCase().includes(q);
      const matchBody = r.n.body.toLowerCase().includes(q);
      const matchOrder = r.orderNumber ? r.orderNumber.toLowerCase().includes(q) : false;
      return matchRecipient || matchSubject || matchBody || matchOrder;
    }
    return true;
  });

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this message record from the archive? This action cannot be undone.")) {
      return;
    }
    setDeletingId(id);
    const fd = new FormData();
    fd.append("id", String(id));
    try {
      await deleteNotificationAction(fd);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 bg-paper border border-line rounded-xl shadow-xs">
          {(["all", "sent", "queued", "failed"] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === tab
                  ? "bg-ink text-white shadow-xs"
                  : "text-ink-soft hover:text-ink hover:bg-canvas"
              }`}
            >
              {tab === "all" ? `All (${rows.length})` : tab}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search recipient, order, text…"
            className="field !py-1.5 !px-3 text-xs w-full sm:w-64 rounded-xl"
          />
        </div>
      </div>

      {/* List */}
      {filtered.length === 0 ? (
        <div className="card p-8 text-center rounded-2xl">
          <p className="text-sm text-muted">No messages found matching your criteria.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {filtered.map(({ n, orderNumber }) => {
            const isSent = n.status === "sent";
            const isFailed = n.status === "failed";
            const isQueued = n.status === "queued";

            return (
              <li
                key={n.id}
                className="card p-5 rounded-2xl border border-line/80 hover:border-accent/30 transition-all bg-paper shadow-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/60 pb-3 mb-3">
                  <div className="flex items-center gap-2.5">
                    <span className="chip !rounded-full !px-2.5 !py-0.5 text-[10px] tracking-wider uppercase font-medium bg-canvas">
                      {n.channel}
                    </span>
                    {orderNumber ? (
                      <Link
                        href={`/admin/orders?status=`}
                        className="text-xs font-medium text-accent hover:underline"
                      >
                        Order #{orderNumber}
                      </Link>
                    ) : null}
                    <span className="text-xs text-ink-soft font-mono">{n.recipient}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                        isSent
                          ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                          : isFailed
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-amber-50 text-amber-800 border border-amber-200"
                      }`}
                    >
                      {n.status}
                    </span>
                    <span className="text-[11px] text-muted">{formatDateTime(n.createdAt)}</span>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={deletingId === n.id}
                      onClick={() => handleDelete(n.id)}
                      className="text-xs text-red-600 hover:text-red-800 hover:underline transition-colors pl-2 border-l border-line"
                    >
                      {deletingId === n.id ? "Deleting…" : "Delete"}
                    </button>
                  </div>
                </div>

                {n.subject ? <p className="font-medium text-sm text-ink mb-1">{n.subject}</p> : null}
                <p className="whitespace-pre-wrap text-xs leading-relaxed text-ink-soft bg-canvas/40 p-3 rounded-lg border border-line/50">
                  {n.body}
                </p>

                {n.error ? (
                  <p className="mt-2 text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                    Delivery error: {n.error}
                  </p>
                ) : null}

                {isQueued && n.channel !== "email" && n.recipient ? (
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={waLink(n.recipient, n.body)}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-secondary btn-sm !py-1 !px-3 text-xs"
                    >
                      Send on WhatsApp
                    </a>
                  </div>
                ) : null}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
