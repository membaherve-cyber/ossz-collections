/**
 * Freebuff UI Engine — Design System Generator
 *
 * Analyzes project requirements and generates a complete, coherent design
 * system with Tailwind-compatible CSS custom properties and utility classes.
 * Uses UI/UX Pro Max as primary intelligence, refined by Taste.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type DesignMode = "standard" | "premium";

export interface ProjectAnalysis {
  industry: Industry;
  audience: AudienceProfile;
  productType: ProductType;
  brandPersonality: BrandPersonality;
  contentDensity: "minimal" | "moderate" | "dense";
  uxCComplexity: "simple" | "moderate" | "complex";
  conversionObjective: string;
  devicePriorities: DevicePriority[];
}

export type Industry =
  | "fintech"
  | "real-estate"
  | "restaurants"
  | "hospitality"
  | "healthcare"
  | "education"
  | "e-commerce"
  | "saas"
  | "ai"
  | "professional-services"
  | "construction"
  | "logistics"
  | "corporate"
  | "luxury"
  | "media"
  | "marketplaces"
  | "mobile-applications"
  | "fashion"
  | "architecture"
  | "interior-design"
  | "other";

export type AudienceProfile = {
  ageRange: string;
  techSavviness: "low" | "medium" | "high";
  formality: "casual" | "professional" | "formal";
  mobility: "desktop-first" | "mobile-first" | "balanced";
};

export type ProductType =
  | "website"
  | "web-app"
  | "dashboard"
  | "marketplace"
  | "portfolio"
  | "blog"
  | "landing-page"
  | "other";

export type BrandPersonality = {
  tone: "warm" | "neutral" | "authoritative" | "playful" | "minimal" | "luxurious";
  energy: "calm" | "dynamic" | "bold";
  sophistication: "simple" | "refined" | "elegant";
};

export type DevicePriority = "mobile" | "tablet" | "desktop";

export interface DesignSystem {
  /** CSS custom property declarations (for :root). */
  tokens: Record<string, string>;
  /** Tailwind-compatible theme extensions. */
  theme: DesignTheme;
  /** Generated component styles. */
  components: ComponentStyles;
  /** Typography system. */
  typography: TypographySystem;
  /** Color system. */
  colors: ColorSystem;
  /** Spacing scale. */
  spacing: SpacingSystem;
  /** Motion configuration. */
  motion: MotionConfig;
  /** Raw CSS to inject. */
  css: string;
}

export interface DesignTheme {
  colors: Record<string, string>;
  fonts: Record<string, string>;
  fontSize: Record<string, string>;
  borderRadius: Record<string, string>;
  boxShadow: Record<string, string>;
  spacing: Record<string, string>;
  animation: Record<string, string>;
}

export interface ComponentStyles {
  buttons: string;
  inputs: string;
  cards: string;
  badges: string;
  dialogs: string;
}

export interface TypographySystem {
  displayFont: string;
  bodyFont: string;
  monoFont: string;
  scale: Record<string, { size: string; lineHeight: string; letterSpacing: string }>;
}

export interface ColorSystem {
  primary: string[];
  neutral: string[];
  semantic: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  surface: {
    background: string;
    foreground: string;
    card: string;
    muted: string;
    border: string;
  };
}

export interface SpacingSystem {
  unit: string;
  scale: Record<string, string>;
}

export interface MotionConfig {
  durations: Record<string, string>;
  easings: Record<string, string>;
  reducedMotion: boolean;
}

// ---------------------------------------------------------------------------
// Industry-specific design presets
// ---------------------------------------------------------------------------

const INDUSTRY_PRESETS: Record<
  Industry,
  {
    colors: Record<string, string>;
    typography: { display: string; body: string };
    mood: string;
    density: "minimal" | "moderate" | "dense";
  }
