"use client";

import { useEffect, useRef, useState } from "react";
import { formatXAF } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };

type CardBlock = {
  kind: "card";
  slug: string;
  name: string;
  price: number;
  inStock: boolean;
  reason: string;
  image: string;
};

const QUICK_EN = [
  "Show me evening wear",
  "What are your delivery fees?",
  "Book a fitting appointment",
  "Track my order",
];
const QUICK_FR = [
  "Montrez-moi la haute couture du soir",
  "Quels sont vos frais de livraison ?",
  "Réserver un essayage",
  "Suivre ma commande",
];

function parseReply(
  text: string,
): Array<{ kind: "text"; html: React.ReactNode } | CardBlock> {
  const blocks: Array<{ kind: "text"; html: React.ReactNode } | CardBlock> = [];
  const lines = text.split(/\n/);
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (line.startsWith("CARD_START:")) {
      const slug = line.replace("CARD_START:", "").trim();
      let name = "",
        price = 0,
        inStock = false,
        reason = "",
        image = "";
      i++;
      while (i < lines.length && !lines[i].startsWith("CARD_END")) {
        const kv = lines[i].split(":");
        const key = kv[0];
        const value = kv.slice(1).join(":");
        if (key === "name") name = value;
        else if (key === "price") price = Number(value) || 0;
        else if (key === "inStock") inStock = value === "yes";
        else if (key === "reason") reason = value;
        else if (key === "image") image = value;
        i++;
      }
      blocks.push({ kind: "card", slug, name, price, inStock, reason, image });
      i++;
      continue;
    }
    const rendered = renderInline(line);
    blocks.push({ kind: "text", html: rendered });
    i++;
  }
  return blocks;
}

function renderInline(text: string): React.ReactNode {
  const parts = text.split(
    /(https?:\/\/[^\s]+|\/product\/[a-z0-9-]+|\/[a-z-]{3,})/gi,
  );
  return parts.map((part, index) => {
    if (/^https?:\/\//i.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noreferrer"
          className="text-accent underline break-all"
        >
          {part.includes("wa.me") ? "Open WhatsApp" : part}
        </a>
      );
    }
    if (/^\/[a-z0-9-]+/i.test(part)) {
      return (
        <a key={index} href={part} className="text-accent underline">
          {part}
        </a>
      );
    }
    return <span key={index}>{part}</span>;
  });
}

