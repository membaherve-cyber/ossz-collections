/**
 * Freebuff Premium UI/UX Engine — Barrel Export
 *
 * This is the single entry point for the entire UI/UX engine.
 * Import from here to access any engine capability.
 *
 * Usage:
 *   import { runOrchestrator, generateDesignSystem } from "@/lib/ui-engine";
 */

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

export { readConfig, type FreebuffConfig } from "./config";

// ---------------------------------------------------------------------------
// Component Registry & Router
// ---------------------------------------------------------------------------

export {
  registerComponent,
  registerComponents,
  findComponent,
  listComponents,
  getRegistrySummary,
  hasComponent,
  clearRegistry,
  SOURCE_PRIORITY,
  type ComponentEntry,
  type ComponentRequest,
  type ComponentMatch,
  type ComponentSource,
} from "./component-registry";

// ---------------------------------------------------------------------------
// Design System Generator
// ---------------------------------------------------------------------------

export {
  generateDesignSystem,
  analyzeProject,
  type DesignSystem,
  type DesignMode,
  type ProjectAnalysis,
  type Industry,
  type AudienceProfile,
  type ProductType,
  type BrandPersonality,
  type DesignTheme,
  type TypographySystem,
  type ColorSystem,
  type SpacingSystem,
  type MotionConfig,
} from "./design-system-generator";

// ---------------------------------------------------------------------------
// Skill Registry
// ---------------------------------------------------------------------------

export {
  querySkills,
  getSkillSummary,
  getEnabledSkillsSummary,
  getSkillsForTask,
  getTaskSkillSummary,
  setSkillEnabled,
  getSkill,
  type SkillDefinition,
  type SkillKnowledge,
  type SkillQuery,
  type SkillResponse,
  type SkillRole,
  type ProjectTask,
} from "./skill-registry";

// ---------------------------------------------------------------------------
// Orchestrator
// ---------------------------------------------------------------------------

export {
  runOrchestrator,
  getPipelineSummary,
  type OrchestratorConfig,
  type OrchestratorContext,
  type OrchestratorOutput,
  type PipelineStep,
} from "./orchestrator";

// ---------------------------------------------------------------------------
// Quality Gates
// ---------------------------------------------------------------------------

export {
  evaluateQuality,
  rateScore,
  rateLabel,
  getDimensionCriteria,
  getQualityChecklist,
  getCritiquePrompt,
  type QualityDimension,
  type QualityLevel,
  type QualityRating,
  type QualityScore,
  type QualityIssue,
  type QualityReport,
} from "./quality-gates";

// ---------------------------------------------------------------------------
// Responsive Validator
// ---------------------------------------------------------------------------

export {
  runResponsiveAudit,
  getBreakpointInfo,
  getResponsiveSummary,
  type Breakpoint,
  type ResponsiveCheck,
  type ResponsiveReport,
} from "./responsive-validator";

// ---------------------------------------------------------------------------
// Accessibility Checker
// ---------------------------------------------------------------------------

export {
  runAccessibilityAudit,
  getAccessibilityChecks,
  getAccessibilityCategories,
  getAccessibilitySummary,
  type AccessibilityLevel,
  type AccessibilityCheck,
  type AccessibilityReport,
} from "./accessibility-checker";

// ---------------------------------------------------------------------------
// Motion Engine
// ---------------------------------------------------------------------------

export {
  generateMotionCSS,
  getMotionRules,
  recommendIntensity,
  auditMotion,
  type AnimationIntensity,
  type MotionRule,
  type MotionAuditResult,
  type MotionViolation,
} from "./motion-engine";

// ---------------------------------------------------------------------------
// Anti-Generic Rules
// ---------------------------------------------------------------------------

export {
  checkAntiGeneric,
  getAntiGenericRules,
  getAntiGenericGuide,
  ANTI_GENERIC_RULES,
  type AntiGenericRule,
  type AntiGenericViolation,
} from "./anti-generic";

// ---------------------------------------------------------------------------
// Industry Presets
// ---------------------------------------------------------------------------

export {
  getIndustryPreset,
  getIndustrySummary,
  getAllIndustries,
  type IndustryPreset,
} from "./industry-presets";

// ---------------------------------------------------------------------------
// Browser QA (SERVER-ONLY — requires playwright-core + Edge)
// Import directly: import { ... } from "@/lib/ui-engine/browser-qa"
// Do NOT re-export from this barrel — it would break client bundles.
// ---------------------------------------------------------------------------

// ---------------------------------------------------------------------------
// Visual QA Pipeline (SERVER-ONLY — requires playwright-core + Edge)
// Import directly: import { ... } from "@/lib/ui-engine/visual-qa"
// ---------------------------------------------------------------------------
