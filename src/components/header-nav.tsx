"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { t, type Locale } from "@/lib/i18n";
import { LanguageSwitcher } from "@/components/language-switcher";

const LINKS = [
  { href: "/shop", key: "nav.shop" },
  { href: "/collections", key: "nav.collections" },
  { href: "/lookbook", key: "nav.lookbook" },
  { href: "/journal", key: "nav.journal" },
  { href: "/appointments", key: "nav.appointments" },
  { href: "/about", key: "nav.about" },
] as const;

export function HeaderNav({
  itemCount,
  user,
  locale,
}: {
  itemCount: number;
  user: { name: string; role: string } | null;
  locale: Locale;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const backOffice = user && user.role !== "customer";

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all duration-200 ${
        scrolled ? "border-line bg-paper/95 backdrop-blur" : "border-transparent bg-canvas"
      }`}
    >
      {t(locale, "banner.freeDelivery") ? (
        <div className="bg-ink text-center text-[0.68rem] tracking-[0.2em] uppercase text-white/85 py-2 px-4">
          {t(locale, "banner.freeDelivery")}
        </div>
      ) : null}
      <div className="wrap flex items-center justify-between gap-4 py-4">
        <button
          type="button"
          aria-label={t(locale, "nav.openMenu")}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="md:hidden p-2 -ml-2"
        >
          <span className="block h-px w-6 bg-ink" />
          <span className="mt-[6px] block h-px w-6 bg-ink" />
          <span className="mt-[6px] block h-px w-4 bg-ink" />
        </button>

        <nav className="hidden md:flex items-center gap-7 text-[0.78rem] tracking-[0.14em] uppercase">
          {LINKS.slice(0, 3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link-underline transition-colors ${
                pathname.startsWith(link.href) ? "text-accent" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t(locale, link.key)}
            </Link>
          ))}
          <Link href="/" aria-label="OSSZ Collections" className="relative inline-block shrink-0 mx-2" style={{ width: '97px', height: '35px' }}>
            <span className="absolute inset-0" style={{ backgroundImage: 'url(/logo-ossz.png)', backgroundSize: 'contain', backgroundRepeat: 'no-repeat', backgroundPosition: 'left center' }} />
          </Link>
          {LINKS.slice(3).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`link-underline transition-colors ${
                pathname.startsWith(link.href) ? "text-accent" : "text-ink-soft hover:text-ink"
              }`}
            >
              {t(locale, link.key)}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3 text-[0.75rem] tracking-[0.12em] uppercase">
          <LanguageSwitcher locale={locale} />
          {backOffice ? (
            <Link href="/admin" className="hidden lg:inline text-ink-soft hover:text-accent">
              {t(locale, "nav.backoffice")}
            </Link>
          ) : null}
          <Link href={user ? "/account" : "/login"} className="text-ink-soft hover:text-accent">
            {user ? user.name.split(" ")[0] : t(locale, "nav.signin")}
          </Link>
          <Link href="/cart" className="relative text-ink hover:text-accent group" aria-label="Cart">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:scale-110 group-hover:-translate-y-0.5">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            {itemCount > 0 ? (
              <span className="absolute -top-1.5 -right-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[0.55rem] text-white animate-bounce-slow">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {open ? (
        <div className="md:hidden border-t border-line bg-paper fade">
          <nav className="wrap flex flex-col py-3">
            {([...LINKS, { href: "/faq", key: "nav.faq" }] as ReadonlyArray<{ href: string; key: Parameters<typeof t>[1] }>).map(
              (link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="py-3 text-sm tracking-[0.14em] uppercase border-b border-line/60 last:border-0"
                >
                  {t(locale, link.key)}
                </Link>
              ),
            )}
            {backOffice ? (
              <Link href="/admin" className="py-3 text-sm tracking-[0.14em] uppercase text-accent">
                {t(locale, "nav.backoffice")}
              </Link>
            ) : null}
          </nav>
        </div>
      ) : null}
    </header>
  );
}