> = {
  fintech: {
    colors: {
      primary: "#0f172a",
      accent: "#2563eb",
      surface: "#f8fafc",
      border: "#e2e8f0",
    },
    typography: { display: "Inter", body: "Inter" },
    mood: "trustworthy, precise, clean",
    density: "moderate",
  },
  "real-estate": {
    colors: {
      primary: "#1c1917",
      accent: "#b45309",
      surface: "#fafaf9",
      border: "#e7e5e4",
    },
    typography: { display: "Playfair Display", body: "Source Sans 3" },
    mood: "sophisticated, aspirational, warm",
    density: "moderate",
  },
  restaurants: {
    colors: {
      primary: "#1a1a1a",
      accent: "#dc2626",
      surface: "#fefce8",
      border: "#e5e5e5",
    },
    typography: { display: "Cormorant Garamond", body: "DM Sans" },
    mood: "appetizing, inviting, atmospheric",
    density: "moderate",
  },
  hospitality: {
    colors: {
      primary: "#1e293b",
      accent: "#c2956b",
      surface: "#faf8f5",
      border: "#e8e4df",
    },
    typography: { display: "Cormorant", body: "Lato" },
    mood: "welcoming, luxurious, serene",
    density: "minimal",
  },
  healthcare: {
    colors: {
      primary: "#0f172a",
      accent: "#0891b2",
      surface: "#f0fdfa",
      border: "#ccfbf1",
    },
    typography: { display: "Plus Jakarta Sans", body: "Inter" },
    mood: "trustworthy, calm, professional",
    density: "moderate",
  },
  education: {
    colors: {
      primary: "#1e1b4b",
      accent: "#4f46e5",
      surface: "#eef2ff",
      border: "#c7d2fe",
    },
    typography: { display: "Plus Jakarta Sans", body: "Nunito Sans" },
    mood: "approachable, structured, encouraging",
    density: "dense",
  },
  "e-commerce": {
    colors: {
      primary: "#0f0f0f",
      accent: "#e11d48",
      surface: "#ffffff",
      border: "#f0f0f0",
    },
    typography: { display: "Satoshi", body: "Inter" },
    mood: "clean, conversion-focused, trustworthy",
    density: "dense",
  },
  saas: {
    colors: {
      primary: "#0f172a",
      accent: "#6366f1",
      surface: "#fafafa",
      border: "#e5e7eb",
    },
    typography: { display: "Geist", body: "Inter" },
    mood: "modern, efficient, approachable",
    density: "moderate",
  },
  ai: {
    colors: {
      primary: "#09090b",
      accent: "#8b5cf6",
      surface: "#fafafa",
      border: "#e4e4e7",
    },
    typography: { display: "Geist", body: "Inter" },
    mood: "futuristic, intelligent, minimal",
    density: "minimal",
  },
  "professional-services": {
    colors: {
      primary: "#111827",
      accent: "#1d4ed8",
      surface: "#f9fafb",
      border: "#d1d5db",
    },
    typography: { display: "Fraunces", body: "Inter" },
    mood: "authoritative, credible, polished",
    density: "moderate",
  },
  construction: {
    colors: {
      primary: "#1c1917",
      accent: "#ea580c",
      surface: "#fafaf9",
      border: "#d6d3d1",
    },
    typography: { display: "Barlow", body: "DM Sans" },
    mood: "robust, reliable, direct",
    density: "dense",
  },
  logistics: {
    colors: {
      primary: "#0f172a",
      accent: "#0284c7",
      surface: "#f8fafc",
      border: "#e2e8f0",
    },
    typography: { display: "Plus Jakarta Sans", body: "Inter" },
    mood: "efficient, clear, systematic",
    density: "dense",
  },
  corporate: {
    colors: {
      primary: "#111827",
      accent: "#2563eb",
      surface: "#f9fafb",
      border: "#d1d5db",
    },
    typography: { display: "DM Serif Display", body: "Inter" },
    mood: "authoritative, established, trustworthy",
    density: "moderate",
  },
  luxury: {
    colors: {
      primary: "#0a0a0a",
      accent: "#c9a96e",
      surface: "#fafaf8",
      border: "#e5e5e0",
    },
    typography: { display: "Cormorant Garamond", body: "EB Garamond" },
    mood: "refined, exclusive, timeless",
    density: "minimal" as const,
  },
  media: {
    colors: {
      primary: "#0a0a0a",
      accent: "#ef4444",
      surface: "#ffffff",
      border: "#f0f0f0",
    },
    typography: { display: "Oswald", body: "Source Sans 3" },
    mood: "bold, editorial, attention-grabbing",
    density: "dense",
  },
  marketplaces: {
    colors: {
      primary: "#111827",
      accent: "#059669",
      surface: "#f9fafb",
      border: "#e5e7eb",
    },
    typography: { display: "Plus Jakarta Sans", body: "Inter" },
    mood: "trustworthy, organized, accessible",
    density: "dense",
  },
  "mobile-applications": {
    colors: {
      primary: "#0f172a",
      accent: "#6366f1",
      surface: "#f8fafc",
      border: "#e2e8f0",
    },
    typography: { display: "SF Pro Display", body: "SF Pro Text" },
    mood: "fluid, thumb-friendly, clear",
    density: "moderate",
  },
  fashion: {
    colors: {
      primary: "#0a0a0a",
      accent: "#c9a96e",
      surface: "#fafaf8",
      border: "#e5e5e0",
    },
    typography: { display: "Cormorant Garamond", body: "EB Garamond" },
    mood: "editorial, aspirational, refined",
    density: "minimal",
  },
  architecture: {
    colors: {
      primary: "#1a1a1a",
      accent: "#c9a96e",
      surface: "#faf9f6",
      border: "#e5e3de",
    },
    typography: { display: "Playfair Display", body: "Inter" },
    mood: "authoritative, refined, structural",
    density: "minimal",
  },
  "interior-design": {
    colors: {
      primary: "#2d2926",
      accent: "#b08d57",
      surface: "#f5f3ef",
      border: "#ddd8d0",
    },
    typography: { display: "Cormorant Garamond", body: "Inter" },
    mood: "warm, tactile, inviting",
    density: "minimal",
  },
  other: {
    colors: {
      primary: "#111827",
      accent: "#2563eb",
      surface: "#ffffff",
      border: "#e5e7eb",
    },
    typography: { display: "Inter", body: "Inter" },
    mood: "clean, modern, adaptable",
    density: "moderate",
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Generate a complete design system for a project analysis.
 */
export function generateDesignSystem(
  analysis: ProjectAnalysis,
  mode: DesignMode = "premium",
): DesignSystem {
  const preset = INDUSTRY_PRESETS[analysis.industry] ?? INDUSTRY_PRESETS.other;
  const isPremium = mode === "premium";

  // Color system
  const colors = generateColorSystem(preset.colors, isPremium);

  // Typography
  const typography = generateTypographySystem(
    preset.typography,
    analysis.brandPersonality,
    isPremium,
  );

  // Spacing
  const spacing = generateSpacingSystem(
    analysis.contentDensity,
    isPremium,
  );

  // Motion
  const motion = generateMotionConfig(isPremium);

  // Theme tokens
  const theme = buildTheme(colors, typography, spacing, motion, preset);

  // CSS output
  const css = generateCSS(theme, typography, analysis);

  // Component styles
  const components = generateComponentStyles(preset, analysis);

  return {
    tokens: themeToTokens(theme),
    theme,
    components,
    typography,
    colors,
    spacing,
    motion,
    css,
  };
}

/**
 * Generate CSS custom properties and utility classes from a design system.
 */
function generateCSS(
  theme: DesignTheme,
  typography: TypographySystem,
  analysis: ProjectAnalysis,
): string {
  const lines: string[] = [];

  lines.push("/* === FREEBUFF DESIGN SYSTEM TOKENS === */");
  lines.push(":root {");

  // Colors
  for (const [key, value] of Object.entries(theme.colors)) {
    lines.push(`  --fb-${key}: ${value};`);
  }

  // Fonts
  for (const [key, value] of Object.entries(theme.fonts)) {
    lines.push(`  --fb-font-${key}: ${value};`);
  }

  // Font sizes
  for (const [key, value] of Object.entries(theme.fontSize)) {
    lines.push(`  --fb-text-${key}: ${value};`);
  }

  // Border radius
  for (const [key, value] of Object.entries(theme.borderRadius)) {
    lines.push(`  --fb-radius-${key}: ${value};`);
  }

  // Shadows
  for (const [key, value] of Object.entries(theme.boxShadow)) {
    lines.push(`  --fb-shadow-${key}: ${value};`);
  }

  // Spacing
  for (const [key, value] of Object.entries(theme.spacing)) {
    lines.push(`  --fb-space-${key}: ${value};`);
  }

  lines.push("}");

  return lines.join("\n");
}

// ---------------------------------------------------------------------------
// Internal generators
// ---------------------------------------------------------------------------

function generateColorSystem(
  presetColors: Record<string, string>,
  isPremium: boolean,
): ColorSystem {
  const primary = generateColorScale(presetColors.primary);
  const neutral = generateColorScale(presetColors.primary);

  return {
    primary: primary,
    neutral: neutral,
    semantic: {
      success: "#16a34a",
      warning: "#ca8a04",
      error: "#dc2626",
      info: "#2563eb",
    },
    surface: {
      background: presetColors.surface,
      foreground: presetColors.primary,
      card: "#ffffff",
      muted: "#f9fafb",
      border: presetColors.border,
    },
  };
}

function generateColorScale(base: string): string[] {
  // Generate a 10-step color scale from a base hex color
  const steps = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "950"];
  const rgb = hexToRgb(base);
  if (!rgb) return steps.map(() => base);

  return steps.map((step, i) => {
    const factor = i / (steps.length - 1);
    const r = Math.round(rgb.r * (1 - factor * 0.85) + 255 * factor * 0.85);
    const g = Math.round(rgb.g * (1 - factor * 0.85) + 255 * factor * 0.85);
    const b = Math.round(rgb.b * (1 - factor * 0.85) + 255 * factor * 0.85);
    return rgbToHex(Math.min(255, r), Math.min(255, g), Math.min(255, b));
  });
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")}`;
}

function generateTypographySystem(
  presetFonts: { display: string; body: string },
  personality: BrandPersonality,
  isPremium: boolean,
): TypographySystem {
  const scale: TypographySystem["scale"] = {
    xs: { size: "0.75rem", lineHeight: "1rem", letterSpacing: "0.01em" },
    sm: { size: "0.875rem", lineHeight: "1.25rem", letterSpacing: "0" },
    base: { size: "1rem", lineHeight: "1.5rem", letterSpacing: "0" },
    lg: { size: "1.125rem", lineHeight: "1.75rem", letterSpacing: "-0.01em" },
    xl: { size: "1.25rem", lineHeight: "1.75rem", letterSpacing: "-0.01em" },
    "2xl": { size: "1.5rem", lineHeight: "2rem", letterSpacing: "-0.02em" },
    "3xl": { size: "1.875rem", lineHeight: "2.25rem", letterSpacing: "-0.02em" },
    "4xl": { size: "2.25rem", lineHeight: "2.5rem", letterSpacing: "-0.03em" },
    "5xl": { size: "3rem", lineHeight: "1.1", letterSpacing: "-0.03em" },
    "6xl": { size: "3.75rem", lineHeight: "1.05", letterSpacing: "-0.04em" },
  };

  // Premium mode adds more deliberate letter-spacing
  if (isPremium) {
    scale["5xl"].letterSpacing = "-0.04em";
    scale["6xl"].letterSpacing = "-0.05em";
    scale.xs.letterSpacing = "0.02em";
    scale.sm.letterSpacing = "0.01em";
  }

  return {
    displayFont: `'${presetFonts.display}', ui-sans-serif, system-ui, sans-serif`,
    bodyFont: `'${presetFonts.body}', ui-sans-serif, system-ui, sans-serif`,
    monoFont: "'JetBrains Mono', 'Fira Code', ui-monospace, monospace",
    scale,
  };
}

function generateSpacingSystem(
  density: "minimal" | "moderate" | "dense",
  isPremium: boolean,
): SpacingSystem {
  const baseUnit = density === "minimal" ? "1.25rem" : density === "dense" ? "0.75rem" : "1rem";
  const multiplier = isPremium ? 1.125 : 1;

  const scale: Record<string, string> = {};
  const steps = [0, 0.25, 0.5, 0.75, 1, 1.25, 1.5, 2, 2.5, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24];

  for (const step of steps) {
    const rem = step * multiplier;
    scale[String(step)] = `${rem}rem`;
  }

  return { unit: baseUnit, scale };
}

function generateMotionConfig(isPremium: boolean): MotionConfig {
  return {
    durations: {
      micro: "100ms",
      fast: isPremium ? "150ms" : "100ms",
      normal: isPremium ? "250ms" : "200ms",
      slow: isPremium ? "400ms" : "300ms",
      deliberate: isPremium ? "600ms" : "500ms",
    },
    easings: {
      default: "cubic-bezier(0.22, 1, 0.36, 1)",
      spring: "cubic-bezier(0.34, 1.56, 0.64, 1)",
      bounce: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      gentle: "cubic-bezier(0.4, 0, 0.2, 1)",
    },
    reducedMotion: true,
  };
}

function buildTheme(
  colors: ColorSystem,
  typography: TypographySystem,
  spacing: SpacingSystem,
  motion: MotionConfig,
  preset: { colors: Record<string, string>; mood: string },
): DesignTheme {
  return {
    colors: {
      primary: preset.colors.primary,
      accent: preset.colors.accent,
      background: colors.surface.background,
      foreground: colors.surface.foreground,
      card: colors.surface.card,
      muted: colors.surface.muted,
      border: colors.surface.border,
      "success": colors.semantic.success,
      "warning": colors.semantic.warning,
      "error": colors.semantic.error,
      "info": colors.semantic.info,
    },
    fonts: {
      display: typography.displayFont,
      body: typography.bodyFont,
      mono: typography.monoFont,
    },
    fontSize: Object.fromEntries(
      Object.entries(typography.scale).map(([k, v]) => [k, `${v.size} / ${v.lineHeight}`]),
    ),
    borderRadius: {
      none: "0",
      sm: "0.25rem",
      md: "0.375rem",
      lg: "0.5rem",
      xl: "0.75rem",
      "2xl": "1rem",
      full: "9999px",
    },
    boxShadow: {
      sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
      DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
      md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
      lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
      xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    },
    spacing: spacing.scale,
    animation: {
      "fade-in": `fade-in ${motion.durations.normal} ${motion.easings.default} both`,
      "slide-up": `slide-up ${motion.durations.slow} ${motion.easings.default} both`,
      "scale-in": `scale-in ${motion.durations.normal} ${motion.easings.spring} both`,
    },
  };
}

function themeToTokens(theme: DesignTheme): Record<string, string> {
  const tokens: Record<string, string> = {};
  for (const [k, v] of Object.entries(theme.colors)) tokens[`color-${k}`] = v;
  for (const [k, v] of Object.entries(theme.borderRadius)) tokens[`radius-${k}`] = v;
  for (const [k, v] of Object.entries(theme.boxShadow)) tokens[`shadow-${k}`] = v;
  return tokens;
}

function generateComponentStyles(
  preset: { colors: Record<string, string>; mood: string },
  analysis: ProjectAnalysis,
): ComponentStyles {
  return {
    buttons: `/* Buttons: ${preset.mood} */`,
    inputs: `/* Inputs: ${preset.mood} */`,
    cards: `/* Cards: ${preset.mood} */`,
    badges: `/* Badges: ${preset.mood} */`,
    dialogs: `/* Dialogs: ${preset.mood} */`,
  };
}

/**
 * Analyze project metadata to produce a ProjectAnalysis.
 */
export function analyzeProject(hints: {
  industry?: Industry;
  productType?: ProductType;
  brandTone?: BrandPersonality["tone"];
  targetAudience?: string;
}): ProjectAnalysis {
  return {
    industry: hints.industry ?? "other",
    audience: {
      ageRange: "25-45",
      techSavviness: "medium",
      formality: hints.brandTone === "playful" ? "casual" : "professional",
      mobility: "balanced",
    },
    productType: hints.productType ?? "website",
    brandPersonality: {
      tone: hints.brandTone ?? "neutral",
      energy: "dynamic",
      sophistication: "refined",
    },
    contentDensity: "moderate",
    uxCComplexity: "moderate",
    conversionObjective: "engagement",
    devicePriorities: ["mobile", "desktop"],
  };
}