export function ConciergePanel({
  locale,
  greeting,
  whatsappUrl,
  whatsappNumber,
  onClose,
}: {
  locale: string;
  greeting: string;
  whatsappUrl: string;
  whatsappNumber: string;
  onClose: () => void;
}) {
  const fr = locale === "fr";
  const QUICK = fr ? QUICK_FR : QUICK_EN;
  const [pending, setPending] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    { role: "assistant", content: greeting },
  ]);
  const [draft, setDraft] = useState("");
  const scroller = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  async function send(text: string) {
    const clean = text.trim();
    if (!clean || pending) return;
    const next = [...messages, { role: "user" as const, content: clean }];
    setMessages(next);
    setDraft("");
    setPending(true);
    try {
      const res = await fetch("/api/concierge", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ messages: next.slice(1), locale }),
      });
      const data = (await res.json()) as { reply?: string };
      setMessages([
        ...next,
        {
          role: "assistant",
          content:
            data.reply ??
            (fr
              ? `Veuillez nous excuser, une interruption s'est produite. Notre équipe est toujours disponible sur WhatsApp au ${whatsappNumber}.`
              : `Forgive me, something interrupted us. Our team is always available on WhatsApp at ${whatsappNumber}.`),
        },
      ]);
    } catch {
      setMessages([
        ...next,
        {
          role: "assistant",
          content: fr
            ? `Veuillez nous excuser, je n'ai pas pu joindre notre système. Vous êtes toujours le bienvenu sur WhatsApp au ${whatsappNumber}.`
            : `Forgive me, I could not reach our system just now. You are always welcome on WhatsApp at ${whatsappNumber}.`,
        },
      ]);
    } finally {
      setPending(false);
    }
  }

  async function addToCart(slug: string) {
    try {
      const res = await fetch("/api/concierge/add-to-cart", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug }),
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (data.ok) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: fr
              ? `Ajouté au panier. ${data.message}`
              : `Added to your cart. ${data.message}`,
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              data.message ?? (fr ? "Impossible d'ajouter ce produit." : "Could not add that product."),
          },
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: fr
            ? `Une erreur est survenue. Essayez de visiter la page du produit.`
            : `Something went wrong. Try visiting the product page.`,
        },
      ]);
    }
  }

  return (
    <section
      aria-label="OSSZ Concierge"
      className="fixed bottom-24 right-2 z-[70] flex h-[70vh] max-h-[560px] w-[calc(100vw-1rem)] max-w-sm flex-col overflow-hidden rounded-sm border border-line bg-paper shadow-2xl rise md:right-6"
    >
      <header className="flex items-start justify-between gap-2 border-b border-line bg-ink px-4 py-3 text-white">
        <div>
          <p className="display text-lg leading-tight">
            {fr ? "Le Concierge OSSZ" : "The OSSZ Concierge"}
          </p>
          <p className="text-[0.7rem] tracking-[0.14em] uppercase text-white/70">
            {fr ? "À votre écoute, jour et nuit" : "Here for you, around the clock"}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="text-white/70 hover:text-white"
        >
          ×
        </button>
      </header>

      <p className="border-b border-line bg-canvas px-4 py-2 text-[0.65rem] leading-relaxed text-muted">
        {fr ? "Les conversations sont conservées afin d'améliorer notre service. Ne partagez pas vos coordonnées bancaires ici." : "Conversations are kept so we may improve our service. Please do not share card details here."}
      </p>

      <div ref={scroller} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`${
              msg.role === "user"
                ? "ml-auto max-w-[85%] bg-ink text-white"
                : "max-w-[85%] bg-accent-soft/60 text-ink-soft"
            } rounded-sm px-3 py-2 text-sm leading-relaxed`}
          >
            {msg.role === "assistant" ? (
              <div className="space-y-3">
                {parseReply(msg.content).map((block, bi) =>
                  block.kind === "card" ? (
                    <div key={bi} className="rounded-md border border-line overflow-hidden">
                      {block.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={block.image}
                          alt={block.name}
                          className="h-28 w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <div className="h-28 bg-muted relative">
                          <div className="w-full h-full flex items-center justify-center text-xs text-muted">
                            {fr ? "Aperçu du produit" : "Product preview"}
                          </div>
                        </div>
                      )}
                      <div className="p-3 space-y-1">
                        <p className="font-medium text-ink leading-tight">{block.name}</p>
                        <p className="text-xs text-accent">{formatXAF(block.price)}</p>
                        <p className="text-xs">
                          {block.inStock
                            ? fr
                              ? "En stock"
                              : "In stock"
                            : fr
                            ? "Épuisé"
                            : "Out of stock"}
                        </p>
                        {block.reason ? (
                          <p className="text-xs text-ink-soft leading-relaxed">
                            {renderInline(block.reason)}
                          </p>
                        ) : null}
                        <div className="flex gap-2 mt-2">
                          <a
                            href={`/product/${block.slug}`}
                            className="btn btn-primary btn-sm flex-1"
                          >
                            {fr ? "Voir le produit" : "View product"}
                          </a>
                          <button
                            type="button"
                            className="btn btn-ghost btn-sm"
                            disabled={!block.inStock || pending}
                            onClick={() => addToCart(block.slug)}
                          >
                            {fr ? "Ajouter" : "Add"}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div key={bi} className="whitespace-pre-wrap">
                      {block.html}
                    </div>
                  ),
                )}
              </div>
            ) : (
              <div className="whitespace-pre-wrap">{renderInline(msg.content)}</div>
            )}
          </div>
        ))}
        {pending ? (
          <p className="text-xs italic text-muted">
            {fr ? "Le concierge vérifie pour vous…" : "The concierge is checking for you…"}
          </p>
        ) : null}
      </div>

      {messages.length <= 2 ? (
        <div className="flex flex-wrap gap-2 border-t border-line px-3 py-2">
          {QUICK.map((q) => (
            <button key={q} className="chip" onClick={() => send(q)} type="button">
              {q}
            </button>
          ))}
        </div>
      ) : null}

      <form
        className="flex items-center gap-2 border-t border-line p-3"
        onSubmit={(event) => {
          event.preventDefault();
          void send(draft);
        }}
      >
        <label className="sr-only" htmlFor="concierge-input">
          Message the concierge
        </label>
        <input
          id="concierge-input"
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder={fr ? "Posez une question sur une pièce, une taille, une commande…" : "Ask about a piece, a size, an order…"}
          className="field"
          autoComplete="off"
        />
        <button
          className="btn btn-primary btn-sm"
          disabled={pending || !draft.trim()}
        >
          {fr ? "Envoyer" : "Send"}
        </button>
      </form>

      <a
        href={whatsappUrl}
        target="_blank"
        rel="noreferrer"
        className="border-t border-line bg-canvas px-4 py-3 text-center text-[0.7rem] tracking-[0.16em] uppercase text-ink-soft hover:text-accent"
      >
        {fr ? "Parler à un agent sur WhatsApp" : "Speak with an agent on WhatsApp"}
      </a>
    </section>
  );
}
