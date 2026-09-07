<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AiConversation;
use App\Support\Concierge;
use Illuminate\Http\Request;

/**
 * Concierge chat endpoint — port of src/app/api/concierge/route.ts.
 * Replies from Gemini when a key is configured, otherwise from the
 * deterministic knowledge base. Product-card answers always win.
 */
class ConciergeController extends Controller
{
    public function reply(Request $request)
    {
        $payload = $request->json()->all();
        $locale = (($payload['locale'] ?? 'en') === 'fr') ? 'fr' : 'en';
        $history = collect($payload['messages'] ?? [])
            ->filter(fn ($m) => is_string($m['content'] ?? null))
            ->slice(-10)
            ->values()
            ->all();

        $last = $history ? end($history) : null;
        if (! $last || ($last['role'] ?? '') !== 'user' || trim((string) $last['content']) === '') {
            return response()->json([
                'reply' => $locale === 'fr' ? "Comment puis-je vous aider aujourd'hui ?" : 'How may I assist you today?',
                'escalated' => false,
            ]);
        }

        $message = (string) $last['content'];
        if (mb_strlen($message) > 1200) {
            return response()->json([
                'reply' => $locale === 'fr'
                    ? 'Pourriez-vous résumer en une phrase ou deux ? Je veux m\'assurer de bien vous aider.'
                    : 'Would you kindly summarise that in a sentence or two? I want to be sure I help you well.',
                'escalated' => false,
            ]);
        }

        // Simple session rate limit: 20 replies per minute per session.
        $sessionId = session()->getId();
        $key = 'ossz.concierge.'.$sessionId;
        $hits = (int) cache()->get($key, 0) + 1;
        cache()->put($key, $hits, now()->addMinute());
        if ($hits > 20) {
            return response()->json([
                'reply' => $locale === 'fr'
                    ? 'Merci pour votre enthousiasme. Poursuivons dans un instant, s\'il vous plaît. Notre équipe est disponible sur WhatsApp en attendant.'
                    : 'Thank you for your enthusiasm. Might we continue in a moment? Our team is always available on WhatsApp in the meantime.',
                'escalated' => false,
            ]);
        }

        $user = \App\Models\User::find(session('user_id'));
        $system = Concierge::systemPrompt($locale);
        $state = Concierge::deriveState($history);

        // Retrieval-first: verified product cards always win over LLM prose.
        $kb = Concierge::knowledgeReply($message, $state, $locale, $sessionId);
        if (str_contains($kb['reply'], 'CARD_START:')) {
            $this->persist($history, $kb['reply'], $kb['escalated'], $user, $sessionId);

            return response()->json($kb);
        }

        $reply = Concierge::gemini($system, $history, $locale) ?? $kb['reply'];
        $escalated = (bool) preg_match('/whatsapp|wa\.me|speak to someone|human|agent|person/i', $reply);

        $this->persist($history, $reply, $escalated, $user, $sessionId);

        return response()->json(['reply' => $reply, 'escalated' => $escalated]);
    }

    /** Product JSON for the quick-view popup — port of api/product/[slug]. */
    public function productJson(string $slug)
    {
        $data = \App\Support\ProductQuery::bySlug($slug);
        if (! $data) {
            return response()->json(['error' => 'Not found'], 404);
        }
        $p = $data['product'];

        return response()->json([
            'id' => $p->id,
            'name' => pick($p->name, $p->name_fr),
            'slug' => $p->slug,
            'basePrice' => (int) $p->base_price,
            'description' => pick($p->description, $p->description_fr),
            'images' => $data['images']->pluck('url')->all(),
            'variants' => $data['variants']->map(fn ($v) => [
                'id' => $v->id,
                'size' => $v->size,
                'colour' => $v->colour,
                'stockQty' => (int) $v->stock_qty,
                'price' => (int) ($v->price_override ?? $p->base_price),
            ])->all(),
        ]);
    }

    private function persist(array $history, string $reply, bool $escalated, $user, string $sessionId): void
    {
        try {
            $transcript = array_merge($history, [['role' => 'assistant', 'content' => $reply]]);
            $conversation = AiConversation::where('session_id', $sessionId)->first();
            if ($conversation) {
                $conversation->update([
                    'transcript' => $transcript,
                    'escalated_to_whatsapp' => $conversation->escalated_to_whatsapp || $escalated,
                    'user_id' => $user->id ?? $conversation->user_id,
                ]);
            } else {
                AiConversation::create([
                    'session_id' => $sessionId,
                    'user_id' => $user->id ?? null,
                    'transcript' => $transcript,
                    'escalated_to_whatsapp' => $escalated,
                ]);
            }
        } catch (\Throwable) {
            // logging must never break the conversation
        }
    }
}
