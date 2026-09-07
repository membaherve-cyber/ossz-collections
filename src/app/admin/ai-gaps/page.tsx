import type { Metadata } from "next";
import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/db";
import { aiGaps } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export const metadata: Metadata = { title: "AI Gaps — Admin" };

export default async function AdminAiGapsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const session = await getCurrentUser();
  if (!session || (session.role !== "admin" && session.role !== "staff")) {
    redirect("/admin");
  }

  const gapIdParam =
    typeof params.gapId === "string" ? params.gapId : params.gapId?.[0] ?? undefined;
  const okParam = params.ok === "1";
  const errorParam = params.error === "1";

  const gaps = await db
    .select()
    .from(aiGaps)
    .orderBy(desc(aiGaps.createdAt))
    .limit(100);

  const open = gaps.filter((g) => g.status === "open").length;

  return (
    <div className="max-w-4xl">
      <header className="border-b border-ink/10 pb-6 mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="eyebrow">Questions the AI could not answer</p>
            <h1 className="display mt-1 text-2xl">AI Gaps</h1>
            <p className="text-sm text-ink-soft mt-1">
              {gaps.length} question{gaps.length !== 1 ? "s" : ""} · {open} still open
            </p>
          </div>
        </div>
      </header>

      <AiGapsInbox
        gaps={gaps}
        lastResolvedGapId={gapIdParam}
        lastResolveOk={okParam ? "1" : undefined}
        lastResolveError={errorParam ? "1" : undefined}
      />
    </div>
  );
}

type Gap = {
  id: number;
  sessionId: string;
  question: string;
  locale: string;
  detectedIntent: string;
  searchPerformed: string;
  searchResult: string;
  reason: string;
  resolvedAnswer: string;
  resolvedBy: number | null;
  status: string;
  createdAt: Date;
  updatedAt: Date;
};

interface Props {
  gaps: Gap[];
  lastResolvedGapId?: string;
  lastResolveOk?: string;
  lastResolveError?: string;
}

function AiGapsInbox({
  gaps,
  lastResolvedGapId,
  lastResolveOk,
  lastResolveError,
}: Props) {
  // Server-rendered only; the team resolves gaps from the admin UI.
  // For now we render a readable list with the stored context. A staff
  // member can copy the question, search the catalogue, and add the approved
  // answer via the staffing toolchain (future: a resolve form here).
  return (
    <div className="card overflow-hidden">
      <div className="h-[70vh] overflow-y-auto space-y-3 p-3">
        {gaps.length === 0 ? (
          <p className="text-sm text-muted text-center pt-10">
            No unanswered questions yet — the concierge is doing well.
          </p>
        ) : (
          gaps.map((g) => {
            const resolvedByStaff = g.status === "resolved";
            return (
              <div
                key={g.id}
                className={`rounded-lg border p-4 text-sm transition-colors ${
                  resolvedByStaff
                    ? "border-green-600/40 bg-green-50/30"
                    : "border-line bg-paper"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-ink">{g.question}</p>
                    <p className="text-xs text-muted mt-0.5">
                      {new Date(g.createdAt).toLocaleString()} · {g.locale === "fr" ? "FR" : "EN"}
                    </p>
                  </div>
                  {!resolvedByStaff && (
                    <span className="text-xs text-accent font-medium flex-shrink-0">
                      Open
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1 text-xs text-ink-soft leading-relaxed">
                  <p>
                    <span className="text-muted">Intent:</span> {g.detectedIntent}
                  </p>
                  <p>
                    <span className="text-muted">Search performed:</span> {g.searchPerformed}
                  </p>
                  <p>
                    <span className="text-muted">Search result:</span>{" "}
                    {g.searchResult.split("\n")[0]}
                  </p>
                  <p>
                    <span className="text-muted">Reason:</span> {g.reason}
                  </p>
                  {resolvedByStaff && g.resolvedAnswer ? (
                    <p className="border-t border-line pt-2 mt-2">
                      <span className="text-muted">Approved answer:</span>{" "}
                      {g.resolvedAnswer.slice(0, 400)}
                    </p>
                  ) : null}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
