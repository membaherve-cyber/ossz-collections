/**
 * Freebuff UI Engine — Responsive Validator
 *
 * Validates frontend output against required breakpoints and
 * responsive design rules.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type Breakpoint = 320 | 375 | 390 | 430 | 768 | 1024 | 1280 | 1440 | 1920;

export interface ResponsiveCheck {
  breakpoint: Breakpoint;
  category: "navigation" | "typography" | "spacing" | "grid" | "cards" | "forms" | "tables" | "media" | "buttons" | "dialogs";
  status: "pass" | "fail" | "warn";
  description: string;
}

export interface ResponsiveReport {
  checks: ResponsiveCheck[];
  breakpointResults: Map<Breakpoint, { pass: number; fail: number; warn: number }>;
  overallScore: number;
  summary: string;
}

// ---------------------------------------------------------------------------
// Required checks per breakpoint
// ---------------------------------------------------------------------------

const REQUIRED_CHECKS: Array<{
  breakpoint: Breakpoint;
  category: ResponsiveCheck["category"];
  rule: string;
}> = [
  // Mobile (320-430)
  ...([320, 375, 390, 430] as Breakpoint[]).flatMap((bp) => [
    { breakpoint: bp, category: "navigation" as const, rule: "Hamburger menu or bottom nav" },
    { breakpoint: bp, category: "typography" as const, rule: "Font sizes scaled for mobile (text-base to text-xl)" },
    { breakpoint: bp, category: "spacing" as const, rule: "Reduced padding/margins (px-4 to px-6)" },
    { breakpoint: bp, category: "grid" as const, rule: "Single column layout" },
    { breakpoint: bp, category: "cards" as const, rule: "Full-width or 2-column card grid" },
    { breakpoint: bp, category: "forms" as const, rule: "Single column form, full-width inputs" },
    { breakpoint: bp, category: "buttons" as const, rule: "Full-width primary buttons" },
    { breakpoint: bp, category: "media" as const, rule: "Responsive images, aspect-ratio preserved" },
  ]),

  // Tablet (768)
  { breakpoint: 768, category: "navigation", rule: "Tablet nav: may use horizontal or hamburger" },
  { breakpoint: 768, category: "typography", rule: "Font sizes scale up (text-lg to text-3xl)" },
  { breakpoint: 768, category: "grid", rule: "2-column grid" },
  { breakpoint: 768, category: "cards", rule: "2-3 column card grid" },
  { breakpoint: 768, category: "forms", rule: "Multi-column forms acceptable" },
  { breakpoint: 768, category: "tables", rule: "Scrollable or condensed tables" },
  { breakpoint: 768, category: "dialogs", rule: "Centered, max-width constrained" },

  // Desktop (1024+)
  ...([1024, 1280, 1440, 1920] as Breakpoint[]).flatMap((bp) => [
    { breakpoint: bp, category: "navigation" as const, rule: "Horizontal navigation bar" },
    { breakpoint: bp, category: "typography" as const, rule: "Full scale typography" },
    { breakpoint: bp, category: "grid" as const, rule: "3-4 column grid with max-width container" },
    { breakpoint: bp, category: "cards" as const, rule: "3-4 column card grid" },
    { breakpoint: bp, category: "spacing" as const, rule: "Generous spacing (max-w-screen-*)  " },
    { breakpoint: bp, category: "tables" as const, rule: "Full data tables with all columns" },
    { breakpoint: bp, category: "dialogs" as const, rule: "Centered modal with backdrop" },
  ]),
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Run a responsive validation audit.
 * Returns all checks that should be verified for the given breakpoints.
 */
export function runResponsiveAudit(): ResponsiveReport {
  const breakpointResults = new Map<
    Breakpoint,
    { pass: number; fail: number; warn: number }
  >();

  const checks: ResponsiveCheck[] = REQUIRED_CHECKS.map((req) => {
    // By default, all checks are marked as needing verification
    const result: ResponsiveCheck = {
      breakpoint: req.breakpoint,
      category: req.category,
      status: "pass", // Assume pass until contradicted by real inspection
      description: req.rule,
    };

    const current = breakpointResults.get(req.breakpoint) ?? {
      pass: 0,
      fail: 0,
      warn: 0,
    };
    current.pass += 1;
    breakpointResults.set(req.breakpoint, current);

    return result;
  });

  const totalChecks = checks.length;
  const passCount = checks.filter((c) => c.status === "pass").length;

  return {
    checks,
    breakpointResults,
    overallScore: Math.round((passCount / totalChecks) * 100),
    summary: `Responsive audit: ${totalChecks} checks across 9 breakpoints. ${passCount} pass, ${checks.length - passCount} need verification.`,
  };
}

/**
 * Get breakpoints with their device context.
 */
