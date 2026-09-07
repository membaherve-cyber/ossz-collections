import Script from "next/script";

/**
 * §5 — Plausible analytics. Renders nothing unless NEXT_PUBLIC_PLAUSIBLE_DOMAIN
 * is set, so no third-party script loads in development or before the business
 * has an account. Loaded after interactive so it never competes with paint.
 */
export function Analytics() {
  const domain = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  if (!domain) return null;
  return (
    <Script
      defer
      strategy="afterInteractive"
      data-domain={domain}
      src={process.env.NEXT_PUBLIC_PLAUSIBLE_SRC || "https://plausible.io/js/script.js"}
    />
  );
}
