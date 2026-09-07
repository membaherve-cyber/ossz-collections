import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Playfair_Display, Inter, Cormorant_Garamond } from "next/font/google";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-playfair",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Atelier — Architecture & Interior Design",
    template: "%s · Atelier",
  },
  description:
    "Award-winning architecture and interior design studio. We create spaces that inspire, function beautifully, and stand the test of time.",
};

export default function ArchitectureLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className={`min-h-screen ${playfair.variable} ${inter.variable} ${cormorant.variable}`}>
      {children}
    </div>
  );
}