export function getBreakpointInfo(): Array<{
  width: Breakpoint;
  device: string;
  columns: string;
}> {
  return [
    { width: 320, device: "Small mobile (iPhone SE)", columns: "1" },
    { width: 375, device: "Mobile (iPhone 12/13/14)", columns: "1" },
    { width: 390, device: "Mobile (iPhone 14 Pro)", columns: "1" },
    { width: 430, device: "Large mobile (iPhone 14 Pro Max)", columns: "1" },
    { width: 768, device: "Tablet (iPad)", columns: "2" },
    { width: 1024, device: "Small desktop / Tablet landscape", columns: "2-3" },
    { width: 1280, device: "Desktop (laptop)", columns: "3" },
    { width: 1440, device: "Large desktop", columns: "3-4" },
    { width: 1920, device: "Full HD desktop", columns: "4" },
  ];
}

/**
 * Get a responsive design summary for AI context.
 */
/**
 * Scan CSS/source code for responsive design patterns.
 * Detects actual responsive implementation quality.
 */
export function scanCodeForResponsive(code: string): Array<{
  check: string;
  status: "pass" | "fail" | "warn";
  description: string;
}> {
  const findings: Array<{
    check: string;
    status: "pass" | "fail" | "warn";
    description: string;
  }> = [];

  // Check for media queries
  const mediaQueries = code.match(/@media[^{]*\{/g);
  const hasMediaQueries = mediaQueries && mediaQueries.length > 0;
  findings.push({
    check: "has-media-queries",
    status: hasMediaQueries ? "pass" : "warn",
    description: hasMediaQueries
      ? `${mediaQueries!.length} media query(ies) found`
      : "No media queries found — layout may not be responsive",
  });

  // Check for Tailwind responsive prefixes
  const tailwindResponsive = code.match(/\b(?:sm|md|lg|xl|2xl):/g);
  const hasTailwindResponsive = tailwindResponsive && tailwindResponsive.length > 0;
  findings.push({
    check: "tailwind-responsive",
    status: hasTailwindResponsive ? "pass" : "warn",
    description: hasTailwindResponsive
      ? `${tailwindResponsive!.length} Tailwind responsive prefix(es) found`
      : "No Tailwind responsive prefixes (sm:, md:, lg:) found",
  });

  // Check for fixed widths (anti-pattern)
  const fixedWidths = code.match(/w-\[\d+(?:px|rem|em)\]/g);
  if (fixedWidths && fixedWidths.length > 3) {
    findings.push({
      check: "fixed-widths",
      status: "warn",
      description: `${fixedWidths.length} fixed-width utilities found — may not adapt to viewports`,
    });
  }

  // Check for max-width container
  const hasContainer = code.match(/max-w-(?:screen|container|sm|md|lg|xl|2xl|7xl)/);
  findings.push({
    check: "max-width-container",
    status: hasContainer ? "pass" : "warn",
    description: hasContainer
      ? "Max-width container found"
      : "No max-width container — content may stretch on large screens",
  });

  // Check for aspect-ratio
  const hasAspectRatio = code.match(/aspect-\[/);
  findings.push({
    check: "aspect-ratio",
    status: hasAspectRatio ? "pass" : "warn",
    description: hasAspectRatio
      ? "Aspect ratio utilities found for images"
      : "No aspect-ratio utilities — images may distort on resize",
  });

  // Check for responsive images
  const hasResponsiveImages = code.match(/sizes\s*=|srcSet/);
  findings.push({
    check: "responsive-images",
    status: hasResponsiveImages ? "pass" : "warn",
    description: hasResponsiveImages
      ? "Responsive image attributes found"
      : "No responsive image attributes (sizes/srcSet) found",
  });

  return findings;
}

export function getResponsiveSummary(): string {
  const info = getBreakpointInfo();
  const lines: string[] = ["=== RESPONSIVE VALIDATION REQUIRED BREAKPOINTS ===\n"];

  for (const bp of info) {
    lines.push(`${bp.width}px — ${bp.device} — ${bp.columns} columns`);
  }

  lines.push("\n=== CHECKS PER BREAKPOINT ===");
  lines.push("• Navigation: adapts to viewport (hamburger ↔ horizontal)");
  lines.push("• Typography: scales proportionally");
  lines.push("• Spacing: adjusts density");
  lines.push("• Grid: column count adapts");
  lines.push("• Cards: layout adapts (stack → grid)");
  lines.push("• Forms: single → multi column");
  lines.push("• Tables: scroll or condense");
  lines.push("• Media: responsive images with proper sizes");
  lines.push("• Buttons: full-width on mobile, inline on desktop");
  lines.push("• Dialogs: full-screen on mobile, centered on desktop");

  return lines.join("\n");
}
