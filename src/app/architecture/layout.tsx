import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

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
    <div className="min-h-screen font-sans">
      {children}
    </div>
  );
}
