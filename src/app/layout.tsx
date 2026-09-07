import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Poppins } from "next/font/google";
import "./globals.css";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { ConciergeMount } from "@/components/concierge-mount";
import { PageBack } from "@/components/page-back";
import { BackSlot } from "@/components/back-slot";
import { Analytics } from "@/components/analytics";
import dynamic from "next/dynamic";

// Registers the service worker and offers install — no first-paint value.
const PwaProvider = dynamic(() => import("@/components/pwa").then((m) => m.PwaProvider));
import { getLocale } from "@/lib/locale-server";

// Sober-style geometric sans. Three weights cover display, body and captions —
// one family instead of two also halves the font payload.
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-poppins",
  display: "swap",
  preload: true,
});

export const viewport: Viewport = {
  themeColor: "#1b1917",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://osszcollections.cm"),
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "OSSZ",
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: [{ url: "/icons/favicon-32.png", sizes: "32x32", type: "image/png" }],
    apple: [{ url: "/icons/apple-touch-icon.png", sizes: "180x180" }],
  },
  title: {
    default: "OSSZ Collections — Contemporary fashion house, Douala",
    template: "%s · OSSZ Collections",
  },
  description:
    "OSSZ Collections is a contemporary fashion house in Douala, Cameroon — African design sensibility, modern luxury tailoring, delivered across Cameroon.",
  openGraph: {
    title: "OSSZ Collections",
    description: "Contemporary fashion house rooted in Douala, Cameroon.",
    type: "website",
    locale: "en_GB",
  },
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale} className={poppins.variable}>
      <body className="min-h-screen bg-canvas text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100] focus:bg-ink focus:px-4 focus:py-2 focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <BackSlot>
          <PageBack />
        </BackSlot>
        <main id="main">{children}</main>
        <SiteFooter />
        <ConciergeMount />
        <PwaProvider locale={locale} />
        <Analytics />
      </body>
    </html>
  );
}
