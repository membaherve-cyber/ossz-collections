/**
 * Freebuff UI Engine — Motion Engine
 *
 * Defines global motion rules, generates animation CSS, and validates
 * that motion usage follows purposeful, performant, accessible principles.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type AnimationIntensity = "none" | "subtle" | "moderate" | "expressive";

export interface MotionRule {
  name: string;
  duration: string;
  easing: string;
  description: string;
  category: "entrance" | "exit" | "hover" | "focus" | "press" | "scroll" | "page" | "loading" | "feedback";
  reducedMotionFallback: string;
}

export interface MotionAuditResult {
  totalAnimations: number;
  purposesUsed: string[];
  violations: MotionViolation[];
  score: number; // 0-100
}

export interface MotionViolation {
  type: "excessive-duration" | "missing-reduced-motion" | "non-performant-property" | "purposeless" | "distracting";
  description: string;
  severity: "error" | "warning" | "info";
}

// ---------------------------------------------------------------------------
// Default motion rules by intensity
// ---------------------------------------------------------------------------

const MOTION_RULES: Record<AnimationIntensity, MotionRule[]> = {
  none: [],
  subtle: [
    {
      name: "fade-in",
      duration: "150ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Gentle fade for content appearing",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "hover-lift",
      duration: "150ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Subtle lift on hover for interactive elements",
      category: "hover",
      reducedMotionFallback: "none",
    },
    {
      name: "focus-ring",
      duration: "100ms",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      description: "Focus ring appearance",
      category: "focus",
      reducedMotionFallback: "none",
    },
  ],
  moderate: [
    {
      name: "fade-in",
      duration: "200ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Content fade-in",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "slide-up",
      duration: "300ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Elements rising into position",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "hover-scale",
      duration: "200ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      description: "Card or image gentle scale on hover",
      category: "hover",
      reducedMotionFallback: "none",
    },
    {
      name: "press-down",
      duration: "100ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Button press feedback",
      category: "press",
      reducedMotionFallback: "none",
    },
    {
      name: "skeleton-pulse",
      duration: "1500ms",
      easing: "ease-in-out",
      description: "Loading skeleton shimmer",
      category: "loading",
      reducedMotionFallback: "opacity 0.5",
    },
    {
      name: "scroll-reveal",
      duration: "400ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Content appearing on scroll",
      category: "scroll",
      reducedMotionFallback: "opacity 1",
    },
  ],
  expressive: [
    {
      name: "fade-in",
      duration: "250ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Content fade-in with weight",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "slide-up",
      duration: "400ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Prominent element entrance",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "spring-in",
      duration: "500ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      description: "Spring animation for attention-grabbing entrances",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "hover-grow",
      duration: "250ms",
      easing: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      description: "Card grow on hover with spring",
      category: "hover",
      reducedMotionFallback: "none",
    },
    {
      name: "press-bounce",
      duration: "200ms",
      easing: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      description: "Button press with bounce-back",
      category: "press",
      reducedMotionFallback: "none",
    },
    {
      name: "page-transition",
      duration: "350ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Page-to-page transition",
      category: "page",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "stagger-children",
      duration: "300ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Staggered entrance for lists/grids (90ms delay per item)",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "modal-enter",
      duration: "300ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Modal/dialog entrance with backdrop",
      category: "entrance",
      reducedMotionFallback: "opacity 1",
    },
    {
      name: "toast-slide",
      duration: "300ms",
      easing: "cubic-bezier(0.22, 1, 0.36, 1)",
      description: "Toast notification slide-in",
      category: "feedback",
      reducedMotionFallback: "opacity 1",
    },
  ],
};

// ---------------------------------------------------------------------------
// CSS generation
// ---------------------------------------------------------------------------

/**
 * Generate motion CSS for a given animation intensity.
 */
