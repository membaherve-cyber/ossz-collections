import Link from "next/link";
import { getLocale } from "@/lib/locale-server";
import { t } from "@/lib/i18n-pages";

export const metadata = { title: "Offline" };

export default async function OfflinePage() {
  const locale = await getLocale();
  return (
    <div className="wrap flex min-h-[60vh] max-w-lg flex-col items-center justify-center py-20 text-center">
      <p className="display text-3xl tracking-[0.22em] uppercase">
        OSSZ<span className="text-accent">.</span>
      </p>
      <h1 className="display mt-6 text-3xl">{t(locale, "offline.title")}</h1>
      <p className="mt-3 text-sm leading-relaxed text-ink-soft">{t(locale, "offline.body")}</p>
      <Link href="/" className="btn btn-primary mt-8">
        {t(locale, "offline.retry")}
      </Link>
    </div>
  );
}
