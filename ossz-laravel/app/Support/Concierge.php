<?php

namespace App\Support;

use App\Models\AiGap;
use App\Models\Appointment;
use App\Models\DeliveryZone;
use App\Models\Faq;
use App\Models\Order;
use App\Models\OrderItem;
use Illuminate\Support\Facades\Http;

/**
 * Concierge engine — port of src/lib/concierge-tools.ts.
 *
 * Deterministic keyword intents + catalogue search produce grounded
 * replies; Gemini (when configured) rewrites the wording. Product-card
 * replies are marked with CARD_START: so the endpoint prefers them over
 * any LLM prose, exactly as the Next.js retrieval-first rule required.
 */
final class Concierge
{
    private const CATEGORY_WORDS = [
        'dress' => 'ready-to-wear', 'gown' => 'ready-to-wear', 'kaftan' => 'kaftans',
        'agbada' => 'agbada', 'pantalon' => 'pants', 'pants' => 'pants', 'trouser' => 'pants',
        'trousers' => 'pants', 'chemise' => 'shirts', 'shirt' => 'shirts',
        'danshiki' => 'danshiki', 'dansiki' => 'danshiki', 'oversize' => 'oversize',
        'hat' => 'hats', 'chapeau' => 'hats', 'shoe' => 'shoes', 'shoes' => 'shoes',
        'sandale' => 'sandals', 'sandals' => 'sandals', 'sandali' => 'sandals',
        'cufflink' => 'cufflinks', 'bouton' => 'cufflinks', 'sac' => 'bags', 'bag' => 'bags',
        'cravate' => 'tie-cravate', 'tie' => 'tie-cravate', 'accessoire' => 'accessories',
    ];

    private const COLOUR_WORDS = [
        'noir' => 'Noir', 'black' => 'Noir', 'white' => 'Ivory', 'ivory' => 'Ivory',
        'camel' => 'Camel', 'beige' => 'Sand', 'sand' => 'Sand', 'cream' => 'Champagne',
        'champagne' => 'Champagne', 'amber' => 'Amber', 'gold' => 'Amber',
        'teal' => 'Teal', 'charcoal' => 'Charcoal', 'grey' => 'Slate', 'gray' => 'Slate',
        'midnight' => 'Midnight', 'navy' => 'Navy', 'marine' => 'Navy',
        'vert' => 'Olive', 'green' => 'Olive', 'khaki' => 'Khaki', 'mauve' => 'Mauve',
        'purple' => 'Mauve', 'rose' => 'Rose', 'pink' => 'Rose', 'bourgogne' => 'Burgundy',
        'burgundy' => 'Burgundy', 'rouge' => 'Burgundy', 'red' => 'Burgundy',
    ];

    private const OCCASION_WORDS = [
        'wedding' => 'wedding', 'mariage' => 'wedding', 'engagement' => 'engagement',
        'soiree' => 'evening', 'soirée' => 'evening', 'dinner' => 'dinner',
        'cocktail' => 'cocktail', 'gala' => 'gala', 'ceremony' => 'ceremony',
        'graduation' => 'graduation', 'church' => 'church', 'baptism' => 'baptism',
        'birthday' => 'birthday', 'anniversary' => 'anniversary', 'party' => 'party',
        'fete' => 'party', 'reception' => 'reception', 'office' => 'work',
        'work' => 'work', 'business' => 'work', 'casual' => 'casual',
        'vacation' => 'vacation', 'holiday' => 'vacation', 'beach' => 'beach',
        'travel' => 'travel', 'gift' => 'gift', 'cadeau' => 'gift',
    ];

    public static function systemPrompt(string $locale): string
    {
        $settings = Settings::all();
        $zones = DeliveryZone::where('is_active', true)->get()
            ->map(fn ($z) => "- {$z->name}: ".format_xaf($z->fee)." ({$z->eta_label})")
            ->implode("\n");
        $faqs = Faq::orderBy('sort_order')->limit(12)
            ->map(fn ($f) => "- Q: ".pick($f->question, $f->question_fr)."\n  A: ".pick($f->answer, $f->answer_fr))
            ->implode("\n");

        $prompt = $locale === 'fr'
            ? "Tu es le Concierge OSSZ, l'assistant clientèle d'une maison de mode à Douala, au Cameroun. "
            : 'You are the OSSZ Concierge, the client assistant of a fashion house in Douala, Cameroon. ';

        return $prompt
            .($locale === 'fr'
                ? "Réponds avec chaleur et concision (2 à 4 phrases). N'invente jamais de prix ou de stock — cite uniquement le catalogue fourni. Si la question sort de ton domaine, propose WhatsApp.\n\nBoutique : {$settings['store_address']}\nHoraires : {$settings['business_hours']}\nWhatsApp : {$settings['whatsapp_number']}\n\nZones de livraison :\n{$zones}\n\nFAQ :\n{$faqs}"
                : "Reply with warmth and brevity (2–4 sentences). Never invent prices or stock — cite only the catalogue you are given. If a question is outside your scope, offer WhatsApp.\n\nBoutique: {$settings['store_address']}\nHours: {$settings['business_hours']}\nWhatsApp: {$settings['whatsapp_number']}\n\nDelivery zones:\n{$zones}\n\nFAQ:\n{$faqs}");
    }