export function generateMotionCSS(intensity: AnimationIntensity): string {
  const rules = MOTION_RULES[intensity];
  if (rules.length === 0) return "/* Motion disabled */";

  const lines: string[] = ["/* === FREEBUFF MOTION SYSTEM === */"];

  // Keyframes
  lines.push("\n@keyframes fb-fade-in {");
  lines.push("  from { opacity: 0; }");
  lines.push("  to { opacity: 1; }");
  lines.push("}");

  lines.push("\n@keyframes fb-slide-up {");
  lines.push("  from { opacity: 0; transform: translateY(12px); }");
  lines.push("  to { opacity: 1; transform: translateY(0); }");
  lines.push("}");

  lines.push("\n@keyframes fb-scale-in {");
  lines.push("  from { opacity: 0; transform: scale(0.95); }");
  lines.push("  to { opacity: 1; transform: scale(1); }");
  lines.push("}");

  lines.push("\n@keyframes fb-skeleton-shimmer {");
  lines.push("  0% { background-position: -200% 0; }");
  lines.push("  100% { background-position: 200% 0; }");
  lines.push("}");

  lines.push("\n@keyframes fb-slide-in-right {");
  lines.push("  from { opacity: 0; transform: translateX(100%); }");
  lines.push("  to { opacity: 1; transform: translateX(0); }");
  lines.push("}");

  // Utility classes
  lines.push("\n/* Motion utility classes */");
  for (const rule of rules) {
    const className = `fb-${rule.name}`;
    lines.push(`\n.${className} {`);
    lines.push(`  animation: ${rule.name.replace(/-/g, "_")} ${rule.duration} ${rule.easing} both;`);
    lines.push("}");
  }

  // Reduced motion overrides
  lines.push("\n/* Reduced motion */");
  lines.push("@media (prefers-reduced-motion: reduce) {");
  lines.push("  .fb-animate {");
  lines.push("    animation-duration: 0.01ms !important;");
  lines.push("    animation-iteration-count: 1 !important;");
  lines.push("    transition-duration: 0.01ms !important;");
  lines.push("    scroll-behavior: auto !important;");
  lines.push("  }");
  lines.push("}");

  return lines.join("\n");
}

/**
 * Get motion rules for a specific category.
 */
export function getMotionRules(
  intensity: AnimationIntensity,
  category?: MotionRule["category"],
): MotionRule[] {
  const rules = MOTION_RULES[intensity];
  if (!category) return rules;
  return rules.filter((r) => r.category === category);
}

/**
 * Get the recommended animation intensity for a project.
 */
export function recommendIntensity(
  industry: string,
  brandTone: string,
): AnimationIntensity {
  // Luxury, corporate, healthcare → subtle
  if (["luxury", "corporate", "healthcare", "fintech"].includes(industry)) {
    return "subtle";
  }
  // Playful brands → expressive
  if (brandTone === "playful") return "expressive";
  // SaaS, AI, professional → moderate
  if (["saas", "ai", "professional-services"].includes(industry)) {
    return "moderate";
  }
  // E-commerce, media, education → moderate
  return "moderate";
}

/**
 * Audit motion usage against the rules for a given intensity.
 */
export function auditMotion(
  intensity: AnimationIntensity,
  animationDescriptions: string[],
): MotionAuditResult {
  const rules = MOTION_RULES[intensity];
  const violations: MotionViolation[] = [];

  // Check for excessive durations (> 600ms is excessive for UI)
  for (const desc of animationDescriptions) {
    const durationMatch = desc.match(/(\d+)ms/);
    if (durationMatch && parseInt(durationMatch[1]) > 600) {
      violations.push({
        type: "excessive-duration",
        description: `Animation "${desc}" has duration ${durationMatch[1]}ms — max recommended is 600ms`,
        severity: "warning",
      });
    }
  }

  // Check for non-performant properties (avoid animating width, height, top, left, margin)
  const nonPerformant = /(?:width|height|top|left|right|bottom|margin|padding)(?:-[^:]*)?\s*:/;
  for (const desc of animationDescriptions) {
    if (nonPerformant.test(desc)) {
      violations.push({
        type: "non-performant-property",
        description: `Animation "${desc}" may animate non-composited properties. Prefer transform and opacity.`,
        severity: "warning",
      });
    }
  }

  // Score: start at 100, deduct for violations
  let score = 100;
  for (const v of violations) {
    if (v.severity === "error") score -= 20;
    else if (v.severity === "warning") score -= 10;
    else score -= 5;
  }

  return {
    totalAnimations: animationDescriptions.length,
    purposesUsed: rules.map((r) => r.category),
    violations,
    score: Math.max(0, score),
  };
}
