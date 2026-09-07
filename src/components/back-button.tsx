"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n";

/**
 * Global "go back" control.
 *
 * Uses real browser history where there is some, so the visitor returns to the
 * exact scroll position and filter state they left. When someone lands directly
 * on a deep page (a shared product link, a search result, the PWA opening on a
 * saved route) there is nothing to go back to, so we fall back to a sensible
 * parent section instead of leaving a dead button or bouncing them off-site.
 */

/** Parent section for each area, used when there is no history to return to. */
function parentOf(pathname: string): string {
  const rules: Array<[RegExp, string]> = [
    [/^\/product\//, "/shop"],
    [/^\/collections\/.+/, "/collections"],
    [/^\/journal\/.+/, "/journal"],
    [/^\/order\//, "/order-lookup"],
    [/^\/account\/.+/, "/account"],
    [/^\/admin\/orders\/.+/, "/admin/orders"],
    [/^\/admin\/products\/.+/, "/admin/products"],
    [/^\/admin\/.+/, "/admin"],
    [/^\/checkout/, "/cart"],
    [/^\/cart/, "/shop"],
    [/^\/reset-password/, "/login"],
    [/^\/forgot-password/, "/login"],
    [/^\/register/, "/login"],
    [/^\/size-guide/, "/faq"],
  ];
  for (const [re, target] of rules) if (re.test(pathname)) return target;
  return "/";
}

export function BackButton({
  locale = "en",
  className = "",
}: {
  locale?: Locale;
  className?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [canGoBack, setCanGoBack] = useState(false);

  useEffect(() => {
    // history.length > 1 means this tab has somewhere of its own to return to.
    setCanGoBack(typeof window !== "undefined" && window.history.length > 1);
  }, [pathname]);

  function goBack() {
    if (canGoBack) {
      router.back();
      return;
    }
    router.push(parentOf(pathname));
  }

  return (
    <button
      type="button"
      onClick={goBack}
      aria-label={t(locale, "nav.back")}
      className={`inline-flex items-center gap-1.5 text-xs tracking-[0.12em] uppercase text-ink-soft transition-colors hover:text-accent ${className}`}
    >
      <span aria-hidden className="text-sm leading-none">←</span>
      {t(locale, "nav.back")}
    </button>
  );
}
