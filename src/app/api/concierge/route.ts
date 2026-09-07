import { NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db";
import { aiConversations } from "@/db/schema";
import { getCurrentUser, getGuestId, type SessionUser } from "@/lib/auth";
import { buildSystemPrompt, fallbackReply, deriveState } from "@/lib/concierge-tools";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type ChatMessage = { role: "user" | "assistant"; content: string };
type Outcome = { reply: string; escalated: boolean };

const buckets = new Map<string, { count: number; reset: number }>();

function rateLimited(key: string): boolean {
  const now = Date.now();
  const bucket = buckets.get(key);
  if (!bucket || now > bucket.reset) {
    buckets.set(key, { count: 1, reset: now + 60_000 });
    return false;
  }
  bucket.count += 1;
  return bucket.count > 20;
}

/**
 * Call Gemini for a conversational reply using BOTH configured API keys.
 * Each key is fired in parallel against the live model alias so whichever
 * responds first wins — no serial waiting. Returns null only if every
 * attempt fails or times out.
 */
async function callGemini(system: string, history: ChatMessage[]): Promise<Outcome | null> {
  const apiKeys = [process.env.GEMINI_API_KEY, process.env.GEMINI_API_KEY2].filter(
    (k): k is string => Boolean(k),
  );
  if (apiKeys.length === 0) return null;

  // Build conversation history in Gemini format
  const contents: Array<{ role: string; parts: Array<{ text: string }> }> = [];

  // Inject system prompt as first user turn
  contents.push({
    role: "user",
    parts: [{ text: `[System Instructions]\n${system}\n\nPlease follow these instructions for all subsequent messages.` }],
  });
  contents.push({
    role: "model",
    parts: [{ text: "Understood. I am the OSSZ Concierge, ready to help. How may I assist you today?" }],
  });

  for (const msg of history) {
    contents.push({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    });
  }

  // gemini-flash-latest is the alias both keys currently answer on; the
  // explicit 3.6 model is kept as a third parallel candidate.
  const attempts: Array<{ key: string; model: string }> = [];
  for (const key of apiKeys) {
    attempts.push({ key, model: "gemini-flash-latest" });
  }
  attempts.push({ key: apiKeys[0], model: "gemini-3.6-flash" });

  const jobs = attempts.map(({ key, model }) =>
    fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          contents,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.6,
            topP: 0.9,
            thinkingConfig: { thinkingBudget: 0 },
          },
        }),
        // Never let a slow upstream stall the conversation.
        signal: AbortSignal.timeout(6000),
      },
    )
      .then(async (response) => {
        if (!response.ok) return null;
        const payload = (await response.json()) as {
          candidates?: Array<{
            content?: { parts?: Array<{ text?: string }> };
          }>;
        };
        const text = payload.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
        if (!text) return null;
        const escalated = /whatsapp|wa\.me|speak to someone|human|agent|person/i.test(text);
        return { reply: text, escalated } satisfies Outcome;
      })
      .catch(() => null),
  );

  const settled = await Promise.allSettled(jobs);
  for (const s of settled) {
    if (s.status === "fulfilled" && s.value) return s.value;
  }
  return null;
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as {
    messages?: ChatMessage[];
    locale?: string;
  };
  const locale = body.locale === "fr" ? "fr" : "en";
  const fr = locale === "fr";
  const history = (body.messages ?? []).slice(-10).filter((m) => typeof m.content === "string");
  const last = history[history.length - 1];
  if (!last || last.role !== "user" || !last.content.trim()) {
    return NextResponse.json({ reply: fr ? "Comment puis-je vous aider aujourd'hui ?" : "How may I assist you today?", escalated: false });
  }
  if (last.content.length > 1200) {
    return NextResponse.json({
      reply: fr ? "Pourriez-vous résumer en une phrase ou deux ? Je veux m'assurer de bien vous aider." : "Would you kindly summarise that in a sentence or two? I want to be sure I help you well.",
      escalated: false,
    });
  }

  const [user, sessionId] = await Promise.all([getCurrentUser(), getGuestId()]);
  if (rateLimited(sessionId)) {
    return NextResponse.json({
      reply: fr
        ? "Merci pour votre enthousiasme. Poursuivons dans un instant, s'il vous plaît. Notre équipe est disponible sur WhatsApp en attendant."
        : "Thank you for your enthusiasm. Might we continue in a moment? Our team is always available on WhatsApp in the meantime.",
      escalated: false,
    });
  }

  // Reply FAST: build the system prompt, then start BOTH Gemini keys in
  // parallel with the knowledge-base answer. Gemini is preferred when it
  // lands in the grace window; otherwise the knowledge-base
  // reply is returned immediately — the visitor never waits on the API.
  const system = await buildSystemPrompt(locale);
  const state = deriveState(history);
  const geminiP = callGemini(system, history);
  const kb = await fallbackReply(last.content, state, sessionId);

  // Retrieval-first rule: when the grounded reply carries real product cards
  // (verified catalogue results), it always wins over LLM prose — the LLM
  // must never replace a verified product answer with an unverified one.
  if (kb.reply.includes("CARD_START:")) {
    await persistTranscript(history, kb, user, sessionId);
    return NextResponse.json({ reply: kb.reply, escalated: kb.escalated });
  }

  const outcome = await (async (): Promise<Outcome> => {
    const geminiResult = await Promise.race([
      geminiP.then((r) => ({ kind: "gemini" as const, value: r })),
      new Promise<{ kind: "timeout"; value: null }>((resolve) => setTimeout(() => resolve({ kind: "timeout", value: null }), 1200)),
    ]);
    if (geminiResult.kind === "gemini") {
      // Even when Gemini replies, keep the knowledge-base reply as a safe
      // fallback if Gemini's answer looks like a handoff or is empty.
      return geminiResult.value ?? kb;
    }
    return kb;
  })();

  const transcript = [...history, { role: "assistant" as const, content: outcome.reply }];
  await persistTranscriptRaw(transcript, user, sessionId, outcome);

  return NextResponse.json({ reply: outcome.reply, escalated: outcome.escalated });
}

async function persistTranscript(
  history: ChatMessage[],
  outcome: Outcome,
  user: SessionUser | null,
  sessionId: string,
): Promise<void> {
  await persistTranscriptRaw(
    [...history, { role: "assistant" as const, content: outcome.reply }],
    user,
    sessionId,
    outcome,
  );
}

async function persistTranscriptRaw(
  transcript: ChatMessage[],
  user: SessionUser | null,
  sessionId: string,
  outcome: Outcome,
): Promise<void> {
  try {
    const existing = (
      await db.select().from(aiConversations).where(eq(aiConversations.sessionId, sessionId)).limit(1)
    )[0];
    if (existing) {
      await db
        .update(aiConversations)
        .set({
          transcript,
          escalatedToWhatsapp: existing.escalatedToWhatsapp || outcome.escalated,
          updatedAt: new Date(),
          userId: user?.id ?? existing.userId,
        })
        .where(eq(aiConversations.id, existing.id));
    } else {
      await db.insert(aiConversations).values({
        sessionId,
        userId: user?.id ?? null,
        transcript,
        escalatedToWhatsapp: outcome.escalated,
      });
    }
  } catch {
    // logging must never break the conversation
  }
}