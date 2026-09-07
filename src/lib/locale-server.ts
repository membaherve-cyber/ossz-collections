import { cache } from "react";
import { cookies } from "next/headers";
import { LOCALE_COOKIE, normaliseLocale, type Locale } from "@/lib/i18n";

/** Reads the visitor's chosen language. Memoised per request. */
export const getLocale = cache(async (): Promise<Locale> => {
  const jar = await cookies();
  return normaliseLocale(jar.get(LOCALE_COOKIE)?.value);
});
