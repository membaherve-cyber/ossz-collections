/**
 * Freebuff UI Engine — Quality Gates & Critique Engine
 *
 * Enforces design quality through structured evaluation across 10 dimensions.
 * Implements the Generate → Critique → Identify → Prioritize → Remediate →
 * Review → Finalize pipeline.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QualityDimension =
  | "ux"
  | "visual-design"
  | "typography"
  | "spacing"
  | "consistency"
  | "responsiveness"
  | "accessibility"
  | "interaction"
  | "motion"
  | "performance";

export type QualityLevel = "standard" | "high" | "maximum";

/** Rating tiers for the 0–10 quality scale */
export type QualityRating = "FAIL" | "NEEDS_IMPROVEMENT" | "GOOD" | "PREMIUM" | "EXCEPTIONAL";

export function rateScore(score: number): QualityRating {
  if (score < 6.0) return "FAIL";
  if (score < 7.5) return "NEEDS_IMPROVEMENT";
  if (score < 8.5) return "GOOD";
  if (score < 9.3) return "PREMIUM";
  return "EXCEPTIONAL";
}

export function rateLabel(rating: QualityRating): string {
  switch (rating) {
    case "FAIL": return "FAIL — Critical issues prevent deployment";
    case "NEEDS_IMPROVEMENT": return "NEEDS IMPROVEMENT — Significant gaps to address";
    case "GOOD": return "GOOD — Meets standards, minor refinements possible";
    case "PREMIUM": return "PREMIUM — High-quality, deliberate design";
    case "EXCEPTIONAL": return "EXCEPTIONAL — Outstanding craft and execution";
  }
}

export interface QualityScore {
  dimension: QualityDimension;
  score: number; // 0–10
  rating: QualityRating;
  notes: string;
  issues: QualityIssue[];
}

export interface QualityIssue {
  severity: "critical" | "major" | "minor" | "suggestion";
  description: string;
  remediation: string;
  dimension: QualityDimension;
}

export interface QualityReport {
  overallScore: number; // 0–10
  overallRating: QualityRating;
  level: QualityLevel;
  dimensions: QualityScore[];
  criticalCount: number;
  majorCount: number;
  minorCount: number;
  passed: boolean;
  summary: string;
}

// ---------------------------------------------------------------------------
// Thresholds
// ---------------------------------------------------------------------------

const THRESHOLDS: Record<QualityLevel, { passing: number; premium: number }> = {
  standard: { passing: 6.0, premium: 8.5 },
  high: { passing: 7.5, premium: 8.5 },
  maximum: { passing: 8.5, premium: 9.3 },
};

// ---------------------------------------------------------------------------
// Dimension evaluation criteria
// ---------------------------------------------------------------------------

