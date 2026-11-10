import type { Metadata } from "next";
import { desc } from "drizzle-orm";
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
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-widest text-accent font-semibold">Concierge Intelligence</span>
          <h1 className="display text-3xl font-medium tracking-tight text-ink mt-0.5">AI Gaps & Training</h1>
          <p className="mt-1 text-sm text-ink-soft">
            Questions where the Concierge had low certainty or missing catalogue information.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-paper px-3 py-1 text-xs text-ink-soft shadow-2xs">
            <span className={`h-2 w-2 rounded-full ${open > 0 ? "bg-amber-500 animate-pulse" : "bg-emerald-500"}`} />
            {open} Open · {gaps.length} Total Logged
          </span>
        </div>
      </div>

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
}: Props) {
  return (
    <div className="card rounded-2xl border border-line bg-paper shadow-xs overflow-hidden">
      <div className="p-4 border-b border-line/60 bg-canvas/40 flex items-center justify-between text-xs">
        <span className="font-semibold uppercase tracking-wider text-muted">Concierge Query Logs</span>
        <span className="text-muted">Last 100 entries</span>
      </div>
      <div className="h-[70vh] overflow-y-auto space-y-3 p-5 divide-y divide-line/30">
        {gaps.length === 0 ? (
          <p className="text-sm text-muted text-center py-16">
            No unanswered questions logged yet — the concierge is performing well.
          </p>
        ) : (
          gaps.map((g) => {
            const resolvedByStaff = g.status === "resolved";
            return (
              <div
                key={g.id}
                className={`rounded-xl border p-4 text-xs transition-colors pt-4 ${
                  resolvedByStaff
                    ? "border-emerald-200 bg-emerald-50/30"
                    : "border-line bg-canvas/30"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-sm text-ink">{g.question}</p>
                    <p className="text-[11px] text-muted mt-0.5">
                      {new Date(g.createdAt).toLocaleString()} · Locale: <span className="uppercase font-semibold">{g.locale || "EN"}</span>
                    </p>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider uppercase ${
                    resolvedByStaff
                      ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                      : "bg-amber-100 text-amber-800 border border-amber-300"
                  }`}>
                    {resolvedByStaff ? "Resolved" : "Open Gap"}
                  </span>
                </div>

                <div className="mt-3 space-y-1.5 text-xs text-ink-soft leading-relaxed bg-paper rounded-lg p-3 border border-line/60">
                  <p>
                    <span className="font-semibold text-ink">Detected intent:</span> {g.detectedIntent}
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Search queried:</span> {g.searchPerformed}
                  </p>
                  <p className="truncate">
                    <span className="font-semibold text-ink">Catalogue result:</span>{" "}
                    {g.searchResult.split("\n")[0]}
                  </p>
                  <p>
                    <span className="font-semibold text-ink">Gap trigger reason:</span> {g.reason}
                  </p>
                  {resolvedByStaff && g.resolvedAnswer ? (
                    <p className="border-t border-line pt-2 mt-2 font-medium text-emerald-900">
                      <span>Approved concierge response:</span> {g.resolvedAnswer.slice(0, 400)}
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
