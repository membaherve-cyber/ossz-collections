"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { LOCALE_COOKIE, t, type Locale } from "@/lib/i18n";

export function LanguageSwitcher({ locale }: { locale: Locale }) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const next: Locale = locale === "en" ? "fr" : "en";

  function switchTo() {
    // SameSite=None so the preference survives inside a cross-origin iframe;
    // Secure is required alongside it and is dropped on plain-HTTP localhost.
    const secure = window.location.protocol === "https:";
    document.cookie =
      `${LOCALE_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; ` +
      (secure ? "samesite=none; secure" : "samesite=lax");
    // Update <html lang> immediately so assistive tech follows the switch,
    // then re-render the tree from the server in the new language.
    document.documentElement.lang = next;
    start(() => router.refresh());
  }

  return (
    <button
      type="button"
      onClick={switchTo}
      disabled={pending}
      aria-label={`Switch language to ${next === "fr" ? "Français" : "English"}`}
      className="inline-flex items-center gap-1 text-[0.72rem] tracking-[0.12em] uppercase text-ink-soft transition-colors hover:text-accent disabled:opacity-50"
    >
      <span className={locale === "en" ? "text-ink" : "text-muted"}>EN</span>
      <span aria-hidden className="text-line">|</span>
      <span className={locale === "fr" ? "text-ink" : "text-muted"}>FR</span>
      <span className="sr-only">{t(locale, "lang.switch")}</span>
    </button>
  );
}