    /** Deterministic keyword profile of the conversation. */
    public static function deriveState(array $history): array
    {
        $text = '';
        foreach ($history as $m) {
            if (($m['role'] ?? '') === 'user') {
                $text .= ' '.mb_strtolower((string) $m['content']);
            }
        }

        $state = ['category' => null, 'colour' => null, 'occasion' => null, 'maxPrice' => null, 'query' => ''];

        foreach (self::CATEGORY_WORDS as $word => $slug) {
            if (preg_match('/\b'.preg_quote($word, '/').'\b/u', $text)) {
                $state['category'] = $slug;
                break;
            }
        }
        foreach (self::COLOUR_WORDS as $word => $colour) {
            if (preg_match('/\b'.preg_quote($word, '/').'\b/u', $text)) {
                $state['colour'] = $colour;
                break;
            }
        }
        foreach (self::OCCASION_WORDS as $word => $occasion) {
            if (preg_match('/\b'.preg_quote($word, '/').'\b/u', $text)) {
                $state['occasion'] = $occasion;
                $state['query'] = $occasion;
                break;
            }
        }
        if (preg_match('/(?:under|moins de|max(?:imum)?|budget(?: of)?)\s*([\d\s.,]{4,9})/u', $text, $m)) {
            $digits = preg_replace('/\D/', '', $m[1] ?? '');
            if (strlen((string) $digits) >= 4) {
                $state['maxPrice'] = (int) $digits;
            }
        }

        return $state;
    }