const DIMENSION_CRITERIA: Record<QualityDimension, string[]> = {
  ux: [
    "Clear user journey from entry to conversion",
    "Intuitive navigation structure",
    "Effective information hierarchy",
    "Clear calls to action",
    "Appropriate feedback for user actions",
    "Logical content organization",
    "Minimal cognitive load",
  ],
  "visual-design": [
    "Cohesive color palette",
    "Effective use of whitespace",
    "Visual hierarchy through size, color, and position",
    "Appropriate imagery treatment",
    "Consistent visual language",
    "Brand-appropriate aesthetics",
    "Distinctive from generic templates",
  ],
  typography: [
    "Clear type hierarchy (display, heading, body, caption)",
    "Appropriate font pairing",
    "Consistent line-height and letter-spacing",
    "Readable font sizes (minimum 16px body)",
    "Limited font families (max 2-3)",
    "Proper use of weight contrast",
    "Text contrast meets WCAG AA",
  ],
  spacing: [
    "Consistent spacing scale",
    "Appropriate vertical rhythm",
    "Breathing room between elements",
    "Visual grouping through proximity",
    "Padding consistency within components",
    "Margin consistency between sections",
    "Density appropriate for content type",
  ],
  consistency: [
    "Same components look and behave the same",
    "Color usage is systematic",
    "Typography is systematic",
    "Interactive states are consistent",
    "Spacing is consistent",
    "Border radius is consistent",
    "Icon style is consistent",
  ],
  responsiveness: [
    "Mobile layout is usable and attractive",
    "Tablet layout adapts appropriately",
    "Desktop layout maximizes screen real estate",
    "Text scales appropriately at all sizes",
    "Navigation adapts to viewport",
    "Images are responsive",
    "Touch targets are adequate on mobile",
  ],
  accessibility: [
    "Semantic HTML structure",
    "Keyboard navigation works",
    "Focus states are visible",
    "Color contrast meets WCAG AA",
    "Form inputs have labels",
    "Reduced motion is supported",
    "Screen reader compatible",
  ],
  interaction: [
    "Hover states on all interactive elements",
    "Focus states visible for keyboard users",
    "Active/pressed states on buttons",
    "Disabled states clearly indicated",
    "Loading states for async operations",
    "Error states with clear messaging",
    "Empty states with helpful guidance",
  ],
  motion: [
    "Animations serve a clear purpose",
    "Duration is appropriate (100-600ms)",
    "Easing is natural and consistent",
    "Reduced motion is respected",
    "No animations on non-composited properties",
    "Stagger timing for lists/grids",
    "No animation that blocks interaction",
  ],
  performance: [
    "Images are optimized (WebP/AVIF, responsive sizes)",
    "Lazy loading below the fold",
    "Minimal layout shift (CLS < 0.1)",
    "Critical CSS is inlined",
    "Font loading is optimized",
    "No unnecessary JavaScript",
    "Efficient re-rendering patterns",
  ],
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Create a quality evaluation for a set of design decisions.
 * Each dimension is scored 0-100 based on how many criteria are met.
 */
export function evaluateQuality(
  evaluations: Partial<Record<QualityDimension, number>>,
  level: QualityLevel = "high",
): QualityReport {
  const threshold = THRESHOLDS[level];

  const dimensions: QualityScore[] = (Object.keys(DIMENSION_CRITERIA) as QualityDimension[]).map(
    (dim) => {
      // Accept 0–10 input, default to 7.0 if not evaluated
      const raw = evaluations[dim] ?? 7.0;
      const score = Math.max(0, Math.min(10, Math.round(raw * 10) / 10));
      const rating = rateScore(score);
      const issues: QualityIssue[] = [];

      if (score < 6.0) {
        issues.push({
          severity: "critical",
          description: `${dim} critically low (${score}/10) — below minimum threshold`,
          remediation: `Review ${dim} criteria and address critical issues.`,
          dimension: dim,
        });
      } else if (score < threshold.passing) {
        issues.push({
          severity: "major",
          description: `${dim} below passing threshold (${score}/10, need ${threshold.passing})`,
          remediation: `Improve ${dim} to meet minimum quality standards.`,
          dimension: dim,
        });
      } else if (score < threshold.premium) {
        issues.push({
          severity: "minor",
          description: `${dim} passing but below premium (${score}/10, premium needs ${threshold.premium})`,
          remediation: `Refine ${dim} details for premium quality.`,
          dimension: dim,
        });
      }

      return { dimension: dim, score, rating, notes: getCriteriaForDimension(dim), issues };
    },
  );

  const overallScore = Math.round(
    (dimensions.reduce((sum, d) => sum + d.score, 0) / dimensions.length) * 10,
  ) / 10;
  const overallRating = rateScore(overallScore);

  const criticalCount = dimensions.reduce(
    (count, d) => count + d.issues.filter((i) => i.severity === "critical").length,
    0,
  );
  const majorCount = dimensions.reduce(
    (count, d) => count + d.issues.filter((i) => i.severity === "major").length,
    0,
  );
  const minorCount = dimensions.reduce(
    (count, d) => count + d.issues.filter((i) => i.severity === "minor").length,
    0,
  );

  // Premium mode requires 8.5+ AND no critical failures
  const passed = overallScore >= threshold.passing && criticalCount === 0;
  const premiumRequired = level === "maximum" || level === "high";
  const premiumMet = !premiumRequired || (overallScore >= threshold.premium && criticalCount === 0);

  return {
    overallScore,
    overallRating,
    level,
    dimensions,
    criticalCount,
    majorCount,
    minorCount,
    passed: passed && premiumMet,
    summary: passed && premiumMet
      ? `Quality gate PASSED — ${rateLabel(overallRating)} (${overallScore}/10, ${level} mode).`
      : `Quality gate FAILED — ${rateLabel(overallRating)} (${overallScore}/10, ${level} mode). ${criticalCount} critical, ${majorCount} major issues.`,
  };
}

/**
 * Get criteria for a specific dimension.
 */
function getCriteriaForDimension(dim: QualityDimension): string {
  return DIMENSION_CRITERIA[dim].join("; ");
}

/**
 * Get all criteria for a dimension (for AI context).
 */
export function getDimensionCriteria(dim: QualityDimension): string[] {
  return [...DIMENSION_CRITERIA[dim]];
}

/**
 * Get the full quality evaluation checklist.
 */
export function getQualityChecklist(): string {
  const lines: string[] = ["=== FREEBUFF QUALITY EVALUATION CHECKLIST ===\n"];

  for (const [dim, criteria] of Object.entries(DIMENSION_CRITERIA)) {
    lines.push(`\n[${dim.toUpperCase()}]`);
    for (const c of criteria) {
      lines.push(`  ○ ${c}`);
    }
  }

  return lines.join("\n");
}

/**
 * Generate a critique prompt for the AI to evaluate frontend output.
 */
export function getCritiquePrompt(designDescription: string): string {
  return `You are a senior frontend design critic. Evaluate this frontend implementation against Freebuff's quality standards.

DESIGN TO CRITIQUE:
${designDescription}

EVALUATE across these dimensions (score each 0-100):
1. UX: user journey clarity, navigation, information hierarchy, CTAs
2. Visual Design: color cohesion, whitespace, visual hierarchy, brand alignment
3. Typography: hierarchy, font pairing, spacing, readability
4. Spacing: consistency, rhythm, breathing room, grouping
5. Consistency: component uniformity, systematic usage
6. Responsiveness: mobile/tablet/desktop adaptation
7. Accessibility: semantic HTML, keyboard nav, contrast, labels
8. Interaction: hover/focus/active states, loading/error states
9. Motion: purpose, duration, easing, reduced motion support
10. Performance: optimization, lazy loading, CLS, font loading

For each dimension:
- Score (0-100)
- Specific issues found (critical/major/minor)
- Concrete remediation suggestions

Provide an overall score and verdict: PASS or FAIL (passing threshold: 75/100, no critical issues).`;
}
