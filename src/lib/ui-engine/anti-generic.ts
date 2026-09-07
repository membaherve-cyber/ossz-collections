/**
 * Freebuff UI Engine — Anti-Generic Design Rules
 *
 * Prevents the AI from producing generic, template-like UI that looks
 * like every other AI-generated website. Enforces deliberate, contextual
 * design decisions.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AntiGenericRule {
  id: string;
  category: "forbidden" | "discouraged" | "required" | "contextual";
  pattern: string;
  description: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
}

export interface AntiGenericViolation {
  rule: AntiGenericRule;
  context: string;
  location?: string;
}

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

export const ANTI_GENERIC_RULES: AntiGenericRule[] = [
  // === FORBIDDEN PATTERNS ===
  {
    id: "no-purple-gradient-hero",
    category: "forbidden",
    pattern: "purple-gradient",
    description: "Purple gradient hero sections are the most overused AI pattern.",
    severity: "error",
    suggestion:
      "Use solid colors, photography, or subtle gradients that reflect the brand palette.",
  },
  {
    id: "no-generic-saas-layout",
    category: "forbidden",
    pattern: "generic-saas",
    description:
      "Generic SaaS layout: navbar → hero with gradient background → 3 feature cards → testimonials → CTA → footer.",
    severity: "error",
    suggestion:
      "Design the layout based on the actual content and user journey. Not every page needs the same template.",
  },
  {
    id: "no-excessive-glassmorphism",
    category: "forbidden",
    pattern: "glassmorphism",
    description:
      "Excessive glassmorphism (backdrop-blur everywhere) dilutes visual clarity.",
    severity: "warning",
    suggestion:
      "Use glass effects sparingly — only for overlays, modals, or floating panels.",
  },
  {
    id: "no-identical-card-grids",
    category: "forbidden",
    pattern: "identical-card-grid",
    description:
      "Rows of identical cards with icon + title + description is the default AI pattern.",
    severity: "error",
    suggestion:
      "Vary card sizes, use photography, or create visual rhythm through asymmetry.",
  },
  {
    id: "no-random-gradients",
    category: "forbidden",
    pattern: "random-gradient",
    description:
      "Random colorful gradients applied to backgrounds or buttons without brand rationale.",
    severity: "error",
    suggestion:
      "Every gradient should derive from the brand color palette and serve a visual purpose.",
  },
  {
    id: "no-excessive-shadows",
    category: "forbidden",
    pattern: "excessive-shadow",
    description:
      "Box shadows on every element create visual noise and flatten hierarchy.",
    severity: "warning",
    suggestion:
      "Use shadows for elevation (cards, modals, dropdowns). Not for buttons, inputs, or every container.",
  },
  {
    id: "no-random-animation",
    category: "forbidden",
    pattern: "random-animation",
    description:
      "Animations that serve no communicative purpose distract from content.",
    severity: "error",
    suggestion:
      "Every animation should communicate state change, spatial relationship, or feedback.",
  },
  {
    id: "no-excessive-icons",
    category: "forbidden",
    pattern: "icon-heavy",
    description:
      "Decorative icons on every section heading or bullet point creates visual clutter.",
    severity: "warning",
    suggestion:
      "Use icons sparingly and only for functional purposes (navigation, actions, status).",
  },
  {
    id: "no-weak-typography",
    category: "forbidden",
    pattern: "weak-typography",
    description:
      "Uniform text sizing with no clear hierarchy. All text looks the same weight and size.",
    severity: "error",
    suggestion:
      "Create clear visual hierarchy: display → heading → subheading → body → caption.",
  },
  {
    id: "no-poor-hierarchy",
    category: "forbidden",
    pattern: "poor-hierarchy",
    description:
      "No clear focal point on the page. The eye doesn't know where to land first.",
    severity: "error",
    suggestion:
      "Every page/section should have one dominant element that draws the eye.",
  },
  {
    id: "no-meaningless-decoration",
    category: "forbidden",
    pattern: "decorative",
    description:
      "Decorative elements (dots, circles, waves) that serve no content or navigation purpose.",
    severity: "warning",
    suggestion:
      "Remove decorative elements unless they serve a specific visual or UX purpose.",
  },
  {
    id: "no-generic-hero",
    category: "forbidden",
    pattern: "generic-hero",
    description:
      "Generic hero: centered text, gradient background, generic tagline, two buttons.",
    severity: "error",
    suggestion:
      "Hero design should reflect the brand, use real imagery, and have a specific CTA aligned to the user journey.",
  },

  // === REQUIRED PATTERNS ===
  {
    id: "business-alignment",
    category: "required",
    pattern: "business-context",
    description:
      "Design decisions must reflect the business domain, not just aesthetics.",
    severity: "error",
    suggestion:
      "Ask: what industry is this? Who is the audience? What is the conversion goal?",
  },
  {
    id: "brand-consistency",
    category: "required",
    pattern: "brand-aligned",
    description:
      "Colors, typography, and tone must be consistent with the brand personality.",
    severity: "error",
    suggestion:
      "Define brand personality first (warm/authoritative/playful/luxurious), then align every visual choice.",
  },
  {
    id: "content-driven-layout",
    category: "required",
    pattern: "content-first",
    description:
      "Layout should be driven by content type and density, not by a template.",
    severity: "error",
    suggestion:
      "Analyze the content first: long-form text needs different layout than product grid or dashboard.",
  },
  {
    id: "distinctive-visual-language",
    category: "required",
    pattern: "distinctive",
    description:
      "The design should be recognizable and different from generic templates.",
    severity: "warning",
    suggestion:
      "Add at least one distinctive design element: unusual layout, custom illustration, or unique interaction.",
  },

  // === CONTEXTUAL RULES ===
  {
    id: "luxury-means-whitespace",
    category: "contextual",
    pattern: "luxury",
    description:
      "Luxury brands communicate through restraint: generous whitespace, limited colors, refined typography.",
    severity: "warning",
    suggestion:
      "For luxury: reduce density, increase spacing, use serif/display fonts, muted palette.",
  },
  {
    id: "ecommerce-means-clarity",
    category: "contextual",
    pattern: "ecommerce",
    description:
      "E-commerce must prioritize clarity: clear pricing, prominent CTAs, trust signals, fast checkout.",
    severity: "warning",
    suggestion:
      "For e-commerce: make price, availability, and add-to-cart immediately visible.",
  },
  {
    id: "healthcare-means-calm",
    category: "contextual",
    pattern: "healthcare",
    description:
      "Healthcare design must be calming, trustworthy, and information-rich.",
    severity: "warning",
    suggestion:
      "For healthcare: use calming colors, clear information hierarchy, professional photography.",
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * CSS/code anti-generic patterns — detected by scanning actual source code.
 */
