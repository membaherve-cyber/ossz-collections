import { and, asc, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { db } from "@/db";
import {
  aiGaps,
  appointments,
  orderItems,
  orders,
  productImages,
  productVariants,
  products,
  collections,
  categories,
} from "@/db/schema";
import { getSettings, listDeliveryZones, listFaqs, listProducts } from "@/lib/store";
import { formatDateTime, formatXAF, makeReference, STATUS_LABELS, waLink } from "@/lib/utils";

export type ToolResult = { text: string; data?: unknown };

type Settings = Awaited<ReturnType<typeof getSettings>>;

// Settings rarely change; cache them for a minute so every concierge reply
// avoids an extra database round-trip (keeps responses fast).
let settingsCache: { at: number; value: Settings } | null = null;
async function cachedSettings(): Promise<Settings> {
  const now = Date.now();
  if (settingsCache && now - settingsCache.at < 60_000) return settingsCache.value;
  const value = await getSettings();
  settingsCache = { at: now, value };
  return value;
}

/* ------------------------------------------------------------------ */
/* Conversation state — the concierge's short-term memory of a         */
/* visitor's wishes across a single session.                            */
/* ------------------------------------------------------------------ */

/** One confirmed or inferred preference the visitor has expressed. */
export type Interest = {
  kind:
    | "category"
    | "collection"
    | "occasion"
    | "colour"
    | "size"
    | "priceZone"
    | "style"
    | "fabric"
    | "maxPrice";
  value: string;
  source: "stated" | "inferred";
};

/** Products the concierge has already suggested in this session, so we
 *  never repeat the same recommendation and can follow up naturally. */
export type Candidate = {
  slug: string;
  name: string;
  reason: string;
};

export type ConversationState = {
  interests: Interest[];
  candidates: Candidate[];
  /** Slugs of products whose stock/size the visitor asked about. */
  lookedAt: string[];
  /** The concierge should confirm before acting on these. */
  awaitingConfirmation: string[];
  /** Last browse/search context so relative follow-ups ("only black ones",
   *  "under 80,000", "the one for a wedding") narrow the *same* query rather
   *  than starting over. */
  lastBrowsing: {
    category: string | undefined;
    collection: string | undefined;
    colour: string | undefined;
    size: string | undefined;
    maxPrice: number | undefined;
    query: string | undefined;
    occasion: string | undefined;
  } | null;
};

const EMPTY_STATE: ConversationState = {
  interests: [],
  candidates: [],
  lookedAt: [],
  awaitingConfirmation: [],
  lastBrowsing: null,
};

/* ------------------------------------------------------------------ */
/* Keyword tables — deterministic signals the concierge reads from     */
/* the visitor's own words, so replies stay grounded even when the     */
/* live LLM API is unavailable.                                        */
/* ------------------------------------------------------------------ */

const OCCASION_KEYWORDS = [
  { word: "wedding", value: "wedding" },
  { word: "mariage", value: "wedding" },
  { word: "engagement", value: "engagement" },
  { word: "bridge", value: "bridal" },
  { word: "pierce", value: "bridal" },
  { word: "soirée", value: "evening" },
  { word: "soiree", value: "evening" },
  { word: "dinner", value: "dinner" },
  { word: "cocktail", value: "cocktail" },
  { word: "gala", value: "gala" },
  { word: "ceremony", value: "ceremony" },
  { word: "graduation", value: "graduation" },
  { word: "church", value: "church" },
  { word: "baptism", value: "baptism" },
  { word: "birthday", value: "birthday" },
  { word: "anniversary", value: "anniversary" },
  { word: "party", value: "party" },
  { word: "fête", value: "party" },
  { word: "fete", value: "party" },
  { word: "reception", value: "reception" },
  { word: "k fel", value: "kofel" },
  { word: "kofel", value: "kofel" },
  { word: "office", value: "work" },
  { word: "work", value: "work" },
  { word: "business", value: "work" },
  { word: "casual", value: "casual" },
  { word: "everyday", value: "everyday" },
  { word: "vacation", value: "vacation" },
  { word: "holiday", value: "vacation" },
  { word: "weekend", value: "weekend" },
  { word: "beach", value: "beach" },
  { word: "travel", value: "travel" },
  { word: "gift", value: "gift" },
  { word: "cadeau", value: "gift" },
];

const STYLE_KEYWORDS = [
  { word: "elegant", value: "elegant" },
  { word: "classy", value: "elegant" },
  { word: "chic", value: "chic" },
  { word: "bold", value: "bold" },
  { word: "statement", value: "statement" },
  { word: "minimal", value: "minimal" },
  { word: "minimalist", value: "minimal" },
  { word: "timeless", value: "timeless" },
  { word: "modern", value: "modern" },
  { word: "contemporary", value: "contemporary" },
  { word: "traditional", value: "traditional" },
  { word: "african", value: "african" },
  { word: "couture", value: "couture" },
  { word: "haute", value: "couture" },
  { word: "luxury", value: "luxury" },
  { word: "premium", value: "luxury" },
  { word: "relaxed", value: "relaxed" },
  { word: "comfortable", value: "comfortable" },
  { word: "casual", value: "casual" },
  { word: "structured", value: "structured" },
  { word: "draped", value: "draped" },
  { word: "column", value: "column" },
];

// Values are category SLUGS — `listProducts` filters on categories.slug, so
// the concierge must speak the catalogue's own identifiers, not display names.
const CATEGORY_KEYWORDS = [
  { word: "dress", value: "ready-to-wear" },
  { word: "gown", value: "ready-to-wear" },
  { word: "kaftan", value: "kaftans" },
  { word: "agbada", value: "agbada" },
  { word: "pantalon", value: "pants" },
  { word: "pants", value: "pants" },
  { word: "trouser", value: "pants" },
  { word: "trousers", value: "pants" },
  { word: "chemise", value: "shirts" },
  { word: "shirt", value: "shirts" },
  { word: "danshiki", value: "danshiki" },
  { word: "dansiki", value: "danshiki" },
  { word: "oversize", value: "oversize" },
  { word: "hat", value: "hats" },
  { word: "chapeau", value: "hats" },
  { word: "shoe", value: "shoes" },
  { word: "shoes", value: "shoes" },
  { word: "sandale", value: "sandals" },
  { word: "sandals", value: "sandals" },
  { word: "sandali", value: "sandals" },
  { word: "cufflink", value: "cufflinks" },
  { word: "bouton", value: "cufflinks" },
  { word: "sac", value: "bags" },
  { word: "bag", value: "bags" },
  { word: "cravate", value: "tie-cravate" },
  { word: "tie", value: "tie-cravate" },
  { word: "bold tie", value: "bold-tie" },
  { word: "accessoire", value: "accessories" },
];

const COLLECTION_KEYWORDS = [
  { word: "check moves", value: "check-moves" },
  { word: "freeme", value: "freeme" },
  { word: "95 vivs", value: "95-vivs-element" },
  { word: "95 vives", value: "95-vivs-element" },
  { word: "cultural canvas", value: "cultural-canvas" },
  { word: "cultural heritage", value: "cultural-heritage" },
];

// Values are EXACT variant colour names — the catalogue's real palette.
// A colour filter that names a non-existent variant colour yields zero
// results, so every entry here must exist in product_variants.colour.
const COLOUR_KEYWORDS = [
  { word: "noir", value: "Noir" },
  { word: "black", value: "Noir" },
  { word: "white", value: "Ivory" },
  { word: "ivory", value: "Ivory" },
  { word: "camel", value: "Camel" },
  { word: "beige", value: "Sand" },
  { word: "sand", value: "Sand" },
  { word: "cream", value: "Champagne" },
  { word: "champagne", value: "Champagne" },
  { word: "amber", value: "Amber" },
  { word: "golden", value: "Amber" },
  { word: "gold", value: "Amber" },
  { word: "teal", value: "Teal" },
  { word: "charcoal", value: "Charcoal" },
  { word: "grey", value: "Slate" },
  { word: "gray", value: "Slate" },
  { word: "slate", value: "Slate" },
  { word: "midnight", value: "Midnight" },
  { word: "navy", value: "Navy" },
  { word: "marine", value: "Navy" },
  { word: "vert", value: "Olive" },
  { word: "green", value: "Olive" },
  { word: "khaki", value: "Khaki" },
  { word: "mauve", value: "Mauve" },
  { word: "purple", value: "Mauve" },
  { word: "rose", value: "Rose" },
  { word: "pink", value: "Rose" },
  { word: "periwinkle", value: "Periwinkle" },
  { word: "bourgogne", value: "Burgundy" },
  { word: "burgundy", value: "Burgundy" },
  { word: "rouge", value: "Burgundy" },
  { word: "red", value: "Burgundy" },
  { word: "oxblood", value: "Oxblood" },
  { word: "obsidian", value: "Obsidian" },
  { word: "ochre", value: "Ochre" },
];

const FABRIC_KEYWORDS = [
  { word: "silk", value: "Silk" },
  { word: "soie", value: "Silk" },
  { word: "linen", value: "Linen" },
  { word: "lin", value: "Linen" },
  { word: "cotton", value: "Cotton" },
  { word: "coton", value: "Cotton" },
  { word: "adire", value: "Adire" },
  { word: "raffia", value: "Raffia" },
  { word: "velvet", value: "Velvet" },
  { word: "velours", value: "Velvet" },
  { word: "perlage", value: "Beaded" },
  { word: "beaded", value: "Beaded" },
  { word: "embroidered", value: "Embroidered" },
  { word: "broderie", value: "Embroidered" },
  { word: "adire", value: "Adire" },
];

// Only sizes that actually exist in product_variants (XS, S, M, L).
// Short words need word-boundary matching in deriveState so "m" never
// fires inside "mauve" or "much".
const SIZE_KEYWORDS = [
  { word: "xs", value: "XS" },
  { word: "s", value: "S" },
  { word: "m", value: "M" },
  { word: "l", value: "L" },
];

/** Derive a lightweight profile from the last ~10 messages. This is
 *  intentionally small and deterministic so the reply stays fast and we
 *  can hand the state to the LLM as structured context. */
export function deriveState(
  history: Array<{ role: "user" | "assistant"; content: string }>,
): ConversationState {
  const state: ConversationState = {
    interests: [],
    candidates: [],
    lookedAt: [],
    awaitingConfirmation: [],
    lastBrowsing: null,
  };

  const userMessages = history
    .filter((m) => m.role === "user")
    .map((m) => m.content.toLowerCase());
  const allText = userMessages.join(" ");

  for (const table of [
    OCCASION_KEYWORDS,
    STYLE_KEYWORDS,
    CATEGORY_KEYWORDS,
    COLLECTION_KEYWORDS,
    COLOUR_KEYWORDS,
    FABRIC_KEYWORDS,
    SIZE_KEYWORDS,
  ]) {
    for (const entry of table) {
      // Word-boundary match for short tokens ("m", "s", "l", "tie") so they
      // never fire inside other words ("mauve", "much", "style", "little").
      const hit =
        entry.word.length <= 4
          ? new RegExp(`\\b${entry.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`).test(allText)
          : allText.includes(entry.word);
      if (hit) {
        state.interests.push({
          kind:
            table === OCCASION_KEYWORDS
              ? "occasion"
              : table === STYLE_KEYWORDS
              ? "style"
              : table === CATEGORY_KEYWORDS
              ? "category"
              : table === COLLECTION_KEYWORDS
              ? "collection"
              : table === COLOUR_KEYWORDS
              ? "colour"
              : table === FABRIC_KEYWORDS
              ? "fabric"
              : "size",
          value: entry.value,
          source: "inferred",
        });
      }
    }
  }

  // Price zone — a numeric budget ("under 250000", "moins de 180 000") is
  // captured EXACTLY; vague words only set a soft zone.
  const budgetMatch = allText.match(
    /under\s*([\d\s.,]{3,9})|moins\s*de\s*([\d\s.,]{3,9})|up\s*to\s*([\d\s.,]{3,9})|max(?:imum)?\s*([\d\s.,]{3,9})|budget\s*(?:of\s*)?([\d\s.,]{3,9})|pas\s*plus\s*de\s*([\d\s.,]{3,9})/,
  );
  if (budgetMatch) {
    const digits = (budgetMatch.slice(1).find(Boolean) ?? "").replace(/[^\d]/g, "");
    if (digits.length >= 4) {
      state.interests.push({ kind: "maxPrice", value: digits, source: "stated" } as Interest);
    }
  }
  if (
    /free|under \d|cheap|afford|cheapest|smallest budget|low budget|not.*expensive|moins.*cher/i.test(
      allText,
    )
  ) {
    state.interests.push({
      kind: "priceZone",
      value: "lower",
      source: "inferred",
    });
  } else if (
    /expensive|luxury|premium|most expensive|haute couture|haute|evening|formal ceremony|privilege|haute.*couture|plus.*cher/i.test(
      allText,
    )
  ) {
    state.interests.push({ kind: "priceZone", value: "higher", source: "inferred" });
  }

  // Products already mentioned / looked at
  const productRefs = allText.match(/\/product\/[a-z0-9-]+/gi) ?? [];
  for (const ref of productRefs) {
    const slug = ref.replace("/product/", "");
    if (!state.lookedAt.includes(slug)) state.lookedAt.push(slug);
  }

  // Candidates already suggested by the assistant in this conversation
  for (const msg of history) {
    if (msg.role !== "assistant") continue;
    const linkRe = /\/product\/([a-z0-9-]+)/gi;
    let m: RegExpExecArray | null;
    while ((m = linkRe.exec(msg.content)) !== null) {
      const slug = m[1];
      if (!state.candidates.find((c) => c.slug === slug)) {
        state.candidates.push({ slug, name: slug, reason: "previously suggested" });
      }
    }
  }

  // Deduplicate interests (keep first-listed)
  const seen = new Set<string>();
  state.interests = state.interests.filter((i) => {
    const key = `${i.kind}:${i.value}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Capture the last browsing context so follow-up messages narrow the same
  // query instead of restarting from scratch.
  const category = state.interests.find((i) => i.kind === "category");
  const collection = state.interests.find((i) => i.kind === "collection");
  const colour = state.interests.find((i) => i.kind === "colour");
  const size = state.interests.find((i) => i.kind === "size");
  const priceZone = state.interests.find((i) => i.kind === "priceZone");
  const occasion = state.interests.find((i) => i.kind === "occasion");

  state.lastBrowsing = {
    category: category?.value,
    collection: collection?.value,
    colour: colour?.value,
    size: size?.value,
    maxPrice: priceZone?.value === "lower" ? 180_000 : priceZone?.value === "higher" ? undefined : undefined,
    query: undefined,
    occasion: occasion?.value,
  };

  return state;
}

/* ------------------------------------------------------------------ */
/* Deterministic intent classification                                 */
/* ------------------------------------------------------------------ */

export type Intent =
  | { type: "greeting" }
  | { type: "thanks" }
  | { type: "goodbye" }
  | { type: "human" }
  | { type: "order_track" }
  | { type: "appointment_book" | "appointment_reschedule" | "appointment_cancel" }
  | { type: "delivery_info" | "returns_info" | "payment_info" | "hours_location" | "faq" }
  | { type: "size_care" }
  | { type: "browse_or_suggest" };

const INTENT_PATTERNS: Array<{ intent: Intent; test: RegExp }> = [
  {
    intent: { type: "greeting" },
    test: /^(hi|hello|hey|good (morning|afternoon|evening)|bonjour|bonsoir|salut|yo|coucou)\b/i,
  },
  {
    intent: { type: "thanks" },
    test: /^(thank|thanks|merci|appreciate|nice one|merci bcp|merci beaucoup|super merci|parfait merci)/i,
  },
  {
    intent: { type: "goodbye" },
    test: /^(bye|goodbye|see you|au revoir|à plus|a plus|cya|nothing else|that's all|ca marche|merci ca suffit|je n'ai plus besoin|plus besoin)/i,
  },
  {
    intent: { type: "human" },
    test: /\b(human|agent|manager|whatsapp\b|speak (?:to|with) (?:someone|a|an|your)|talk (?:to|with) (?:someone|a|an|your)|person|team member|un homme|vraiment une personne|je veux parler|une personne|contact.*humain|je préfère.*personne|parler à|human assistance|real person)/i,
  },
  {
    intent: { type: "appointment_cancel" },
    test: /cancel(?:l?ed?|s?ing?)? (?:my |the |an |a )?appoint|annuler (?:mon |le |un )?rendez|cancel (?:my|the)? appointment|je veux.*annuler|supprimer.*rendez/i,
  },
  {
    intent: { type: "appointment_reschedule" },
    test: /(?:move|change|shift|push|repush|reschedule|replan|re-plan)(?: my |the |an )?appoint|reprogrammer|changer (?:mon |le |un )?rendez|l' autre jour|autre créneau|un autre|autre jour|autre date|re-booking/i,
  },
  {
    intent: { type: "appointment_book" },
    test: /book?(?: an?)? (?:a |the |my )?appoint|reserve?r? (?:un |mon |le )?rendez|fitting|essayage|styling session|rendre (?:un )? RDV|je veux (?:un |le )? rendez|je voudrais.*rendez|prendre.*rendez|un rendez/i,
  },
  {
    intent: { type: "order_track" },
    test: /track (?:my |the |an )?(?:order|commande|parcel|pacz|colis)|check (?:my |the |an )?order|where (?:is |'s )?(?:my |the )?order|status (?:of |du )?order|suivre (?:ma |la |mon )?commande|os[z]?- ?[a-z0-9]+|numéro.*commande|numero.*commande|reference.*commande/i,
  },
  {
    intent: { type: "delivery_info" },
    test: /(?:how much|what.*deliver|delivery|ship|shipping|livraison|frais.*livr|etremitte|delivery fee|when will|how long|when.*arrive|quand.*arrive|combien.*livraison)/i,
  },
  {
    intent: { type: "returns_info" },
    test: /(?:return|refund|exchange|echange|remboursement|retour|send back|annuler commande|je veux.*retour|je veux.*rembourser)/i,
  },
  {
    intent: { type: "payment_info" },
    test: /(?:pay|payment|how to pay|payer|mobile money|momo|orange|mtn|card|visa|mastercard|paiement|cout|price|combien|cost|prix|how much.*cost|coût)/i,
  },
  {
    intent: { type: "hours_location" },
    test: /(?:where\s+is\s+(?:the\s+)?(?:ossz|boutique|store|shop|atelier)|where\s+(?:is\s+)?(?:the\s+)?(?:location|address|located)|where\s+(?:are|is)\s+you\s+(?:based|located|situated)|ou\s+(?:est|sont|se\s+trouve|se\s+trouvent)\s+(?:la\s+)?(?:boutique|magasin|atelier|ossz)|ou\s+se\s+trouve|adresse|horaire|open.*time|when.*open|heures\s+d'?ouverture|opening\s+hours|heure.*ouverture)/i,
  },
  {
    intent: { type: "size_care" },
    test: /(?:size|fit|taille|sizing|measure|mesure|guide|fitted|does.*fit|will.*fit|too tight|too loose|between size|entre deux|comment.*choisir|wash|care|clean|iron|fabric|entretien|matiere|soie|lin|coton|comment.*entretenir|comment.*laver)/i,
  },
  {
    intent: { type: "faq" },
    test: /(?:faq|policy|politique|info|information|q(?:u)?est-ce que|comment.*fonctionne|explique|thing|details|comment.*ça|comment.*ca|explique.*moi|règles|rules)/i,
  },  {
    intent: { type: "browse_or_suggest" },
    test: /\b(do you have|do you sell|have you got|anything in|avez.vous|vous avez|est.ce que vous avez)\b/i,
  },

  {
    intent: { type: "browse_or_suggest" },
    test: /(?:show|find|look|suggest|recommend|need|want|looking for|search|can you find|i'm.*looking|i want|i need|j'.*veux|j'.*cherche|je cherche|montrez|moi|me montrez|convient|pour.*occasion|pour.*event|for.*occasion|for.*event|for.*wedding|for.*party|for.*ceremony|for.*dinner|for.*evening|for.*gift|pour cadeau|je voudrais|je veux|j'espere|bon j'ai besoin|de.*qui|j'aimerais|j aimerais|j aimerais bien|je recherche|je.*besoin|il me faut|me conseille|conseillez|propose|qu'est ce que vous.*propose|laissez.*vous conseiller|je suis.*à la recherche|je vais.*porter|je vais.*mettre|je prépare)/i,
  },

];

export function classifyIntent(message: string): Intent {
  const text = message.trim();
  let best: Intent | null = null;
  let bestScore = 0;
  for (const { intent, test } of INTENT_PATTERNS) {
    if (test.test(text)) {
      const match = text.match(test);
      const score = match ? match[0].length : 0;
      if (score > bestScore) {
        bestScore = score;
        best = intent;
      }
    }
  }
  if (!best) return { type: "browse_or_suggest" };
  return best;
}

/* ------------------------------------------------------------------ */
/* Product-aware recommendation engine                                 */
/* ------------------------------------------------------------------ */

type RecommendFilters = {
  interests: ConversationState["interests"];
  candidates: ConversationState["candidates"];
  lookedAt: ConversationState["lookedAt"];
  locale: string;
};

/** Convert inferred interests into `listProducts` filters and a natural
 *  search query, without inventing prices or stock. */
function filtersFromInterests(f: RecommendFilters): {
  query: string;
  colour: string | undefined;
  size: string | undefined;
  maxPrice: number | undefined;
  category: string | undefined;
  collection: string | undefined;
} {
  const parts: string[] = [];
  let colour: string | undefined;
  let size: string | undefined;
  let maxPrice: number | undefined;
  let category: string | undefined;
  let collection: string | undefined;

  for (const interest of f.interests) {
    switch (interest.kind) {
      case "occasion":
        parts.push(occasionQuery(interest.value));
        break;
      case "style":
        parts.push(styleQuery(interest.value));
        break;
      case "category":
        category = interest.value;
        break;
      case "collection":
        collection = interest.value;
        break;
      case "colour":
        colour = interest.value;
        break;
      case "fabric":
        parts.push(fabricQuery(interest.value));
        break;
      case "size":
        size = interest.value;
        break;
      case "maxPrice":
        // An exact stated budget ALWAYS wins over the soft price zone.
        maxPrice = Number(interest.value) || maxPrice;
        break;
      case "priceZone":
        if (interest.value === "lower" && maxPrice === undefined) {
          maxPrice = 180_000; // soft accessible-band heuristic, exact budget above wins
        }
        // "higher" — do not cap price; let the catalogue surface premium pieces
        break;
    }
  }

  return {
    query: parts.join(" "),
    colour,
    size,
    maxPrice,
    category,
    collection,
  };
}

function occasionQuery(occasion: string): string {
  const map: Record<string, string> = {
    wedding: "wedding",
    engagement: "engagement",
    bridal: "bridal",
    evening: "evening",
    dinner: "dinner",
    cocktail: "cocktail",
    gala: "gala",
    ceremony: "ceremony",
    graduation: "graduation",
    church: "church",
    baptism: "baptism",
    birthday: "birthday",
    anniversary: "anniversary",
    party: "party",
    reception: "reception",
    kofel: "kofel",
    work: "work",
    casual: "casual",
    everyday: "casual",
    vacation: "vacation",
    holiday: "vacation",
    weekend: "weekend",
    beach: "beach",
    travel: "travel",
    gift: "gift",
  };
  return map[occasion] ?? occasion;
}

function styleQuery(style: string): string {
  const map: Record<string, string> = {
    elegant: "elegant",
    chic: "chic",
    bold: "bold",
    statement: "statement",
    minimal: "minimal",
    modern: "modern",
    contemporary: "contemporary",
    traditional: "traditional",
    african: "african",
    couture: "couture",
    luxury: "luxury",
    relaxed: "relaxed",
    comfortable: "comfortable",
    casual: "casual",
    structured: "structured",
    draped: "draped",
    column: "column",
    timeless: "timeless",
  };
  return map[style] ?? style;
}

function fabricQuery(fabric: string): string {
  const map: Record<string, string> = {
    Silk: "silk",
    Linen: "linen",
    Cotton: "cotton",
    Adire: "adire",
    Raffia: "raffia",
    Velvet: "velvet",
    Beaded: "beaded",
    Embroidered: "embroidered",
  };
  return map[fabric] ?? fabric.toLowerCase();
}

/** Recommend up to `n` live products for the visitor, skipping anything
 *  already suggested or looked at, and returning a short human reason for
 *  each so the concierge can say *why* it fits. */
export async function recommendProducts(
  state: ConversationState,
  locale: string,
  n = 4,
): Promise<{
  items: ProductPick[];
  why: string;
}> {
  const lang = locale === "fr" ? "fr" : "en";
  const filters = filtersFromInterests({
    interests: state.interests,
    candidates: state.candidates,
    lookedAt: state.lookedAt,
    locale,
  });
  const already = new Set([...state.candidates.map((c) => c.slug), ...state.lookedAt]);

  const candidates = await listProducts({
    q: filters.query || undefined,
    colour: filters.colour,
    size: filters.size,
    maxPrice: filters.maxPrice,
    category: filters.category,
    collection: filters.collection,
    availability: "in_stock",
    sort: "popular",
    limit: n + already.size + 4,
  });

  const picked: ProductPick[] = [];
  const used = new Set<string>();

  // 1) surface any already-interested-in products that are actually in stock
  for (const slug of state.lookedAt) {
    if (used.has(slug)) continue;
    if (already.has(slug)) continue;
    const row = candidates.find((c) => c.slug === slug);
    if (row && row.inStock) {
      picked.push({
        slug: row.slug,
        name: row.name,
        price: row.basePrice,
        inStock: row.inStock,
        image: row.image,
        reason: recommendationReason(row, state.interests, lang),
      });
      used.add(row.slug);
    }
  }

  // 2) fill with fresh candidates
  for (const row of candidates) {
    if (used.has(row.slug)) continue;
    if (already.has(row.slug)) continue;
    picked.push({
      slug: row.slug,
      name: row.name,
      price: row.basePrice,
      inStock: row.inStock,
      image: row.image,
      reason: recommendationReason(row, state.interests, lang),
    });
    used.add(row.slug);
    if (picked.length >= n) break;
  }

  // NOTE: no silent "unfiltered favourites" fallback here — if the visitor
  // stated constraints (colour, budget, size) that yield nothing, we must
  // NOT recommend pieces that ignore them. `progressiveSearch` handles the
  // broadening honestly, telling the visitor what was relaxed.

  const why =
    state.interests.length > 0
      ? lang === "fr"
        ? "Je tiens compte de ce que vous m'avez dit — voici quelques pièces qui correspondent à votre recherche."
        : "I've kept what you've told me in mind — here are a few pieces that fit what you're looking for."
      : lang === "fr"
      ? "Voici quelques-unes de nos pièces actuelles qui pourraient vous convenir."
      : "Here are a few of our current pieces that might suit you.";

  return { items: picked.slice(0, n), why };
}

function recommendationReason(
  row: {
    name: string;
    collectionName: string | null;
    categoryName: string | null;
    basePrice: number;
    inStock: boolean;
  },
  interests: ConversationState["interests"],
  lang: string,
): string {
  const occasion = interests.find((i) => i.kind === "occasion");
  const style = interests.find((i) => i.kind === "style");
  const colour = interests.find((i) => i.kind === "colour");
  const collection = interests.find((i) => i.kind === "collection");
  const category = interests.find((i) => i.kind === "category");
  const priceZone = interests.find((i) => i.kind === "priceZone");

  const en: string[] = [];
  const fr: string[] = [];

  if (occasion) {
    en.push(whyForOccasion(occasion.value));
    fr.push(whyForOccasion(occasion.value, true));
  }
  if (style && style.value !== "casual") {
    en.push(`styled with a ${style.value} feel`);
    fr.push(`au style ${style.value}`);
  }
  if (collection) {
    en.push(`from the ${collection} collection`);
    fr.push(`de la collection ${collection}`);
  }
  if (category && category.value !== "Ready to Wear") {
    en.push(`a ${category.value.toLowerCase()} piece`);
    fr.push(`une pièce ${category.value.toLowerCase()}`);
  }
  if (priceZone && priceZone.value === "lower") {
    en.push("in a more accessible price band");
    fr.push("dans une gamme plus accessible");
  }
  if (priceZone && priceZone.value === "higher") {
    en.push("a more luxurious piece");
    fr.push("une pièce plus luxe");
  }

  if (en.length === 0) {
    return lang === "fr"
      ? `une pièce de notre catalogue actuel — ${row.name}`
      : `a piece from our current catalogue — ${row.name}`;
  }

  const picked = lang === "fr" ? fr : en;
  return `${picked.join(", ")} — ${row.name}`;
}

function whyForOccasion(occasion: string, fr = false): string {
  const map: Record<string, { en: string; fr: string }> = {
    wedding: { en: "for a wedding", fr: "pour un mariage" },
    engagement: { en: "for an engagement", fr: "pour une cérémonie d'engagement" },
    bridal: { en: "for a bridal moment", fr: "pour un moment de mariée" },
    evening: { en: "for an evening out", fr: "pour une soirée" },
    dinner: { en: "for a dinner", fr: "pour un dîner" },
    cocktail: { en: "for a cocktail event", fr: "pour un cocktail" },
    gala: { en: "for a gala", fr: "pour un gala" },
    ceremony: { en: "for a ceremony", fr: "pour une cérémonie" },
    graduation: { en: "for a graduation", fr: "pour une graduation" },
    church: { en: "for church", fr: "pour l'église" },
    baptism: { en: "for a baptism", fr: "pour un baptême" },
    birthday: { en: "for a birthday", fr: "pour un anniversaire" },
    anniversary: { en: "for an anniversary", fr: "pour un anniversaire" },
    party: { en: "for a party", fr: "pour une fête" },
    reception: { en: "for a reception", fr: "pour une réception" },
    kofel: { en: "for a Kofel celebration", fr: "pour une célébration Kofel" },
    work: { en: "for work", fr: "pour le travail" },
    casual: { en: "for everyday wear", fr: "pour le quotidien" },
    everyday: { en: "for everyday wear", fr: "pour le quotidien" },
    vacation: { en: "for vacation", fr: "pour les vacances" },
    holiday: { en: "for the holidays", fr: "pour les fêtes" },
    weekend: { en: "for the weekend", fr: "pour le week-end" },
    beach: { en: "for the beach", fr: "pour la plage" },
    travel: { en: "for travel", fr: "pour le voyage" },
    gift: { en: "as a gift", fr: "en cadeau" },
  };
  return (map[occasion] ?? { en: `for a ${occasion}`, fr: `pour un ${occasion}` })[
    fr ? "fr" : "en"
  ];
}

/* ------------------------------------------------------------------ */
/* Search helpers — clarification, progressive alternative search,     */
/* confidence, and follow-up context.                                  */
/* ------------------------------------------------------------------ */

/** Try to find a clarifying question for a vague product request. Only
 *  returns a question when the requirement is genuinely underspecified
 *  (e.g. "I need shoes") and the catalogue actually has relevant
 *  sub-categories. */
export function clarifyRequest(state: ConversationState, locale: string): string | null {
  const lang = locale === "fr" ? "fr" : "en";

  // If the visitor is already expressing a concrete wish, do not clarify.
  if (
    state.interests.some(
      (i) => i.kind === "occasion" || i.kind === "style" || i.kind === "collection",
    )
  ) {
    return null;
  }

  const category = state.interests.find((i) => i.kind === "category");
  if (!category) return null;

  const fr = lang === "fr";

  // If there is a known category with real sub-options, ask about the
  // dimension that matters most for that category. Values are category
  // SLUGS — the catalogue's own identifiers.
  const cat = category.value;
  if (
    cat === "ready-to-wear" ||
    cat === "kaftans" ||
    cat === "agbada" ||
    cat === "pants" ||
    cat === "shirts" ||
    cat === "danshiki" ||
    cat === "oversize"
  ) {
    if (!state.interests.some((i) => i.kind === "occasion")) {
      return fr
        ? `Bien sûr. Cela sera-t-il pour une occasion spéciale (mariage, soirée, travail) ou pour le quotidien ?`
        : `Of course. Will this be for a special occasion (wedding, evening, work) or for everyday wear?`;
    }
    if (!state.interests.some((i) => i.kind === "colour")) {
      return fr
        ? `Parfait. Avez-vous une couleur en tête ?`
        : `Great. Do you have a colour in mind?`;
    }
    if (!state.interests.some((i) => i.kind === "size")) {
      return fr
        ? `D'accord. Quelle taille vous convient ? (XS, S, M, L)`
        : `Understood. Which size suits you? (XS, S, M, L)`;
    }
    return null;
  }

  if (cat === "shoes" || cat === "sandals") {
    if (!state.interests.some((i) => i.kind === "occasion")) {
      return fr
        ? `Bien sûr. C'est pour une soirée, le travail ou le quotidien ?`
        : `Of course. Is this for an evening out, work, or everyday wear?`;
    }
    if (!state.interests.some((i) => i.kind === "colour")) {
      return fr
        ? `Parfait. Avez-vous une couleur en tête ?`
        : `Great. Do you have a colour in mind?`;
    }
    return null;
  }

  if (
    cat === "bags" ||
    cat === "cufflinks" ||
    cat === "tie-cravate" ||
    cat === "bold-tie" ||
    cat === "accessories"
  ) {
    if (!state.interests.some((i) => i.kind === "occasion")) {
      return fr
        ? `Bien sûr. Est-ce un cadeau ou pour une occasion particulière ?`
        : `Of course. Is this a gift or for a particular occasion?`;
    }
    if (!state.interests.some((i) => i.kind === "colour")) {
      return fr
        ? `Parfait. Avez-vous une couleur en tête ?`
        : `Great. Do you have a colour in mind?`;
    }
    return null;
  }

  return null;
}

/** Progressive alternative search: when the visitor's full request yields
 *  no results, try the same request with one attribute dropped at a time,
 *  so we can still surface relevant pieces rather than saying "nothing".
 *  Returns the best non-empty result found. */
export async function progressiveSearch(
  state: ConversationState,
  locale: string,
  options?: { /** Skip the last-resort "current favourites" rung. */
    strict?: boolean;
  },
): Promise<{
  items: Array<{
    slug: string;
    name: string;
    price: number;
    inStock: boolean;
    reason: string;
    image?: string;
  }>;
  why: string;
  level: string;
}> {
  const lang = locale === "fr" ? "fr" : "en";
  const filters = filtersFromInterests({
    interests: state.interests,
    candidates: state.candidates,
    lookedAt: state.lookedAt,
    locale,
  });
  const already = new Set([
    ...state.candidates.map((c) => c.slug),
    ...state.lookedAt,
  ]);

  const levels: Array<{
    label: string;
    run: () => Promise<
      Array<{
        slug: string;
        name: string;
        price: number;
        inStock: boolean;
        reason: string;
        image?: string;
      }>
    >;
  }> = [
    {
      label: lang === "fr" ? "vos critères complets" : "your full criteria",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            q: filters.query || undefined,
            colour: filters.colour,
            size: filters.size,
            maxPrice: filters.maxPrice,
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    {
      label: lang === "fr" ? "sans limite de prix" : "without the price limit",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            q: filters.query || undefined,
            colour: filters.colour,
            size: filters.size,
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    {
      label: lang === "fr" ? "sans restriction de couleur" : "without the colour restriction",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            q: filters.query || undefined,
            size: filters.size,
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    {
      label: lang === "fr" ? "sans restriction de taille" : "without the size restriction",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            q: filters.query || undefined,
            colour: filters.colour,
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    {
      // The free-text query is the most literal filter — drop it before
      // giving up, but KEEP the structured attributes (category, colour…).
      label: lang === "fr" ? "vos critères principaux" : "your key criteria",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            colour: filters.colour,
            size: filters.size,
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    {
      label: lang === "fr" ? "pièces similaires de la même catégorie" : "similar pieces in the same category",
      run: async () =>
        await bestPicksFrom(
          await listProducts({
            category: filters.category,
            collection: filters.collection,
            availability: "in_stock",
            sort: "popular",
            limit: 12,
          }),
          already,
          state.interests,
          lang,
        ),
    },
    // Last-resort rung: only meaningful for a genuine browse. When the
    // visitor stated specific constraints (strict mode), skip it — showing
    // unrelated "favourites" would ignore what they asked for.
    ...(options?.strict
      ? []
      : [
          {
            label:
              lang === "fr"
                ? "nos pièces actuelles les plus appréciées"
                : "our current most-loved pieces",
            run: async () => {
              const fresh = await listProducts({
                availability: "in_stock",
                sort: "popular",
                limit: 12,
              });
              return fresh
                .filter((r) => !already.has(r.slug))
                .map((r) => ({
                  slug: r.slug,
                  name: r.name,
                  price: r.basePrice,
                  inStock: r.inStock,
                  image: r.image,
                  reason:
                    lang === "fr"
                      ? `l'une de nos pièces les plus appréciées en ce moment — ${r.name}`
                      : `one of our most-loved pieces right now — ${r.name}`,
                }));
            },
          },
        ]),
  ];

  for (const level of levels) {
    const picked = await level.run();
    if (picked.length > 0) {
      const why =
        lang === "fr"
          ? `Je n'ai pas trouvé de pièce correspondant exactement à ${level.label}, mais voici les plus proches que j'ai trouvées.`
          : `I did not find a piece matching ${level.label} exactly, but here are the closest I found.`;
      // `label` is the level that FAILED; the products shown came from the
      // NEXT level's broader search. Say which constraint was relaxed.
      const idx = levels.indexOf(level);
      const nextLabel = levels[idx + 1]?.label;
      const broadenedTo =
        nextLabel ??
        (lang === "fr" ? "l'ensemble du catalogue" : "the whole catalogue");
      const honestWhy =
        lang === "fr"
          ? `Rien ne correspond à ${level.label}. Voici les pièces les plus proches — ${broadenedTo}.`
          : `Nothing matches ${level.label} exactly. Here are the closest pieces — ${broadenedTo}.`;
      return { items: picked.slice(0, 4), why: honestWhy, level: broadenedTo };
    }
  }

  return {
    items: [],
    why:
      lang === "fr"
        ? "Je n'ai pas trouvé de pièce correspondante dans le catalogue actuel."
        : "I could not find a matching piece in the current catalogue.",
    level: "none",
  };
}

async function bestPicksFrom(
  rows: Array<{
    slug: string;
    name: string;
    basePrice: number;
    inStock: boolean;
    image?: string;
    collectionName: string | null;
    categoryName: string | null;
  }>,
  already: Set<string>,
  interests: ConversationState["interests"],
  lang: string,
): Promise<
  Array<{ slug: string; name: string; price: number; inStock: boolean; reason: string; image?: string }>
> {
  const out: Array<{
    slug: string;
    name: string;
    price: number;
    inStock: boolean;
    reason: string;
    image?: string;
  }> = [];
  for (const row of rows) {
    if (already.has(row.slug)) continue;
    out.push({
      slug: row.slug,
      name: row.name,
      price: row.basePrice,
      inStock: row.inStock,
      image: row.image,
      reason: recommendationReason(row, interests, lang),
    });
    if (out.length >= 6) break;
  }
  return out;
}

/** Confidence level for a reply. */
export type Confidence = "high" | "medium" | "low";

/** Decide how confident the concierge is in a product-finding reply.
 *  Used to decide whether to present results as definitive, to ask a
 *  clarification, or to state that the information could not be verified. */
export function confidenceFor(
  state: ConversationState,
  foundCount: number,
  hadToBroaden: boolean,
): Confidence {
  // Clear, specific request with real matches → high.
  if (foundCount >= 2 && !hadToBroaden) return "high";
  // A single match, or we had to broaden the search → medium.
  if (foundCount >= 1 || hadToBroaden) return "medium";
  return "low";
}

export type ProductPick = {
  slug: string;
  name: string;
  price: number;
  inStock: boolean;
  reason: string;
  image?: string;
};

/** Render a set of product picks as a card block the chat panel can render.
 *  The block is delimited by CARD_START:<slug> ... CARD_END so the panel can
 *  show images, prices, availability, View Product and Add to Cart without
 *  inventing data. */
export function productCards(
  items: ProductPick[],
  locale: string,
): string {
  return items
    .map((item) => {
      const lines = [
        `CARD_START:${item.slug}`,
        `name:${item.name}`,
        `price:${item.price}`,
        `inStock:${item.inStock ? "yes" : "no"}`,
      ];
      if (item.image) lines.push(`image:${item.image}`);
      lines.push(`reason:${item.reason}`, `CARD_END`);
      return lines.join("\n");
    })
    .join("\n");
}

/* ------------------------------------------------------------------ */
/* The OSSZ knowledge base — an extensive, hand-built store of brand,  */
/* product, service and practical knowledge. Consulted whenever the    */
/* live LLM APIs are unavailable, and used to enrich replies.          */
/* ------------------------------------------------------------------ */

type KbEntry = {
  topic: string;
  keywords: string[];
  en: string;
  fr: string;
};

export const KNOWLEDGE_BASE: KbEntry[] = [
  {
    topic: "brand",
    keywords: ["ossz", "brand", "maison", "house", "story", "about", "who are", "atelier", "tagline", "class"],
    en: "OSSZ Collections is a Douala-based fashion house. Our tagline is “Bring Out The Class in You”. Every piece is masterfully tailored by people we know — designed, cut and finished entirely within our local atelier at Ange Raphael, Douala. We believe clothes made close to home, by people we know, are worth more than clothes made anywhere else.",
    fr: "OSSZ Collections est une maison de mode basée à Douala. Notre devise : « Révélez la classe en vous ». Chaque pièce est taillée avec maîtrise par des personnes que nous connaissons — conçue, coupée et finie entièrement au sein de notre atelier local à Ange Raphael, Douala. Nous croyons que des vêtements faits près de chez soi, par des gens que l'on connaît, valent plus que tout autre vêtement.",
  },
  {
    topic: "collections",
    keywords: ["collection", "collections", "check moves", "freeme", "vive", "vivs", "95", "cultural canvas", "cultural heritage", "season"],
    en: "OSSZ has released five collections to date: Check Moves, Freeme (2021), 95 VIVS Element, Cultural Canvas, and Cultural Heritage. You can explore each one on the Collections page (/collections) — every collection is designed and finished by hand in our Douala atelier.",
    fr: "OSSZ a lancé cinq collections à ce jour : Check Moves, Freeme (2021), 95 VIVS Element, Cultural Canvas et Cultural Heritage. Vous pouvez les explorer sur la page Collections (/collections) — chaque collection est conçue et finie à la main dans notre atelier de Douala.",
  },
  {
    topic: "categories",
    keywords: ["category", "categories", "ready to wear", "kaftan", "kaftans", "agbada", "pants", "trousers", "shirts", "danshiki", "oversize", "hat", "hats", "shoes", "sandals", "cufflink", "cufflinks", "bag", "bags", "tie", "cravate", "bold tie", "accessor"],
    en: "Our catalogue spans fourteen categories: Ready to Wear, Kaftans, Agbada, Pants, Shirts, Danshiki, Oversize, Hats, Shoes, Sandals, Cufflinks, Bags, Tie / Cravate and Bold Tie. Shirts come in Classic and Vintage fits; Pants come in Classic, Gurkha and Palazzo. Browse them all on the Shop page.",
    fr: "Notre catalogue couvre quatorze catégories : Prêt-à-porter, Kaftans, Agbada, Pantalons, Chemises, Danshiki, Oversize, Chapeaux, Chaussures, Sandales, Boutons de manchette, Sacs, Cravate et Bold Tie. Les chemises existent en coupe Classique et Vintage ; les pantalons en Classique, Gurkha et Palazzo. Tout est disponible sur la page Boutique.",
  },
  {
    topic: "fabrics",
    keywords: ["fabric", "material", "silk", "soie", "linen", "lin", "cotton", "coton", "adire", "raffia", "velvet", "velours", "beaded", "perlage", "embroid"],
    en: "We work with hand-finished silks, crisp linens, honest cottons, indigo adire, raffia and richly embroidered velvets. Fabrics are chosen for Douala's heat and humidity, and every piece is finished by hand. If you name the piece, I can tell you its exact fabric and care routine.",
    fr: "Nous travaillons des soies finies à la main, des lins nets, des cotons honnêtes, l'adire indigo, le raphia et des velours richement brodés. Les matières sont choisies pour la chaleur et l'humidité de Douala, et chaque pièce est finie à la main. Nommez la pièce et je vous donne sa matière exacte et son entretien.",
  },
  {
    topic: "sizing",
    keywords: ["size", "sizes", "fit", "fitting", "measure", "taille", "tailles", "slim", "true to size", "guide"],
    en: "Our ready-to-wear runs true to size with a generous ease through the shoulder: XS fits FR 34, S fits FR 36, M fits FR 38, L fits FR 40. Between sizes? Our stylists recommend the larger size for a relaxed silhouette. You can also book a complimentary fitting — we take eight measurements and keep them on file.",
    fr: "Notre prêt-à-porter taille normalement, avec une aisance généreuse à l'épaule : XS correspond au FR 34, S au FR 36, M au FR 38, L au FR 40. Entre deux tailles ? Nos stylistes recommandent la taille supérieure pour une silhouette décontractée. Vous pouvez aussi réserver un essayage offert — nous prenons huit mesures et les conservons.",
  },
  {
    topic: "payment",
    keywords: ["payment", "pay", "paying", "momo", "orange money", "mtn", "mobile money", "visa", "mastercard", "card", "paiement", "payer", "fcfa", "cash", "cash on delivery"],
    en: "We accept MTN Mobile Money, Orange Money, and Visa / Mastercard. Payment is taken in full at checkout, in FCFA; prices include Cameroonian VAT. Delivery is calculated at checkout. For made-to-measure commissions, a deposit is confirmed with your stylist before the first cut.",
    fr: "Nous acceptons MTN Mobile Money, Orange Money, ainsi que Visa / Mastercard. Le paiement est intégralement prélevé à la commande, en FCFA ; les prix incluent la TVA camerounaise. La livraison est calculée à la commande. Pour les commandes sur mesure, un acompte est confirmé avec votre styliste avant la première coupe.",
  },
  {
    topic: "delivery",
    keywords: ["deliver", "delivery", "shipping", "ship", "livraison", "expedition", "when will", "how long", "same-day", "pickup", "retrait"],
    en: "We offer two delivery options: free in-store pickup at our Ange Raphael boutique (ready within 24 hours), and national shipping across Cameroon in 2–4 working days (6 500 FCFA). Your confirmation email and WhatsApp message include tracking for every shipped order.",
    fr: "Nous offrons deux options de livraison : le retrait en boutique offert à notre boutique Ange Raphael (prêt sous 24 heures), et l'expédition nationale partout au Cameroun en 2 à 4 jours ouvrés (6 500 FCFA). Votre e-mail et message WhatsApp de confirmation incluent le suivi de chaque commande expédiée.",
  },
  {
    topic: "returns",
    keywords: ["return", "returns", "refund", "exchange", "retour", "remboursement", "echange", "alteration", "retouche", "14 days", "30 days"],
    en: "Unworn pieces may be returned within 14 days of delivery, and exchanges are handled with the same ease. Complimentary alterations are included within 30 days of purchase on any OSSZ piece. Simply reply to your order confirmation or message us on WhatsApp to start a return.",
    fr: "Les pièces non portées sont reprises sous 14 jours après la livraison, et les échanges sont traités avec la même simplicité. Les retouches sont offertes dans les 30 jours suivant l'achat sur toute pièce OSSZ. Répondez simplement à votre confirmation de commande ou écrivez-nous sur WhatsApp pour lancer un retour.",
  },
  {
    topic: "location",
    keywords: ["where", "located", "address", "location", "boutique", "store", "shop", "open", "hours", "horaires", "hour"],
    en: "Our boutique and atelier are at Ange Raphael, Douala, Cameroon. Opening hours: Monday to Friday 9:00–18:00, Saturday 9:00–13:00, closed Sunday (appointments by arrangement).",
    fr: "Notre boutique et atelier se trouvent à Ange Raphael, Douala, Cameroun. Horaires : lundi à vendredi 9h00–18h00, samedi 9h00–13h00, fermé le dimanche (sur rendez-vous).",
  },
  {
    topic: "contact",
    keywords: ["contact", "whatsapp", "phone", "call", "email", "info@osszcollection", "facebook", "instagram", "theossz", "contacter", "telephone"],
    en: "You can reach the OSSZ team on WhatsApp at +237 694 068 219 or +237 651 468 831, by email at info@osszcollection.com, on Facebook as OSSZ Collection, and on Instagram as @theossz__. For anything urgent, WhatsApp is fastest.",
    fr: "Vous pouvez joindre l'équipe OSSZ sur WhatsApp au +237 694 068 219 ou +237 651 468 831, par e-mail à info@osszcollection.com, sur Facebook en tant que OSSZ Collection, et sur Instagram @theossz__. Pour toute urgence, WhatsApp est le plus rapide.",
  },
  {
    topic: "appointments",
    keywords: ["appointment", "rendez", "fitting", "essayage", "styling", "styliste", "book", "reserve", "reserver"],
    en: "We would be delighted to welcome you. Appointments are complimentary, last about forty minutes, and include eight measurements kept on file. You can book directly at /appointments — choose your date and time, and a stylist will confirm shortly.",
    fr: "Nous serions ravis de vous accueillir. Les rendez-vous sont offerts, durent environ quarante minutes et incluent huit mesures conservées. Vous pouvez réserver directement sur /appointments — choisissez date et heure, et un styliste confirmera rapidement.",
  },
  {
    topic: "ordering",
    keywords: ["order", "ordering", "buy", "purchase", "checkout", "cart", "commande", "acheter", "how do i", "process"],
    en: "Ordering is simple: choose your piece and size on the product page, add it to your cart, then check out as a guest or with your account. You pay in full at checkout (MTN MoMo, Orange Money, Visa/Mastercard) and receive a confirmation by email and WhatsApp with your order number, e.g. OSZ-XXXX.",
    fr: "Commander est simple : choisissez votre pièce et votre taille sur la page produit, ajoutez au panier, puis validez en tant qu'invité ou avec votre compte. Vous payez intégralement à la commande (MTN MoMo, Orange Money, Visa/Mastercard) et recevez une confirmation par e-mail et WhatsApp avec votre numéro de commande, ex. OSZ-XXXX.",
  },
  {
    topic: "tracking",
    keywords: ["track", "tracking", "status", "suivre", "osz-", "delivered", "livree", "shipped"],
    en: "To track an order I need the order number (it looks like OSZ-XXXX) and the email or phone used at checkout. Share both and I will look it up for you right away.",
    fr: "Pour suivre une commande, j'ai besoin du numéro de commande (il ressemble à OSZ-XXXX) ainsi que de l'e-mail ou du téléphone utilisés à la commande. Partagez-les et je vous réponds immédiatement.",
  },
  {
    topic: "care",
    keywords: ["care", "wash", "washing", "iron", "ironing", "dry clean", "entretien", "laver", "repasser", "humid", "humidity", "silky"],
    en: "Hand-wash silks and wools cold, reshape while damp and dry away from direct sun; line is best kept crisp with a low-temperature iron. Silk is lovely in Douala's humidity when cut on the bias — it moves away from the body rather than clinging. Our journal has a full guide, and the concierge can advise per piece.",
    fr: "Lavez les soies et lainages à la main à froid, remettez en forme humide et séchez à l'abri du soleil ; le lin reste net avec un fer à basse température. La soie est idéale sous l'humidité de Douala lorsqu'elle est coupée en biais — elle s'écarte du corps au lieu d'y coller. Notre journal contient un guide complet, et le concierge conseille pièce par pièce.",
  },
  {
    topic: "made-to-measure",
    keywords: ["made to measure", "sur mesure", "custom", "bespoke", "tailored", "commission", "tailleur", "personalized", "personnalise"],
    en: "Yes — made-to-measure is at the heart of our atelier. Book a fitting at /appointments, and your stylist will take your measurements, guide you through fabrics and details, and confirm a timeline before the first cut. A deposit is arranged with your stylist.",
    fr: "Oui — le sur mesure est au cœur de notre atelier. Réservez un essayage sur /appointments, et votre styliste prendra vos mesures, vous guidera sur les matières et les détails, et confirmera un délai avant la première coupe. Un acompte est convenu avec votre styliste.",
  },
  {
    topic: "gift",
    keywords: ["gift", "cadeau", "occasion", "wedding", "mariage", "ceremony", "soiree", "event", "wear to", "dress for"],
    en: "Whether it is a wedding, an evening event or a gift for someone special, we can style you from head to toe — from a hand-finished silk gown to cufflinks and a bold tie. Tell me the occasion and I will suggest pieces from the current catalogue.",
    fr: "Qu'il s'agisse d'un mariage, d'une soirée ou d'un cadeau pour quelqu'un de spécial, nous vous habillons de la tête aux pieds — d'une robe de soie finie à la main aux boutons de manchette et à une bold tie. Dites-moi l'occasion et je vous suggère des pièces du catalogue actuel.",
  },
  {
    topic: "concierge",
    keywords: ["concierge", "assistant", "help", "can you", "what can you", "ai", "chat"],
    en: "I am the OSSZ Concierge, your personal shopping assistant. I can search the live catalogue, check stock and prices, suggest pieces for an occasion, track orders, answer questions about delivery, payment and returns, and book you a fitting at our Ange Raphael boutique. Ask me anything about OSSZ Collections.",
    fr: "Je suis le Concierge OSSZ, votre assistant shopping personnel. Je peux rechercher dans le catalogue en direct, vérifier les stocks et les prix, suggérer des pièces selon l'occasion, suivre les commandes, répondre aux questions sur la livraison, le paiement et les retours, et réserver un essayage à notre boutique Ange Raphael. Posez-moi toutes vos questions sur OSSZ Collections.",
  },
  {
    topic: "vip",
    keywords: ["vip", "private viewing", "privilege", "early access", "membership", "account", "compte", "newsletter", "letter"],
    en: "The OSSZ letter keeps subscribers informed of new arrivals, private viewings and seasonal edits — never more than twice a month. Private viewings can also be arranged at the boutique; mention it when booking your appointment.",
    fr: "La lettre OSSZ informe les abonnés des nouveautés, présentations privées et sélections de saison — jamais plus de deux fois par mois. Des présentations privées peuvent aussi être organisées en boutique ; mentionnez-le lors de la réservation.",
  },
];

function detectFrench(text: string): boolean {
  return /[éèêàçùâîôûœ]|\b(bonjour|bonsoir|salut|merci|comment|vous|votre|je|suis|veux|voudrais|livraison|commande|rendez|taille|tailles|paiement|payer|retour|retours|boutique|horaires)\b/i.test(
    text,
  );
}

function kbMatch(text: string): KbEntry | null {
  let best: KbEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    let score = 0;
    for (const keyword of entry.keywords) {
      if (text.includes(keyword)) score += keyword.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

/** kbMatch variant that skips entries whose topic is in `excludeTopics`. */
function kbMatchExcluding(text: string, excludeTopics: string[]): KbEntry | null {
  let best: KbEntry | null = null;
  let bestScore = 0;
  for (const entry of KNOWLEDGE_BASE) {
    if (excludeTopics.includes(entry.topic)) continue;
    let score = 0;
    for (const keyword of entry.keywords) {
      if (text.includes(keyword)) score += keyword.length > 4 ? 2 : 1;
    }
    if (score > bestScore) {
      best = entry;
      bestScore = score;
    }
  }
  return bestScore > 0 ? best : null;
}

/* ------------------------------------------------------------------ */
/* Upgraded intent-aware fallback — used when the live LLM APIs are    */
/* unavailable, and also as a fast, grounded first reply so the        */
/* visitor is never left waiting.                                      */
/* ------------------------------------------------------------------ */

export async function fallbackReply(
  message: string,
  state: ConversationState,
  sessionId: string,
): Promise<{ reply: string; escalated: boolean }> {
  const text = message.toLowerCase();
  const settings = await cachedSettings();
  const french = detectFrench(text);
  const intent = classifyIntent(message);
  const locale = french ? "fr" : "en";

  // --- Human handoff ---
  const wantsHuman =
    /\b(human|agent|manager|whatsapp\b|speak (?:to|with) (?:someone|a|an|your)|talk (?:to|with) (?:someone|a|an|your)|real person|human assistance|un homme|vraiment une personne|je veux parler|une personne|contact.*humain|je préfère.*personne|parler à)/i.test(
      text,
    );
  if (wantsHuman && !/whatsapp number|whatsapp at|whatsapp \+|numéro whatsapp|numero whatsapp/i.test(text)) {
    const link = waLink(
      settings.whatsapp_number,
      `Hello OSSZ Collections. I was speaking with the Concierge and would like to continue with your team. My question: ${message}`,
    );
    return {
      reply: french
        ? `Bien sûr — notre équipe sera ravie de vous aider personnellement. Vous pouvez nous joindre sur WhatsApp ici : ${link}\n\nMerci de visiter OSSZ Collections ; ce fut un plaisir de vous assister.`
        : `Of course — our team would be glad to help you personally. You may reach us on WhatsApp here: ${link}\n\nThank you for visiting OSSZ Collections; it has been a pleasure to assist you.`,
      escalated: true,
    };
  }

  // --- Greeting ---
  if (/^(hi|hello|hey|good (morning|afternoon|evening)|bonjour|bonsoir|salut|coucou)\b/i.test(text.trim())) {
    const tail = french
      ? "Je serai ravi de vous aider à trouver une pièce, vérifier une taille, suivre une commande ou organiser un essayage. Que puis-je faire pour vous ?"
      : "I would be glad to help you find a piece, check a size, track an order, or arrange a fitting. What may I do for you?";
    return { reply: tail, escalated: false };
  }

  // --- Thanks / goodbye ---
  if (/^(thank|thanks|merci|appreciate|nice one|merci bcp|merci beaucoup|super merci|parfait merci)/i.test(text.trim())) {
    const tail = french
      ? "Avec plaisir. Si quoi que ce soit vous amène à nouveau, je suis là — et notre équipe reste joignable sur WhatsApp."
      : "My pleasure. If anything brings you back, I am here — and our team is always reachable on WhatsApp.";
    return { reply: tail, escalated: false };
  }
  if (
    /^(bye|goodbye|see you|au revoir|à plus|a plus|cya|nothing else|that's all|ca marche|merci ca suffit|je n'ai plus besoin|plus besoin)/i.test(
      text.trim(),
    )
  ) {
    const tail = french
      ? "Ce fut un plaisir de vous aider. Au plaisir de vous revoir chez OSSZ Collections."
      : "It has been a pleasure to assist you. I hope to see you again at OSSZ Collections.";
    return { reply: tail, escalated: false };
  }

  // --- Appointment cancel ---
  if (intent.type === "appointment_cancel") {
    const ref = (message.match(/\b(APT-[A-Z0-9]+)\b/i) ?? [])[0]
      ?? (message.match(/\b([A-Z]{3}-[A-Z0-9]{3,5})\b/i) ?? [])[0]
      ?? "";
    if (ref) {
      return {
        reply: french
          ? `Merci de votre message. Pour annuler le rendez-vous ${ref}, pourriez-vous me confirmer le numéro ou l'e-mail utilisé lors de la réservation ? Je souhaite m'assurer de bien annuler la bonne réservation.`
          : `Thank you — to cancel appointment ${ref}, could you confirm the number or email used when booking? I want to be sure I cancel the right reservation.`,
        escalated: false,
      };
    }
    return {
      reply: french
        ? "Je serai heureux de vous aider à annuler votre rendez-vous. Pourriez-vous me donner la référence (elle ressemble à APT-XXXX) et le numéro ou l'e-mail utilisé lors de la réservation ?"
        : "I would be happy to help cancel your appointment. Could you share the reference (it looks like APT-XXXX) and the number or email used when booking?",
      escalated: false,
    };
  }

  // --- Appointment reschedule ---
  if (intent.type === "appointment_reschedule") {
    const ref = (message.match(/\b(APT-[A-Z0-9]+)\b/i) ?? [])[0] ?? "";
    if (ref) {
      return {
        reply: french
          ? `Pour reporter le rendez-vous ${ref}, pourriez-vous me donner la nouvelle date et l'heure qui vous conviennent, ainsi que le numéro ou l'e-mail utilisé lors de la réservation ?`
          : `To reschedule appointment ${ref}, could you share the new date and time that suit you, plus the number or email used when booking?`,
        escalated: false,
      };
    }
    return {
      reply: french
        ? "Je peux changer la date de votre rendez-vous sans problème. Pourriez-vous me donner la référence (APT-XXXX), la nouvelle date et l'heure souhaitée, ainsi que le contact utilisé lors de la réservation ?"
        : "I can move your appointment to a new slot no problem. Please share the reference (APT-XXXX), the new date and time you'd like, and the contact used when booking.",
      escalated: false,
    };
  }

  // --- Appointment book ---
  if (intent.type === "appointment_book") {
    return {
      reply: french
        ? "Avec plaisir — je vous propose un rendez-vous de style ou d'essayage gratuit. Pourriez-vous me donner votre nom, un numéro ou un e-mail, et la date et l'heure qui vous conviennent le mieux ?"
        : "With pleasure — I can arrange a complimentary styling or fitting appointment for you. May I have your name, a phone number or email, and the date and time that suit you best?",
      escalated: false,
    };
  }

  // --- Order tracking ---
  if (intent.type === "order_track") {
    const number = (message.match(/\bOSZ-[A-Z0-9]+\b/i) ?? [])[0]
      ?? (message.match(/\bAPT-[A-Z0-9]+\b/i) ?? [])[0]
      ?? (message.match(/\b([A-Z]{3}-[A-Z0-9]{3,6})\b/i) ?? [])[0]
      ?? "";
    if (number) {
      return {
        reply: french
          ? `Merci — je peux vérifier la commande ${number.toUpperCase()} tout de suite. Pourriez-vous me confirmer l'e-mail ou le numéro de téléphone utilisé lors de la commande ?`
          : `Thank you — I can look up order ${number.toUpperCase()} right away. Could you confirm the email or phone number used at checkout?`,
        escalated: false,
      };
    }
    return {
      reply: french
        ? "Je peux suivre votre commande tout de suite. Pourriez-vous me donner le numéro de commande (il ressemble à OSZ-XXXX) ainsi que l'e-mail ou le numéro de téléphone utilisé lors de la commande ?"
        : "I can track your order right away. Please share the order number (it looks like OSZ-XXXX) and the email or phone number used at checkout.",
      escalated: false,
    };
  }

  // --- Delivery / returns / payment / hours-location ---
  if (intent.type === "delivery_info") {
    const info = await runTool("get_delivery_info", {});
    const tail = french
      ? "\n\nLaissez-moi savoir si vous souhaitez commander ou si j'en peux dire davantage."
      : "\n\nLet me know if you'd like to place an order or if there's anything else I can help with.";
    return { reply: `${info.text}\n\n${tail}`, escalated: false };
  }

  if (intent.type === "returns_info") {
    const faq = await runTool("get_faq_answer", { topic: "returns" });
    const tail = french
      ? "\n\nSi vous souhaitez lancer un retour, répondez simplement à votre confirmation de commande ou écrivez-nous sur WhatsApp."
      : "\n\nTo start a return, simply reply to your order confirmation or message us on WhatsApp.";
    return { reply: `${faq.text}\n\n${tail}`, escalated: false };
  }

  if (intent.type === "payment_info") {
    const faq = await runTool("get_faq_answer", { topic: "payment" });
    const tail = french
      ? "\n\nSouhaitez-vous commander une pièce précise ? Je peux vous en suggérer quelques-unes selon votre occasion et votre budget."
      : "\n\nWould you like to order a specific piece? I can suggest a few based on your occasion and budget.";
    return { reply: `${faq.text}\n\n${tail}`, escalated: false };
  }

  if (intent.type === "hours_location") {
    // Use the hardcoded location string; only append a DIFFERENT KB entry
    // (e.g. contact, appointments) that might also be relevant.
    const kb = kbMatchExcluding(text, ["location"]);
    const loc = french
      ? "Notre boutique et atelier se trouvent à Ange Raphael, Douala, Cameroun. Horaires : lundi à vendredi 9h00–18h00, samedi 9h00–13h00, fermé le dimanche (sur rendez-vous)."
      : "Our boutique and atelier are at Ange Raphael, Douala, Cameroon. Opening hours: Monday to Friday 9:00–18:00, Saturday 9:00–13:00, closed Sunday (appointments by arrangement).";
    return { reply: loc + (kb ? `\n\n${french ? kb.fr : kb.en}` : ""), escalated: false };
  }

  // --- Browse / suggest ---
  // Off-scope guard: an unmatched message with NO product signal at all is
  // not a shopping request ("what is the capital of France?"). Answer with a
  // brief conversational redirect and NO cards so general questions can still
  // reach the LLM layer instead of getting a catalogue dump.
  const BROWSE_VERBS =
    /\b(show|find|suggest|recommend|search|looking|need|want|have|sell|got| browsing|montrez|cherche|conseille|propose|besoin|avez|vend)\b/i;
  if (
    intent.type === "browse_or_suggest" &&
    state.interests.length === 0 &&
    !BROWSE_VERBS.test(message)
  ) {
    return {
      reply: french
        ? "Je suis la conciergerie OSSZ — je vous aide pour nos pièces, tailles, commandes, livraisons et rendez-vous. Que puis-je faire pour vous aujourd'hui ?"
        : "I am the OSSZ Concierge — I can help with our pieces, sizes, orders, delivery and appointments. How may I assist you today?",
      escalated: false,
    };
  }

  // Follow-up context: if the visitor is refining the *same* browse (e.g.
  // "only black ones", "under 80,000", "the one for a wedding"), apply the
  // new filter on top of the last browsing context instead of restarting.
  const browseState = state.lastBrowsing
    ? applyFollowUp(state, message, locale)
    : null;

  // If the request is genuinely vague, ask ONE useful question before
  // dumping the catalogue. The check uses the *current message only* so a
  // specific new request ("I need shoes") clarifies instead of inheriting
  // last turn's occasion ("evening wear").
  const currentTurn = deriveState([{ role: "user", content: message }]);
  const turnHasCategory = currentTurn.interests.some((i) => i.kind === "category");
  const turnHasRichSignals = currentTurn.interests.some(
    (i) => i.kind === "occasion" || i.kind === "style" || i.kind === "collection",
  );
  if (
    intent.type === "browse_or_suggest" &&
    turnHasCategory &&
    !turnHasRichSignals
  ) {
    const question = clarifyRequest(currentTurn, locale);
    if (question) {
      return { reply: question, escalated: false };
    }
  }

  if (intent.type === "browse_or_suggest") {
    // Follow-up refinement: narrow the *same* browse when the visitor says
    // "only black ones", "under 75,000", "the one for a wedding"…
    const merged = browseState ?? state;

    // If the visitor has already asked about specific products, honour that
    if (state.lookedAt.length > 0) {
      const results = await runTool("search_products", {
        query: state.lookedAt.slice(0, 2).join(" "),
      });
      const tail = french
        ? "\n\nSouhaitez-vous que je vérifie les tailles ou la disponibilité de l'une de ces pièces en particulier ?"
        : "\n\nWould you like me to check sizes or availability for any of these in particular?";
      return { reply: `${results.text}\n\n${tail}`, escalated: false };
    }

    // 1) Recommend from the live catalogue, grounded in what the visitor has said
    const rec = await recommendProducts(merged, locale, 4);
    if (rec.items.length > 0) {
      const cards = productCards(rec.items, locale);
      const followUp = french
        ? "\n\nSouhaitez-vous que je vérifie les tailles disponibles pour l'une d'entre elles, ou que je vous propose autre chose selon l'occasion ?"
        : "\n\nWould you like me to check the available sizes for any of these, or suggest something else for your occasion?";
      const reply = `${rec.why}\n\n${cards}\n\n${followUp}`;
      return { reply, escalated: false };
    }

    // 2) Exact search yielded nothing — try progressive alternative search.
    //    Strict when the merged state carries concrete constraints: never
    //    answer a constrained request with unrelated favourites.
    const mergedHasConstraints = merged.interests.some((i) =>
      i.kind === "category" || i.kind === "colour" || i.kind === "size" || i.kind === "maxPrice",
    );
    const alt = await progressiveSearch(merged, locale, { strict: mergedHasConstraints });
    if (alt.items.length > 0 && alt.level !== "none") {
      const cards = productCards(alt.items, locale);
      const followUp = french
        ? "\n\nSouhaitez-vous que je vérifie les tailles disponibles pour l'une d'entre elles ?"
        : "\n\nWould you like me to check the available sizes for any of these?";
      return { reply: `${alt.why}\n\n${cards}\n\n${followUp}`, escalated: false };
    }

    // 3) Nothing in the catalogue at all — say so plainly, offer a next
    //    action, and record the gap so staff can improve the knowledge base.
    const tail = french
      ? "\n\nJe n'ai rien trouvé pour le moment. Souhaitez-vous que je vous propose des pièces de la même catégorie, ou préférez-vous nous contacter sur WhatsApp ?"
      : "\n\nI could not find anything matching that right now. Would you like me to suggest pieces in the same category, or would you prefer to contact us on WhatsApp?";
    await insertAiGap(
      sessionId,
      message.slice(0, 500),
      locale,
      intent.type,
      "progressiveSearch",
      alt.level !== "none" ? alt.level : "no results",
      french
        ? "Aucun produit trouvé dans le catalogue actuel après recherche progressive."
        : "No products found in the current catalogue after progressive search.",
    );
    return { reply: `${alt.why}${tail}`, escalated: false };
  }

  // Fallback for anything else — treat it as a product search with whatever
  // signals the visitor gave, and ALWAYS answer with verified catalogue
  // cards rather than raw tool text (grounding rule).
  // Strict mode: when the visitor stated concrete constraints (category,
  // colour, size, budget), skip the "favourites" last resort — recommending
  // pieces that ignore the request is exactly the behaviour we must avoid.
  const hasConstraints = state.interests.some((i) =>
    i.kind === "category" || i.kind === "colour" || i.kind === "size" || i.kind === "maxPrice",
  );
  const rec = await recommendProducts(state, locale, 4);
  if (rec.items.length > 0) {
    const cards = productCards(rec.items, locale);
    const tail = french
      ? "\n\nJe peux continuer à chercher si vous me guidez — une occasion, une couleur, un style, une taille…"
      : "\n\nI can keep looking if you point me in the right direction — an occasion, a colour, a style, a size…";
    return { reply: `${rec.why}\n\n${cards}\n\n${tail}`, escalated: false };
  }

  const alt = await progressiveSearch(state, locale, { strict: hasConstraints });
  if (alt.items.length > 0 && alt.level !== "none") {
    const cards = productCards(alt.items, locale);
    const tail = french
      ? "\n\nSouhaitez-vous que je vérifie les tailles disponibles pour l'une d'entre elles ?"
      : "\n\nWould you like me to check the available sizes for any of these?";
    return { reply: `${alt.why}\n\n${cards}\n\n${tail}`, escalated: false };
  }

  // Nothing matched — even after honest broadening. Record the gap so staff
  // can review exactly what visitors ask for that the catalogue lacks.
  await insertAiGap(
    sessionId,
    message.slice(0, 500),
    locale,
    intent.type,
    "recommendProducts + progressiveSearch",
    alt.level !== "none" ? alt.level : "no results",
    french
      ? "Aucun produit trouvé dans le catalogue actuel."
      : "No products found in the current catalogue.",
  );

  await insertAiGap(
    sessionId,
    message.slice(0, 500),
    locale,
    intent.type,
    "recommendProducts + progressiveSearch",
    alt.level !== "none" ? alt.level : "no results",
    french
      ? "Aucun produit trouvé dans le catalogue actuel."
      : "No products found in the current catalogue.",
  );
  const tail = french
    ? "\n\nJe n'ai rien trouvé pour le moment. Souhaitez-vous que je vous propose des pièces de la même catégorie, ou préférez-vous nous contacter sur WhatsApp ?"
    : "\n\nI could not find anything matching that right now. Would you like me to suggest pieces in the same category, or would you prefer to contact us on WhatsApp?";
  return { reply: `${alt.why}${tail}`, escalated: false };
}

/** When the visitor's message is a relative refinement of the last browse
 *  ("only black ones", "under 80,000", "the one for a wedding"), merge the
 *  new signal into a temporary browsing state so the reply narrows the same
 *  query. */
function applyFollowUp(
  state: ConversationState,
  message: string,
  locale: string,
): ConversationState | null {
  const text = message.toLowerCase();
  if (!state.lastBrowsing) return null;

  // Does this message clearly refine the *same* browse, rather than start
  // a brand-new request?
  const isRefinement =
    /only|just|the one|for.*same|en.*plus|que.*celle|celle.*ci|ce.*ci|même|seulement|uniquement|unique/i.test(
      text,
    ) ||
    /under \d|moins de \d|up to \d|maximum|jusqu'|pas plus de|nouveau|autre|autres/i.test(text) ||
    /noir|black|blanc|white|jaune|amber|vert|green|bleu|blue|mauve|burgundy|rouge|bordeaux|teal|marine|night|midnight|olive|camel|beige|cream|crème|gold|doré|indigo/i.test(
      text,
    ) ||
    /for.*wedding|pour.*mariage|for.*evening|pour.*soirée|for.*dinner|pour.*dîner|for.*cocktail|pour.*cocktail|for.*gala|pour.*gala/i.test(
      text,
    );

  if (!isRefinement) return null;

  const next = structuredClone(state);
  next.interests = [];
  next.candidates = [];
  next.awaitingConfirmation = [];

  // Carry over the last browsing context, then overlay the new refinement.
  next.lastBrowsing = structuredClone(state.lastBrowsing);

  // Colour refinement
  for (const colour of COLOUR_KEYWORDS) {
    if (text.includes(colour.word)) {
      next.interests.push({ kind: "colour", value: colour.value, source: "stated" });
      next.lastBrowsing!.colour = colour.value;
    }
  }

  // Size refinement (word-boundary so "s"/"m"/"l" never match inside words)
  for (const size of SIZE_KEYWORDS) {
    if (new RegExp(`\\b${size.word}\\b`).test(text)) {
      next.interests.push({ kind: "size", value: size.value, source: "stated" });
      next.lastBrowsing!.size = size.value;
    }
  }

  // Price refinement
  const priceMatch = text.match(
    /under\s*(\d{3,6})|moins\s*de\s*(\d{3,6})|up\s*to\s*(\d{3,6})|maximum\s*(\d{3,6})|jusqu'[àa]\s*(\d{3,6})|pas\s*plus\s*de\s*(\d{3,6})/i,
  );
  if (priceMatch) {
    const max = Math.max(
      priceMatch[1] ? Number(priceMatch[1]) : 0,
      priceMatch[2] ? Number(priceMatch[2]) : 0,
      priceMatch[3] ? Number(priceMatch[3]) : 0,
      priceMatch[4] ? Number(priceMatch[4]) : 0,
      priceMatch[5] ? Number(priceMatch[5]) : 0,
      priceMatch[6] ? Number(priceMatch[6]) : 0,
    );
    if (max > 0) {
      next.interests.push({ kind: "priceZone", value: "lower", source: "stated" });
      next.lastBrowsing!.maxPrice = max;
    }
  }

  // Occasion refinement
  for (const occasion of OCCASION_KEYWORDS) {
    if (text.includes(occasion.word)) {
      next.interests.push({ kind: "occasion", value: occasion.value, source: "stated" });
      next.lastBrowsing!.occasion = occasion.value;
    }
  }

  // Carry over the category/collection from the ongoing browse so the merged
  // state still knows *what* the visitor is browsing ("only black ones" →
  // black + whatever category they were browsing).
  if (state.lastBrowsing?.category) {
    next.interests.push({
      kind: "category",
      value: state.lastBrowsing.category,
      source: "stated",
    });
  }
  if (state.lastBrowsing?.collection) {
    next.interests.push({
      kind: "collection",
      value: state.lastBrowsing.collection,
      source: "stated",
    });
  }

  // If no new refinement was added, this isn't a useful refinement.
  if (
    !next.interests.some(
      (i) => i.kind === "colour" || i.kind === "size" || i.kind === "priceZone" || i.kind === "occasion",
    )
  ) {
    return null;
  }

  return next;
}

/* ------------------------------------------------------------------ */
/* Tool definitions & runner                                           */
/* ------------------------------------------------------------------ */

export const TOOL_DEFINITIONS = [
  {
    name: "search_products",
    description:
      "Search the live OSSZ catalogue by free text, colour, size or price range. Always use this before mentioning any product or price.",
    input_schema: {
      type: "object" as const,
      properties: {
        query: { type: "string", description: "Words describing the piece, e.g. 'green evening dress'" },
        colour: { type: "string" },
        size: { type: "string" },
        max_price: { type: "number", description: "Maximum price in FCFA" },
      },
    },
  },
  {
    name: "check_stock",
    description: "Check live availability and sizes for one product, identified by its name or slug.",
    input_schema: {
      type: "object" as const,
      properties: { product: { type: "string" } },
      required: ["product"],
    },
  },
  {
    name: "get_order_status",
    description: "Look up an order using the order number plus the email or phone used at checkout.",
    input_schema: {
      type: "object" as const,
      properties: { order_number: { type: "string" }, contact: { type: "string" } },
      required: ["order_number", "contact"],
    },
  },
  {
    name: "book_appointment",
    description:
      "Request an in-store styling or fitting appointment. Confirm the details with the visitor before calling this.",
    input_schema: {
      type: "object" as const,
      properties: {
        name: { type: "string" },
        contact: { type: "string", description: "Phone or email" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM in 24h" },
        service: { type: "string" },
      },
      required: ["name", "contact", "date", "time"],
    },
  },
  {
    name: "reschedule_appointment",
    description:
      "Move an existing appointment to a new slot. Requires the reference (APT-XXXX) and the contact used to book. Confirm the new time with the visitor first.",
    input_schema: {
      type: "object" as const,
      properties: {
        reference: { type: "string" },
        contact: { type: "string" },
        date: { type: "string", description: "YYYY-MM-DD" },
        time: { type: "string", description: "HH:MM in 24h" },
      },
      required: ["reference", "contact", "date", "time"],
    },
  },
  {
    name: "cancel_appointment",
    description:
      "Cancel an appointment. Requires the reference and the contact used to book. Always confirm with the visitor before calling.",
    input_schema: {
      type: "object" as const,
      properties: { reference: { type: "string" }, contact: { type: "string" } },
      required: ["reference", "contact"],
    },
  },
  {
    name: "get_delivery_info",
    description: "Return the current delivery zones, fees and estimated timelines.",
    input_schema: { type: "object" as const, properties: {} },
  },
  {
    name: "get_faq_answer",
    description: "Answer from the store's published FAQ and policies (returns, payment, hours, location).",
    input_schema: {
      type: "object" as const,
      properties: { topic: { type: "string" } },
      required: ["topic"],
    },
  },
  {
    name: "escalate_to_whatsapp",
    description:
      "Hand the visitor to a human on WhatsApp with a short summary of the conversation. Returns a wa.me link.",
    input_schema: {
      type: "object" as const,
      properties: { summary: { type: "string" } },
      required: ["summary"],
    },
  },
];

export async function runTool(name: string, input: Record<string, unknown>): Promise<ToolResult> {
  switch (name) {
    case "search_products": {
      const results = await listProducts({
        q: typeof input.query === "string" && input.query ? input.query : undefined,
        colour: typeof input.colour === "string" && input.colour ? input.colour : undefined,
        size: typeof input.size === "string" && input.size ? input.size : undefined,
        maxPrice: typeof input.max_price === "number" ? input.max_price : undefined,
        limit: 6,
      });
      if (results.length === 0) {
        const fallback = await listProducts({ limit: 4, sort: "popular" });
        return {
          text:
            "No exact match in the live catalogue. Current favourites: " +
            fallback
              .map((p) => `${p.name} (${formatXAF(p.basePrice)}) /product/${p.slug}`)
              .join("; "),
          data: fallback,
        };
      }
      return {
        text: results
          .map(
            (p) =>
              `${p.name} — ${formatXAF(p.basePrice)} — sizes ${p.sizes.join("/")} — colours ${p.colours.join(
                "/",
              )} — ${p.inStock ? "in stock" : "sold out"} — /product/${p.slug}`,
          )
          .join("\n"),
        data: results,
      };
    }

    case "check_stock": {
      const term = `%${String(input.product ?? "")}%`;
      const found = (
        await db
          .select()
          .from(products)
          .where(
            and(
              eq(products.isPublished, true),
              or(ilike(products.name, term), ilike(products.slug, term)),
            ),
          )
          .limit(1)
      )[0];
      if (!found) return { text: "That piece is not in the live catalogue." };
      const variants = await db
        .select()
        .from(productVariants)
        .where(eq(productVariants.productId, found.id))
        .orderBy(asc(productVariants.id));
      const lines = variants
        .map(
          (v) =>
            `${v.size} / ${v.colour}: ${v.stockQty > 0 ? `${v.stockQty} available` : "sold out"} — ${formatXAF(
              v.priceOverride ?? found.basePrice,
            )}`,
        )
        .join("\n");
      return {
        text: `${found.name} (/product/${found.slug})\n${lines}`,
        data: { slug: found.slug, name: found.name },
      };
    }

    case "get_order_status": {
      const number = String(input.order_number ?? "").trim().toUpperCase();
      const contact = String(input.contact ?? "").trim();
      const order = (await db.select().from(orders).where(eq(orders.orderNumber, number)).limit(1))[0];
      if (!order) return { text: "No order was found with that number." };
      const matches =
        order.guestEmail.toLowerCase() === contact.toLowerCase() ||
        order.guestPhone.replace(/\D/g, "") === contact.replace(/\D/g, "");
      if (!matches) {
        return {
          text: "The contact detail does not match that order. Ask the visitor to confirm it.",
        };
      }
      const items = await db.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      return {
        text: `Order ${order.orderNumber} — status: ${STATUS_LABELS[order.status] ?? order.status}. Total ${formatXAF(
          order.total,
        )}. Delivery: ${order.deliveryZone}. Items: ${items
          .map((i) => `${i.quantity} × ${i.productName} (${i.variantLabel})`)
          .join(", ")}.`,
        data: { status: order.status, orderNumber: order.orderNumber },
      };
    }

    case "book_appointment": {
      const date = String(input.date ?? "");
      const time = String(input.time ?? "");
      const start = new Date(`${date}T${time}:00`);
      if (Number.isNaN(start.getTime())) return { text: "That date or time could not be read." };
      if (start.getTime() < Date.now()) return { text: "That slot is in the past — please offer another." };
      const clash = (
        await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.slotStart, start),
              eq(appointments.status, "confirmed"),
            ),
          )
          .limit(1)
      )[0];
      if (clash) return { text: "That slot is already taken. Please offer a different time." };
      const reference = makeReference("APT");
      await db.insert(appointments).values({
        reference,
        guestName: String(input.name ?? "Guest"),
        guestContact: String(input.contact ?? ""),
        service: String(input.service ?? "Styling session"),
        slotStart: start,
        slotEnd: new Date(start.getTime() + 60 * 60 * 1000),
        status: "requested",
        notes: "Booked via the OSSZ Concierge",
      });
      return {
        text: `Appointment ${reference} requested for ${formatDateTime(start)}. A stylist will confirm shortly.`,
        data: { reference },
      };
    }

    case "reschedule_appointment": {
      const ref = String(input.reference ?? "").trim().toUpperCase();
      const contact = String(input.contact ?? "").trim();
      const existing = (await db.select().from(appointments).where(eq(appointments.reference, ref)).limit(1))[0];
      if (!existing) return { text: "No appointment was found with that reference." };
      const matches =
        existing.guestContact.toLowerCase() === contact.toLowerCase() ||
        existing.guestContact.replace(/\D/g, "") === contact.replace(/\D/g, "");
      if (!matches) {
        return {
          text: "That contact detail does not match the booking. Ask the visitor to confirm it.",
        };
      }
      const start = new Date(`${String(input.date ?? "")}T${String(input.time ?? "")}:00`);
      if (Number.isNaN(start.getTime())) return { text: "That date or time could not be read." };
      if (start.getTime() < Date.now()) return { text: "That slot is in the past — please offer another." };
      const clash = (
        await db
          .select()
          .from(appointments)
          .where(
            and(
              eq(appointments.slotStart, start),
              eq(appointments.status, "confirmed"),
            ),
          )
          .limit(1)
      )[0];
      if (clash) return { text: "That slot is taken. Please offer a different time." };
      await db
        .update(appointments)
        .set({
          slotStart: start,
          slotEnd: new Date(start.getTime() + 3600000),
          status: "requested",
        })
        .where(eq(appointments.id, existing.id));
      return { text: `Appointment ${ref} moved to ${formatDateTime(start)}. A stylist will confirm shortly.` };
    }

    case "cancel_appointment": {
      const ref = String(input.reference ?? "").trim().toUpperCase();
      const contact = String(input.contact ?? "").trim();
      const existing = (await db.select().from(appointments).where(eq(appointments.reference, ref)).limit(1))[0];
      if (!existing) return { text: "No appointment was found with that reference." };
      const matches =
        existing.guestContact.toLowerCase() === contact.toLowerCase() ||
        existing.guestContact.replace(/\D/g, "") === contact.replace(/\D/g, "");
      if (!matches) {
        return {
          text: "That contact detail does not match the booking. Ask the visitor to confirm it.",
        };
      }
      await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, existing.id));
      return {
        text: `Appointment ${ref} has been cancelled. The visitor is welcome to book again at any time.`,
      };
    }

    case "get_delivery_info": {
      const zones = await listDeliveryZones();
      return {
        text: zones
          .map((z) => `${z.name}: ${z.fee === 0 ? "free" : formatXAF(z.fee)} — ${z.etaLabel}`)
          .join("\n"),
        data: zones,
      };
    }

    case "get_faq_answer": {
      const topic = String(input.topic ?? "").toLowerCase();
      const [all, settings] = await Promise.all([listFaqs(), getSettings()]);
      const hit = all.filter(
        (f) =>
          f.question.toLowerCase().includes(topic) ||
          f.answer.toLowerCase().includes(topic) ||
          f.category.toLowerCase().includes(topic),
      );
      const chosen = hit.length ? hit.slice(0, 3) : all.slice(0, 3);
      return {
        text:
          chosen
            .map((f) => `Q: ${f.question}\nA: ${f.answer}`)
            .join("\n\n") +
          `\n\nStore: ${settings.store_address}. Hours: ${settings.business_hours}.`,
        data: chosen,
      };
    }

    case "escalate_to_whatsapp": {
      const settings = await cachedSettings();
      const summary = String(input.summary ?? "A visitor would like to speak with the OSSZ team.");
      return {
        text: `WhatsApp link ready: ${waLink(settings.whatsapp_number, `Hello OSSZ Collections. ${summary}`)}`,
        data: {
          link: waLink(settings.whatsapp_number, `Hello OSSZ Collections. ${summary}`),
          number: settings.whatsapp_number,
        },
      };
    }

    default:
      return { text: "Unknown tool." };
  }
}

export async function buildSystemPrompt(locale: string = "en"): Promise<string> {
  const settings = await cachedSettings();
  const langInstruction = locale === "fr"
    ? `\n\nCRITICAL: The visitor is browsing in French. ALL your replies must be written entirely in French. Do not reply in English unless the visitor explicitly writes in English.`
    : `\n\nCRITICAL: The visitor is browsing in English. All your replies must be written entirely in English unless the visitor writes in French.`;
  return `You are the OSSZ Concierge, the official AI shopping assistant for OSSZ Collections, a fashion boutique based in Douala, Cameroon.

Your personality: warm, gracious, attentive, and precise — like a trusted boutique host. You are polite from your very first word to your very last, no matter how a visitor speaks to you. You listen carefully, remember what the visitor tells you, and tailor your replies to their occasion, style, colour, size and budget — never generic.

Your job: help visitors browse and find products, understand sizing and care, place or track orders, book fitting/styling appointments, and answer questions about delivery, payment, and returns.

Rules you always follow:
1. Keep replies short and easy to read. Ask one question at a time.
2. Never state a price, stock level, or delivery date from memory — always use your tools to check the real, current information.
3. Confirm details back to the visitor before booking, changing, or cancelling anything.
4. When a visitor expresses a wish (an occasion, a style, a colour, a budget, a category), search the live catalogue with those signals and recommend pieces that genuinely fit — tell the visitor *why* each piece fits.
5. Remember what you have already suggested in this conversation; never repeat the same recommendation. Follow up naturally ("the piece I mentioned earlier", "another option in the same vein").
6. If you cannot fully resolve a request, or the visitor asks for a person, warmly offer to connect them with the OSSZ team on WhatsApp at ${settings.whatsapp_number}, and summarise the conversation so they don't have to repeat themselves.
7. Never discuss topics unrelated to OSSZ Collections, and never provide legal, medical, or financial advice.
8. Close every conversation graciously, thanking the visitor for their time, whether or not you handed them off to WhatsApp.
9. Read the conversation state passed with each request — it summarises what the visitor has already told you (interests, products looked at, products already suggested). Use it.${langInstruction}

Useful context: the boutique is at ${settings.store_address}. Opening hours: ${settings.business_hours}. Product links look like /product/<slug> — share them as plain paths.

The conversation state for this request:
- interests: a list of what the visitor has already told you about their occasion, style, colour, size, price zone, category, collection, fabric.
- lookedAt: slugs of products the visitor has already asked about.
- candidates: slugs of products you have already suggested in this conversation (do not suggest these again).

When you recommend, keep it to a small, curated set — 2 to 4 pieces — and always give a short reason each one fits.`;
}

/** Record a question the concierge could not answer confidently, so staff
 *  can review it in the admin "AI Gaps" inbox and add an approved answer. */
export async function insertAiGap(
  sessionId: string,
  question: string,
  locale: string,
  intent: string,
  searchPerformed: string,
  searchResult: string,
  reason: string,
): Promise<void> {
  try {
    await db
      .insert(aiGaps)
      .values({
        sessionId,
        question: String(question).slice(0, 500),
        locale: locale === "fr" ? "fr" : "en",
        detectedIntent: String(intent).slice(0, 60),
        searchPerformed: String(searchPerformed).slice(0, 200),
        searchResult: String(searchResult).slice(0, 500),
        reason: String(reason).slice(0, 500),
        status: "open",
      })
      .onConflictDoNothing();
  } catch {
    // Logging must never break the conversation.
  }
}
