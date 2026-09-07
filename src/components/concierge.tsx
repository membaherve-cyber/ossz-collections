"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import dynamic from "next/dynamic";

// The chat UI is a meaningful amount of JavaScript that most visitors never
// open, so it is fetched on first interaction rather than on every page load.
const ConciergePanel = dynamic(() =>
  import("@/components/concierge-panel").then((m) => m.ConciergePanel),
);

export function Concierge({
  locale,
  greeting,
  whatsappUrl,
  whatsappNumber,
}: {
  locale: string;
  greeting: string;
  whatsappUrl: string;
  whatsappNumber: string;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [nudge, setNudge] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const isKeyPage = pathname.startsWith("/product") || pathname.startsWith("/checkout");
    if (!isKeyPage) return;
    if (sessionStorage.getItem("ossz-concierge-nudged")) return;
    const timer = window.setTimeout(() => {
      sessionStorage.setItem("ossz-concierge-nudged", "1");
      setNudge(true);
    }, 12000);
    return () => window.clearTimeout(timer);
  }, [pathname]);

  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      {nudge && !open ? (
        <div className="fixed bottom-24 right-4 z-[60] max-w-[16rem] rounded-sm border border-line bg-paper p-4 shadow-lg rise md:right-6">
          <p className="text-sm leading-relaxed text-ink-soft">
            {locale === "fr" ? "Puis-je vous aider à trouver la bonne taille ou vérifier la disponibilité ?" : "May I help you find the right size or check availability?"}
          </p>
          <div className="mt-3 flex gap-2">
            <button className="btn btn-primary btn-sm" onClick={() => { setOpen(true); setNudge(false); }}>
              {locale === "fr" ? "Oui s'il vous plaît" : "Yes please"}
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setNudge(false)}>{locale === "fr" ? "Pas maintenant" : "Not now"}</button>
          </div>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => { setOpen((v) => !v); setNudge(false); }}
        aria-label={open ? "Close the OSSZ Concierge" : "Open the OSSZ Concierge"}
        className="fixed bottom-5 right-4 z-[70] flex h-14 w-14 items-center justify-center rounded-full bg-ink text-white shadow-xl transition-transform duration-200 hover:scale-105 md:right-6 concierge-btn"
      >
        <span className="display text-lg">{open ? "\u00d7" : "OZ"}</span>
      </button>

      {open ? (
        <ConciergePanel
          locale={locale}
          greeting={greeting}
          whatsappUrl={whatsappUrl}
          whatsappNumber={whatsappNumber}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </>
  );
}