    /**
     * Knowledge-base reply: intent classification + catalogue search +
     * cards. Falls back gracefully when no products match.
     */
    public static function knowledgeReply(string $message, array $state, string $locale, string $sessionId): array
    {
        $fr = $locale === 'fr';
        $text = mb_strtolower(trim($message));

        // ── Intents that never need the catalogue ─────────────────────
        if (preg_match('/^(hi|hello|hey|bonjour|bonsoir|salut)\b/u', $text)) {
            $greeting = Settings::get('concierge_greeting');

            return ['reply' => $fr ? 'Bonjour ! '.$greeting : $greeting, 'escalated' => false];
        }
        if (preg_match('/^(thank|thanks|merci)\b/u', $text)) {
            return ['reply' => $fr
                ? 'Avec plaisir. Je reste à votre écoute pour toute autre question.'
                : 'A pleasure. I am here whenever you need anything else.', 'escalated' => false];
        }
        if (preg_match('/\b(human|agent|person|whatsapp|speak to someone|parler à)\b/u', $text)) {
            $phone = Settings::get('whatsapp_number');

            return ['reply' => $fr
                ? "Bien sûr — notre équipe est disponible sur WhatsApp au {$phone}. Je reste moi-même à votre disposition."
                : "Of course — our team is available on WhatsApp at {$phone}. I remain at your disposal meanwhile.", 'escalated' => true];
        }
        if (preg_match('/\b(track|order|commande|colis|suivre)\b/u', $text)) {
            return ['reply' => $fr
                ? 'Je peux vérifier une commande si vous me donnez son numéro (OSZ-…) — ou consultez la page « Suivre une commande ».'
                : 'I can look into an order if you share its number (OSZ-…) — or use the Track an order page.', 'escalated' => false];
        }
        if (preg_match('/\b(deliver|shipping|livraison|frais)\b/u', $text)) {
            $zones = DeliveryZone::where('is_active', true)->orderBy('fee')->get()
                ->map(fn ($z) => '• '.pick($z->name, $z->name_fr).' — '.format_xaf($z->fee).' ('.pick($z->eta_label, $z->eta_label_fr).')')
                ->implode("\n");

            return ['reply' => ($fr ? 'Voici nos options de livraison :\n' : 'Here are our delivery options:\n').$zones, 'escalated' => false];
        }
        if (preg_match('/\b(appointment|booking|rendez-vous|essayage|fitting)\b/u', $text)) {
            return ['reply' => $fr
                ? 'Avec plaisir — la page « Rendez-vous » permet de réserver un essayage d\'une heure à la boutique. Je peux aussi prendre vos coordonnées ici.'
                : 'With pleasure — the Appointments page books a one-hour fitting at the boutique. I can also take your details here.', 'escalated' => false];
        }

        // ── Catalogue search → product cards ─────────────────────────
        $filters = array_filter([
            'category' => $state['category'],
            'colour' => $state['colour'],
            'maxPrice' => $state['maxPrice'],
            'q' => $state['query'] !== '' ? $state['query'] : (mb_strlen($text) > 2 ? $text : null),
            'availability' => 'in_stock',
            'sort' => 'popular',
            'limit' => 8,
        ], fn ($v) => $v !== null && $v !== '');

        $cards = [];
        $results = ProductQuery::list($filters);
        foreach (array_slice($results, 0, 3) as $p) {
            $cards[] = self::card($p);
        }

        if ($cards !== []) {
            $intro = $fr ? 'Voici ce que je vous propose' : 'Here is what I would suggest';
            if (! empty($state['occasion'])) {
                $intro = $fr ? "Pour {$state['occasion']}, j'ai pensé à" : "For a {$state['occasion']}, I thought of";
            }

            return ['reply' => $intro." CARD_START:\n".implode("\n", $cards)."\n:CARD_END", 'escalated' => false];
        }

        // Nothing matched — record the gap for staff review.
        try {
            AiGap::create([
                'session_id' => $sessionId,
                'question' => mb_substr($message, 0, 400),
                'locale' => $locale,
                'detected_intent' => $state['category'] ?? 'browse',
                'reason' => 'no catalogue match',
                'status' => 'open',
            ]);
        } catch (\Throwable) {
        }

        return ['reply' => $fr
            ? 'Je n\'ai pas trouvé de pièce correspondante pour le moment. Puis-je vous aider d\'une autre façon, ou préférez-vous parler à l\'équipe sur WhatsApp ?'
            : 'I could not find a matching piece just now. May I help in another way, or would you prefer the team on WhatsApp?', 'escalated' => false];
    }

    private static function card(array $p): string
    {
        $price = format_xaf($p['basePrice']);
        $stock = $p['inStock'] ? (is_fr() ? 'En stock' : 'In stock') : (is_fr() ? 'Épuisé' : 'Sold out');

        return "PRODUCT:{$p['slug']}|NAME:{$p['name']}|PRICE:{$price}|STOCK:{$stock}|IMG:{$p['image']}";
    }

    /**
     * Call Gemini with both configured keys in parallel; returns the first
     * successful reply within the grace window, or null.
     */
    public static function gemini(string $system, array $history, string $locale): ?string
    {
        $keys = array_filter([env('GEMINI_API_KEY'), env('GEMINI_API_KEY2')]);
        if ($keys === []) {
            return null;
        }

        $contents = [];
        $contents[] = ['role' => 'user', 'parts' => [['text' => "[System Instructions]\n{$system}\n\nPlease follow these instructions for all subsequent messages."]]];
        $contents[] = ['role' => 'model', 'parts' => [['text' => 'Understood. I am the OSSZ Concierge, ready to help.']]];

        foreach ($history as $m) {
            $contents[] = ['role' => ($m['role'] ?? 'user') === 'user' ? 'user' : 'model', 'parts' => [['text' => (string) $m['content']]]];
        }

        $body = [
            'contents' => $contents,
            'generationConfig' => [
                'maxOutputTokens' => 500,
                'temperature' => 0.6,
                'topP' => 0.9,
                'thinkingConfig' => ['thinkingBudget' => 0],
            ],
        ];

        $replies = Http::pool(fn ($pool) => array_map(
            fn ($key) => $pool->as($key)
                ->timeout(6)
                ->post("https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={$key}", $body),
            array_values($keys)
        ));

        foreach ($replies as $response) {
            try {
                $text = $response->json('candidates.0.content.parts.0.text') ?? null;
                if (is_string($text) && trim($text) !== '') {
                    return trim($text);
                }
            } catch (\Throwable) {
                continue;
            }
        }

        return null;
    }
}
