"use client";

import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n";

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export function PwaProvider({ locale }: { locale: Locale }) {
  const [deferred, setDeferred] = useState<InstallPromptEvent | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    // Escape hatch: /?sw=reset unregisters everything and clears caches, for
    // the rare case a stale worker is wedged in someone's browser.
    if (new URLSearchParams(window.location.search).get("sw") === "reset") {
      void (async () => {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((r) => r.unregister()));
        if ("caches" in window) {
          const keys = await caches.keys();
          await Promise.all(keys.map((k) => caches.delete(k)));
        }
        window.location.replace(window.location.pathname);
      })();
      return;
    }

    if (process.env.NEXT_PUBLIC_DISABLE_SW === "1") return;

    // Skip inside an iframe. Preview panes embed the site cross-origin, where a
    // caching worker adds risk (stale shell, dead chunks) and no benefit.
    const framed = window.self !== window.top;
    if (framed) return;

    // Register after load so the worker never competes with first paint.
    const register = () => {
      navigator.serviceWorker
        .register("/sw.js", { updateViaCache: "none" })
        .then((reg) => {
          // Always check for a newer worker on load, so a deploy is picked up
          // on the next visit rather than lingering for days.
          reg.update().catch(() => {});
        })
        .catch(() => {});
    };

    // When a new worker takes over, reload once so the page and its assets come
    // from the same build. Without this a tab can mix old and new output, which
    // breaks server actions with "Failed to find Server Action".
    let reloading = false;
    const onControllerChange = () => {
      if (reloading) return;
      reloading = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);
    if (document.readyState === "complete") register();
    else window.addEventListener("load", register, { once: true });

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  useEffect(() => {
    const onPrompt = (event: Event) => {
      event.preventDefault();
      setDeferred(event as InstallPromptEvent);
      if (!sessionStorage.getItem("ossz-install-dismissed")) {
        window.setTimeout(() => setVisible(true), 20000);
      }
    };
    if (window.self !== window.top) return;
    window.addEventListener("beforeinstallprompt", onPrompt);
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  if (!visible || !deferred) return null;

  return (
    <div className="fixed bottom-24 left-4 z-[65] max-w-[15rem] rounded-sm border border-line bg-paper p-4 shadow-lg rise md:left-6">
      <p className="text-sm leading-relaxed text-ink-soft">{t(locale, "install.cta")}</p>
      <div className="mt-3 flex gap-2">
        <button
          className="btn btn-primary btn-sm"
          onClick={async () => {
            setVisible(false);
            await deferred.prompt();
            setDeferred(null);
          }}
        >
          OK
        </button>
        <button
          className="btn btn-ghost btn-sm"
          onClick={() => {
            sessionStorage.setItem("ossz-install-dismissed", "1");
            setVisible(false);
          }}
        >
          {t(locale, "install.dismiss")}
        </button>
      </div>
    </div>
  );
}