const CODE_PATTERNS: Array<{
  id: string;
  regex: RegExp;
  description: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
}> = [
  {
    id: "purple-gradient",
    regex: /(?:purple|violet|\#7c3aed|\#8b5cf6|\#6d28d9).*(?:gradient|bg-gradient)/i,
    description: "Purple gradient detected — most overused AI pattern",
    severity: "error",
    suggestion: "Use brand-aligned colors. Photography or solid backgrounds.",
  },
  {
    id: "backdrop-blur-everywhere",
    regex: /backdrop-blur-(?:sm|md|lg|xl|2xl|3xl)/g,
    description: "Multiple backdrop-blur instances — excessive glassmorphism",
    severity: "warning",
    suggestion: "Reserve blur for overlays and modals only.",
  },
  {
    id: "shadow-everywhere",
    regex: /shadow-(?:sm|DEFAULT|md|lg|xl|2xl)/g,
    description: "Heavy shadow usage detected",
    severity: "warning",
    suggestion: "Use shadows for elevation hierarchy, not decoration.",
  },
  {
    id: "identical-grid",
    regex: /grid.*grid-cols-[234].*gap-[456]/i,
    description: "Identical card grid pattern — check if cards vary in size/weight",
    severity: "warning",
    suggestion: "Vary card sizes, use asymmetric layouts, or break the grid.",
  },
  {
    id: "round-everything",
    regex: /rounded-(?:xl|2xl|3xl).*rounded-(?:xl|2xl|3xl)/g,
    description: "Multiple large border-radius values — check for over-rounding",
    severity: "warning",
    suggestion: "Use consistent, purposeful border-radius. Not everything needs large rounding.",
  },
  {
    id: "animate-spin",
    regex: /animate-spin/g,
    description: "animate-spin detected — is a spinner really needed?",
    severity: "info",
    suggestion: "Prefer skeleton loaders over spinning indicators.",
  },
  {
    id: "text-center-everywhere",
    regex: /text-center.*text-center.*text-center/g,
    description: "Multiple text-center — page may lack visual hierarchy",
    severity: "warning",
    suggestion: "Use left-aligned text for readability. Reserve center for hero/CTA.",
  },
  {
    id: "gap-4-identical",
    regex: /grid.*gap-4.*grid-cols-[23]/g,
    description: "Default gap-4 grid — consider if spacing fits the content density",
    severity: "info",
    suggestion: "Adjust spacing to match content density and brand personality.",
  },
];

/**
 * Check design decisions against anti-generic rules.
 */
export function checkAntiGeneric(
  decisions: string[],
  industry?: string,
): AntiGenericViolation[] {
  const violations: AntiGenericViolation[] = [];

  for (const decision of decisions) {
    const lower = decision.toLowerCase();
    for (const rule of ANTI_GENERIC_RULES) {
      if (rule.category === "forbidden" && lower.includes(rule.pattern)) {
        violations.push({
          rule,
          context: decision,
        });
      }
    }
  }

  // Check contextual rules based on industry
  if (industry) {
    for (const rule of ANTI_GENERIC_RULES) {
      if (rule.category === "contextual" && lower(industry).includes(rule.pattern)) {
        violations.push({
          rule,
          context: `Industry: ${industry}`,
        });
      }
    }
  }

  return violations;
}

/**
 * Scan actual source code (CSS, TSX) for anti-generic patterns.
 * This performs real pattern detection on rendered code.
 */
export function scanCodeForAntiGeneric(code: string): Array<{
  id: string;
  description: string;
  severity: "error" | "warning" | "info";
  suggestion: string;
  matchCount: number;
}> {
  const findings: Array<{
    id: string;
    description: string;
    severity: "error" | "warning" | "info";
    suggestion: string;
    matchCount: number;
  }> = [];

  for (const pattern of CODE_PATTERNS) {
    const matches = code.match(pattern.regex);
    if (matches && matches.length > 0) {
      findings.push({
        id: pattern.id,
        description: pattern.description,
        severity: pattern.severity,
        suggestion: pattern.suggestion,
        matchCount: matches.length,
      });
    }
  }

  return findings;
}

function lower(s: string): string {
  return s.toLowerCase();
}

/**
 * Get all rules by category.
 */
export function getAntiGenericRules(
  category?: AntiGenericRule["category"],
): AntiGenericRule[] {
  if (!category) return [...ANTI_GENERIC_RULES];
  return ANTI_GENERIC_RULES.filter((r) => r.category === category);
}

/**
 * Get a human-readable anti-generic design guide.
 */
export function getAntiGenericGuide(): string {
  const lines: string[] = ["=== ANTI-GENERIC DESIGN RULES ===\n"];

  const categories = ["forbidden", "required", "contextual", "discouraged"] as const;
  for (const cat of categories) {
    const rules = ANTI_GENERIC_RULES.filter((r) => r.category === cat);
    if (rules.length === 0) continue;

    const icon = cat === "forbidden" ? "🚫" : cat === "required" ? "✅" : "💡";
    lines.push(`\n${icon} ${cat.toUpperCase()}:`);
    for (const r of rules) {
      const sev = r.severity === "error" ? "✗" : r.severity === "warning" ? "⚠" : "ℹ";
      lines.push(`  ${sev} ${r.description}`);
      lines.push(`    → ${r.suggestion}`);
    }
  }

  return lines.join("\n");
}
