/**
 * Freebuff UI Engine — Configuration Loader
 *
 * Loads and validates the freebuff.config.json configuration.
 * Provides defaults when config is not present.
 */

import type { DesignMode } from "./design-system-generator";
import type { AnimationIntensity } from "./motion-engine";
import type { AccessibilityLevel } from "./accessibility-checker";
import type { QualityLevel } from "./quality-gates";

export interface FreebuffConfig {
  designMode: DesignMode;
  animation: AnimationIntensity;
  accessibility: AccessibilityLevel;
  quality: QualityLevel;
  offline: "enabled" | "disabled";
  componentFoundation: string;
  iconSystem: string;
  skills: Record<string, { enabled: boolean; role?: string }>;
  componentSources: {
    priority: string[];
    [key: string]: unknown;
  };
  designSystem: {
    tokens: Record<string, boolean>;
    themes: string[];
    projectOverrides: boolean;
  };
  responsiveBreakpoints: number[];
  antiGeneric: {
    avoid: string[];
    require: string[];
  };
  motionRules: {
    durations: Record<string, string>;
    easings: Record<string, string>;
    principles: string[];
    supportsReducedMotion: boolean;
  };
  qualityEvaluation: {
    dimensions: string[];
    passingThreshold: number;
    premiumThreshold: number;
  };
  industries: string[];
}

const DEFAULT_CONFIG: FreebuffConfig = {
  designMode: "premium",
  animation: "subtle",
  accessibility: "standard",
  quality: "high",
  offline: "enabled",
  componentFoundation: "shadcn",
  iconSystem: "lucide",
  skills: {},
  componentSources: { priority: ["project-local", "freebuff-core", "shadcn-ui", "custom"] },
  designSystem: {
    tokens: {
      colors: true,
      typography: true,
      spacing: true,
      radius: true,
      shadows: true,
      motion: true,
    },
    themes: ["light", "dark", "system"],
    projectOverrides: true,
  },
  responsiveBreakpoints: [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920],
  antiGeneric: {
    avoid: ["purple-gradients", "generic-saas-layouts"],
    require: ["business-alignment", "brand-consistency"],
  },
  motionRules: {
    durations: { fast: "150ms", normal: "250ms", slow: "400ms" },
    easings: { default: "cubic-bezier(0.22, 1, 0.36, 1)" },
    principles: ["purposeful", "performant", "reduced-motion-aware"],
    supportsReducedMotion: true,
  },
  qualityEvaluation: {
    dimensions: ["ux", "visual-design", "typography", "spacing", "consistency", "responsiveness", "accessibility", "interaction", "motion", "performance"],
    passingThreshold: 75,
    premiumThreshold: 90,
  },
  industries: ["fintech", "real-estate", "restaurants", "hospitality", "healthcare", "education", "e-commerce", "saas", "ai", "luxury", "fashion"],
};

/**
 * Read the Freebuff configuration. Falls back to defaults if config
 * is not present or cannot be parsed.
 */
export function readConfig(): FreebuffConfig {
  try {
    // Server-side only: try to read the actual freebuff.config.json
    // Guard against client-side bundles where 'fs' is not available
    if (
      typeof window === "undefined" &&
      typeof process !== "undefined" &&
      typeof process.cwd === "function"
    ) {
      // Dynamic require to avoid bundling 'fs' in client code
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const fs = require("fs");
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const nodePath = require("path");
      const configPath = nodePath.join(process.cwd(), "freebuff.config.json");
      if (fs.existsSync(configPath)) {
        const raw = fs.readFileSync(configPath, "utf-8");
        const parsed = JSON.parse(raw);
        return mergeConfig(DEFAULT_CONFIG, {
          designMode: parsed.designMode ?? DEFAULT_CONFIG.designMode,
          animation: parsed.animation ?? DEFAULT_CONFIG.animation,
          accessibility: parsed.accessibility ?? DEFAULT_CONFIG.accessibility,
          quality: parsed.quality ?? DEFAULT_CONFIG.quality,
          offline: parsed.offline ?? DEFAULT_CONFIG.offline,
          componentFoundation: parsed.componentFoundation ?? DEFAULT_CONFIG.componentFoundation,
          iconSystem: parsed.iconSystem ?? DEFAULT_CONFIG.iconSystem,
        });
      }
    }
  } catch {
    // If reading fails (e.g. Edge runtime, client bundle), fall back to defaults
  }
  return { ...DEFAULT_CONFIG };
}

/**
 * Merge project-specific overrides with global config.
 */
export function mergeConfig(
  globalConfig: FreebuffConfig,
  projectOverrides: Partial<FreebuffConfig>,
): FreebuffConfig {
  return {
    ...globalConfig,
    ...projectOverrides,
    designSystem: {
      ...globalConfig.designSystem,
      ...(projectOverrides.designSystem ?? {}),
    },
    motionRules: {
      ...globalConfig.motionRules,
      ...(projectOverrides.motionRules ?? {}),
    },
    qualityEvaluation: {
      ...globalConfig.qualityEvaluation,
      ...(projectOverrides.qualityEvaluation ?? {}),
    },
  };
}
