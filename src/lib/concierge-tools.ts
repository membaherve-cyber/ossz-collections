import { and, asc, desc, eq, gte, ilike, or } from "drizzle-orm";
import { db } from "@/db";
import { appointments, orderItems, orders, productVariants, products } from "@/db/schema";
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
            fallback.map((p) => `${p.name} (${formatXAF(p.basePrice)}) /product/${p.slug}`).join("; "),
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
          .where(and(eq(products.isPublished, true), or(ilike(products.name, term), ilike(products.slug, term))))
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
        return { text: "The contact detail does not match that order. Ask the visitor to confirm it." };
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
          .where(and(eq(appointments.slotStart, start), eq(appointments.status, "confirmed")))
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
      const existing = (
        await db.select().from(appointments).where(eq(appointments.reference, ref)).limit(1)
      )[0];
      if (!existing) return { text: "No appointment was found with that reference." };
      const matches =
        existing.guestContact.toLowerCase() === contact.toLowerCase() ||
        existing.guestContact.replace(/\D/g, "") === contact.replace(/\D/g, "");
      if (!matches) {
        return { text: "That contact detail does not match the booking. Ask the visitor to confirm it." };
      }
      const start = new Date(`${String(input.date ?? "")}T${String(input.time ?? "")}:00`);
      if (Number.isNaN(start.getTime())) return { text: "That date or time could not be read." };
      if (start.getTime() < Date.now()) return { text: "That slot is in the past — please offer another." };
      const clash = (
        await db
          .select()
          .from(appointments)
          .where(and(eq(appointments.slotStart, start), eq(appointments.status, "confirmed")))
          .limit(1)
      )[0];
      if (clash) return { text: "That slot is taken. Please offer a different time." };
      await db
        .update(appointments)
        .set({ slotStart: start, slotEnd: new Date(start.getTime() + 3600000), status: "requested" })
        .where(eq(appointments.id, existing.id));
      return { text: `Appointment ${ref} moved to ${formatDateTime(start)}. A stylist will confirm shortly.` };
    }

    case "cancel_appointment": {
      const ref = String(input.reference ?? "").trim().toUpperCase();
      const contact = String(input.contact ?? "").trim();
      const existing = (
        await db.select().from(appointments).where(eq(appointments.reference, ref)).limit(1)
      )[0];
      if (!existing) return { text: "No appointment was found with that reference." };
      const matches =
        existing.guestContact.toLowerCase() === contact.toLowerCase() ||
        existing.guestContact.replace(/\D/g, "") === contact.replace(/\D/g, "");
      if (!matches) {
        return { text: "That contact detail does not match the booking. Ask the visitor to confirm it." };
      }
      await db.update(appointments).set({ status: "cancelled" }).where(eq(appointments.id, existing.id));
      return { text: `Appointment ${ref} has been cancelled. The visitor is welcome to book again at any time.` };
    }

    case "get_delivery_info": {
      const zones = await listDeliveryZones();
      return {
        text:
          zones
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
          chosen.map((f) => `Q: ${f.question}\nA: ${f.answer}`).join("\n\n") +
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
    ? `

CRITICAL: The visitor is browsing in French. ALL your replies must be written entirely in French. Do not reply in English unless the visitor explicitly writes in English.`
    : `

CRITICAL: The visitor is browsing in English. All your replies must be written entirely in English unless the visitor writes in French.`;
  return `You are the OSSZ Concierge, the official AI shopping assistant for OSSZ Collections, a fashion boutique based in Douala, Cameroon.

Your personality: warm, gracious, attentive, and precise — like a trusted boutique host. You are polite from your very first word to your very last, no matter how a visitor speaks to you.

Your job: help visitors browse and find products, understand sizing and care, place or track orders, book fitting/styling appointments, and answer questions about delivery, payment, and returns.

Rules you always follow:
1. Keep replies short and easy to read. Ask one question at a time.
2. Never state a price, stock level, or delivery date from memory — always use your tools to check the real, current information.
3. Confirm details back to the visitor before booking, changing, or cancelling anything.
4. If you cannot fully resolve a request, or the visitor asks for a person, warmly offer to connect them with the OSSZ team on WhatsApp at ${settings.whatsapp_number}, and summarise the conversation so they don't have to repeat themselves.
5. Never discuss topics unrelated to OSSZ Collections, and never provide legal, medical, or financial advice.
6. Close every conversation graciously, thanking the visitor for their time, whether or not you handed them off to WhatsApp.${langInstruction}

Useful context: the boutique is at ${settings.store_address}. Opening hours: ${settings.business_hours}. Product links look like /product/<slug> — share them as plain paths.`;
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
    en: "OSSZ Collections is a Douala-based fashion house. Our tagline is “Bring Out The Class in You”. Every piece is a limited edition, masterfully tailored by people we know — designed, cut and finished entirely within our local atelier at Ange Raphael, Douala. We believe clothes made close to home, in small numbers, by people we know, are worth more than clothes made anywhere else.",
    fr: "OSSZ Collections est une maison de mode basée à Douala. Notre devise : « Révélez la classe en vous ». Chaque pièce est une édition limitée, taillée avec maîtrise par des personnes que nous connaissons — conçue, coupée et finie entièrement au sein de notre atelier local à Ange Raphael, Douala. Nous croyons que des vêtements faits près de chez soi, en petites séries, par des gens que l'on connaît, valent plus que tout autre vêtement.",
  },
  {
    topic: "collections",
    keywords: ["collection", "collections", "check moves", "freeme", "vive", "vivs", "95", "cultural canvas", "cultural heritage", "season"],
    en: "OSSZ has released five collections to date: Check Moves, Freeme (2021), 95 VIVS Element, Cultural Canvas, and Cultural Heritage. You can explore each one on the Collections page (/collections) — every collection is cut in a small run and finished by hand in our Douala atelier.",
    fr: "OSSZ a lancé cinq collections à ce jour : Check Moves, Freeme (2021), 95 VIVS Element, Cultural Canvas et Cultural Heritage. Vous pouvez les explorer sur la page Collections (/collections) — chaque collection est coupée en petite série et finie à la main dans notre atelier de Douala.",
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

/* ------------------------------------------------------------------ */
/* Deterministic fallback used when the live LLM APIs are unavailable  */
/* ------------------------------------------------------------------ */

export async function fallbackReply(message: string): Promise<{ reply: string; escalated: boolean }> {
  const text = message.toLowerCase();
  const settings = await cachedSettings();
  const french = detectFrench(text);

  const wantsHuman = /human|person|whatsapp|call|agent|speak to someone|manager|team/.test(text);
  if (wantsHuman && !/whatsapp number|whatsapp at|whatsapp \+/.test(text)) {
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

  if (/^(hi|hello|hey|good (morning|afternoon|evening)|bonjour|bonsoir|salut)\b/.test(text.trim())) {
    return {
      reply: french
        ? "Bonjour et bienvenue chez OSSZ Collections. Je serai ravi de vous aider à trouver une pièce, vérifier une taille, suivre une commande ou organiser un essayage. Que puis-je faire pour vous ?"
        : "Good day, and welcome to OSSZ Collections. I would be glad to help you find a piece, check a size, track an order, or arrange a fitting. What may I do for you?",
      escalated: false,
    };
  }

  if (/^(thank|thanks|merci|that is all|nothing else|bye|goodbye|au revoir)/.test(text.trim())) {
    return {
      reply: french
        ? "Ce fut un plaisir de vous aider. Si quoi que ce soit survient, je suis là à toute heure — et notre équipe reste joignable sur WhatsApp. Merci de visiter OSSZ Collections."
        : "It has been a pleasure to assist you. Should anything else arise, I am here at any hour — and our team is always reachable on WhatsApp. Thank you for visiting OSSZ Collections.",
      escalated: false,
    };
  }

  // Consult the knowledge base before falling back to live tools, so the
  // concierge can answer brand, collection, fabric, contact and service
  // questions even when both API keys fail.
  const kb = kbMatch(text);
  if (kb) {
    const tail = french ? "Puis-je vous aider pour autre chose ?" : "Is there anything else I may look into for you?";
    return {
      reply: `${french ? kb.fr : kb.en}\n\n${tail}`,
      escalated: false,
    };
  }

  if (/size|fit|measure|taille|sizing|care|wash|iron|fabric/.test(text)) {
    const faq = await runTool("get_faq_answer", { topic: "sizing" });
    return {
      reply: `${faq.text}\n\nIf you tell me the piece you have in mind, I will check the exact sizes we hold in stock.`,
      escalated: false,
    };
  }

  if (/deliver|shipping|ship|livraison/.test(text)) {
    const info = await runTool("get_delivery_info", {});
    return { reply: `Certainly. Here is our current delivery information:\n\n${info.text}\n\nMay I help with anything else?`, escalated: false };
  }

  if (/order|track|commande/.test(text) && /osz-/i.test(message)) {
    const number = (message.match(/OSZ-[A-Z0-9]+/i) ?? [""])[0];
    return {
      reply: `Thank you. I can check order ${number.toUpperCase()} straight away — could you kindly confirm the email address or phone number used at checkout?`,
      escalated: false,
    };
  }

  if (/return|refund|exchange|payment|pay|momo|orange|mtn|card|hour|open|where|located/.test(text)) {
    const faq = await runTool("get_faq_answer", { topic: text.slice(0, 40) });
    return { reply: `${faq.text}\n\nIs there anything else I may look into for you?`, escalated: false };
  }

  if (/appointment|fitting|styling|book|rendez/.test(text)) {
    return {
      reply:
        "It would be a pleasure to arrange that. May I have your name, a contact number, and the date and time you would prefer? You may also book directly at /appointments.",
      escalated: false,
    };
  }

  const results = await runTool("search_products", { query: message.slice(0, 60) });
  return {
    reply: `Here is what I found in our live catalogue:\n\n${results.text}\n\nWould you like me to check sizes or availability for any of these?`,
    escalated: false,
  };
}
