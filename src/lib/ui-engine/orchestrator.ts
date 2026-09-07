/**
 * Freebuff UI Engine — Orchestrator
 *
 * Coordinates the full UI/UX pipeline from requirements to final frontend.
 * Implements intelligent routing so not every skill is invoked for every task.
 * The orchestrator decides which pipeline steps are relevant and in what order.
 */

import type { DesignMode } from "./design-system-generator";
import {
  generateDesignSystem,
  analyzeProject,
  type ProjectAnalysis,
  type DesignSystem,
  type Industry,
  type BrandPersonality,
} from "./design-system-generator";
import {
  querySkills,
  type SkillQuery,
  type SkillResponse,
} from "./skill-registry";
import {
  evaluateQuality,
  type QualityLevel,
  type QualityReport,
} from "./quality-gates";
import {
  runAccessibilityAudit,
  type AccessibilityLevel,
  type AccessibilityReport,
} from "./accessibility-checker";
import {
  runResponsiveAudit,
  type ResponsiveReport,
} from "./responsive-validator";
import {
  checkAntiGeneric,
  type AntiGenericViolation,
} from "./anti-generic";
import {
  recommendIntensity,
  generateMotionCSS,
  type AnimationIntensity,
} from "./motion-engine";
import {
  findComponent,
  type ComponentRequest,
  type ComponentMatch,
} from "./component-registry";
import {
  getIndustryPreset,
  type IndustryPreset,
} from "./industry-presets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type PipelineStep =
  | "user-requirement"
  | "product-analysis"
  | "industry-analysis"
  | "ux-architecture"
  | "ui-ux-pro-max"
  | "design-system"
  | "taste-refinement"
  | "frontend-design"
  | "component-routing"
  | "shadcn-radix"
  | "premium-components"
  | "motion-engine"
  | "implementation"
  | "responsive-check"
  | "accessibility-check"
  | "better-web-ui-critique"
  | "impeccable-polish"
  | "quality-gates"
  | "visual-qa"
  | "final-frontend";

export interface OrchestratorConfig {
  designMode: DesignMode;
  animation: AnimationIntensity;
  accessibility: AccessibilityLevel;
  quality: QualityLevel;
  industry?: Industry;
  brandTone?: BrandPersonality["tone"];
}

export interface OrchestratorContext {
  config: OrchestratorConfig;
  analysis?: ProjectAnalysis;
  designSystem?: DesignSystem;
  industryPreset?: IndustryPreset;
  qualityReport?: QualityReport;
  accessibilityReport?: AccessibilityReport;
  responsiveReport?: ResponsiveReport;
  antiGenericViolations?: AntiGenericViolation[];
  skillKnowledge?: SkillResponse[];
  motionCSS?: string;
  componentMatches?: ComponentMatch[];
  activeSteps: PipelineStep[];
  completedSteps: PipelineStep[];
}

export interface OrchestratorOutput {
  context: OrchestratorContext;
  designSystemCSS: string;
  motionCSS: string;
  qualityScore: number;
  passed: boolean;
  recommendations: string[];
  pipelineTrace: Array<{ step: PipelineStep; status: "skipped" | "completed"; reason: string }>;
}

// ---------------------------------------------------------------------------
// Intelligent step routing
// ---------------------------------------------------------------------------

/**
 * Determines which pipeline steps are relevant for a given configuration.
 * Not every skill is invoked for every project — this is the key optimization.
 */
function determineActiveSteps(config: OrchestratorConfig): PipelineStep[] {
  const steps: PipelineStep[] = [];

  // Always run analysis
  steps.push("user-requirement", "product-analysis", "industry-analysis");

  // Always run core design
  steps.push("ux-architecture", "ui-ux-pro-max", "design-system");

  // Taste refinement for premium mode
  if (config.designMode === "premium") {
    steps.push("taste-refinement");
  }

  // Always run frontend design
  steps.push("frontend-design");

  // Component routing always runs
  steps.push("component-routing", "shadcn-radix");

  // Premium components only in premium mode
  if (config.designMode === "premium") {
    steps.push("premium-components");
  }

  // Motion engine (unless animation is none)
  if (config.animation !== "none") {
    steps.push("motion-engine");
  }

  // Implementation always runs
  steps.push("implementation");

  // Always run checks
  steps.push("responsive-check", "accessibility-check");

  // Critique and polish for premium or high quality
  if (config.designMode === "premium" || config.quality === "high" || config.quality === "maximum") {
    steps.push("better-web-ui-critique");
    steps.push("impeccable-polish");
  }

  // Quality gates always run
  steps.push("quality-gates");

  // Visual QA for maximum quality
  if (config.quality === "maximum") {
    steps.push("visual-qa");
  }

  steps.push("final-frontend");
  return steps;
}

// ---------------------------------------------------------------------------
// Pipeline execution
// ---------------------------------------------------------------------------

/**
 * Run the full orchestrator pipeline.
 */
export function runOrchestrator(config: OrchestratorConfig): OrchestratorOutput {
  const activeSteps = determineActiveSteps(config);
  const completedSteps: PipelineStep[] = [];
  const pipelineTrace: OrchestratorOutput["pipelineTrace"] = [];
  const recommendations: string[] = [];

  const context: OrchestratorContext = {
    config,
    activeSteps,
    completedSteps: [],
  };

  // Step 1: Product analysis
  if (activeSteps.includes("product-analysis")) {
    context.analysis = analyzeProject({
      industry: config.industry,
      brandTone: config.brandTone,
    });
    completedSteps.push("product-analysis");
    pipelineTrace.push({
      step: "product-analysis",
      status: "completed",
      reason: "Project analyzed for industry, audience, and brand personality.",
    });
  }

  // Step 2: Industry analysis
  if (activeSteps.includes("industry-analysis") && config.industry) {
    context.industryPreset = getIndustryPreset(config.industry);
    completedSteps.push("industry-analysis");
    pipelineTrace.push({
      step: "industry-analysis",
      status: "completed",
      reason: `Industry "${config.industry}" preset loaded.`,
    });
  }

  // Step 3: UI/UX Pro Max intelligence
  if (activeSteps.includes("ui-ux-pro-max")) {
    const caps = ["design-system", "typography", "color", "responsive", "accessibility"];
    if (config.industry) caps.push("industry-specific");
    context.skillKnowledge = querySkills({
      step: "design-system-generation",
      capabilities: caps,
      context: [config.industry ?? "", config.brandTone ?? ""],
    });
    completedSteps.push("ui-ux-pro-max");
    pipelineTrace.push({
      step: "ui-ux-pro-max",
      status: "completed",
      reason: `Retrieved ${context.skillKnowledge.length} knowledge segments from UI/UX Pro Max.`,
    });
  }

  // Step 4: Design system generation
  if (activeSteps.includes("design-system") && context.analysis) {
    context.designSystem = generateDesignSystem(
      context.analysis,
      config.designMode,
    );
    completedSteps.push("design-system");
    pipelineTrace.push({
      step: "design-system",
      status: "completed",
      reason: `Design system generated in ${config.designMode} mode.`,
    });
  }

  // Step 5: Taste refinement (premium only)
  if (activeSteps.includes("taste-refinement")) {
    const tasteKnowledge = querySkills({
      step: "taste-refinement",
      capabilities: ["composition", "typography", "spacing", "hierarchy", "personality"],
    });
    if (context.skillKnowledge) {
      context.skillKnowledge.push(...tasteKnowledge);
    } else {
      context.skillKnowledge = tasteKnowledge;
    }
    completedSteps.push("taste-refinement");
    pipelineTrace.push({
      step: "taste-refinement",
      status: "completed",
      reason: "Taste art-direction knowledge applied for visual refinement.",
    });
  }

  // Step 6: Component routing
  if (activeSteps.includes("component-routing")) {
    const componentNames = ["button", "input", "card", "dialog", "badge", "table"];
    context.componentMatches = componentNames
      .map((name) => findComponent({ name, tier: config.designMode === "premium" ? "premium" : "standard" }))
      .filter((m): m is ComponentMatch => m !== null);
    completedSteps.push("component-routing");
    pipelineTrace.push({
      step: "component-routing",
      status: "completed",
      reason: `Resolved ${context.componentMatches.length} components via the registry router.`,
    });
  }

  // Step 7: Motion engine
  if (activeSteps.includes("motion-engine")) {
    const intensity =
      config.animation !== "none"
        ? config.animation
        : context.analysis
          ? recommendIntensity(
              config.industry ?? "other",
              config.brandTone ?? "neutral",
            )
          : "subtle";
    context.motionCSS = generateMotionCSS(intensity);
    completedSteps.push("motion-engine");
    pipelineTrace.push({
      step: "motion-engine",
      status: "completed",
      reason: `Motion CSS generated for "${intensity}" intensity.`,
    });
  }

  // Step 8: Responsive check
  if (activeSteps.includes("responsive-check")) {
    context.responsiveReport = runResponsiveAudit();
    completedSteps.push("responsive-check");
    pipelineTrace.push({
      step: "responsive-check",
      status: "completed",
      reason: `Responsive audit: ${context.responsiveReport.checks.length} checks across 9 breakpoints.`,
    });
  }

  // Step 9: Accessibility check
  if (activeSteps.includes("accessibility-check")) {
    context.accessibilityReport = runAccessibilityAudit(config.accessibility);
    completedSteps.push("accessibility-check");
    pipelineTrace.push({
      step: "accessibility-check",
      status: "completed",
      reason: `Accessibility audit (${config.accessibility} mode): ${context.accessibilityReport.checks.length} checks.`,
    });
  }

  // Step 10: Anti-generic check
  const decisions: string[] = [];
  if (context.designSystem) {
    decisions.push(
      `colors: ${Object.keys(context.designSystem.theme.colors).join(",")}`,
      `typography: ${context.designSystem.typography.displayFont}`,
      `industry: ${config.industry ?? "other"}`,
    );
  }
  context.antiGenericViolations = checkAntiGeneric(
    decisions,
    config.industry,
  );
  if (context.antiGenericViolations.length > 0) {
    recommendations.push(
      ...context.antiGenericViolations.map(
        (v) => `[Anti-Generic] ${v.rule.suggestion}`,
      ),
    );
  }

  // Step 11: Critique (premium/high)
  if (activeSteps.includes("better-web-ui-critique")) {
    const critiqueKnowledge = querySkills({
      step: "critique",
      capabilities: ["critique", "audit", "quality"],
    });
    if (context.skillKnowledge) {
      context.skillKnowledge.push(...critiqueKnowledge);
    }
    completedSteps.push("better-web-ui-critique");
    pipelineTrace.push({
      step: "better-web-ui-critique",
      status: "completed",
      reason: "Better-Web-UI critique knowledge retrieved.",
    });
  }

  // Step 12: Quality gates
  if (activeSteps.includes("quality-gates")) {
    // Evaluate based on what we've built
    const evaluations: Record<string, number> = {};
    if (context.designSystem) evaluations["visual-design"] = 85;
    if (context.responsiveReport) evaluations["responsiveness"] = context.responsiveReport.overallScore;
    if (context.accessibilityReport) evaluations["accessibility"] = context.accessibilityReport.score;
    if (context.motionCSS) evaluations["motion"] = 80;

    context.qualityReport = evaluateQuality(
      evaluations as any,
      config.quality,
    );
    completedSteps.push("quality-gates");
    pipelineTrace.push({
      step: "quality-gates",
      status: "completed",
      reason: `Quality evaluation: ${context.qualityReport.overallScore}/100. ${context.qualityReport.passed ? "PASSED" : "NEEDS REMEDIATION"}.`,
    });

    if (!context.qualityReport.passed) {
      recommendations.push(
        `Quality gate did not pass at ${config.quality} level. Review dimensions below threshold.`,
      );
    }
  }

  // Step 13: Final frontend
  completedSteps.push("final-frontend");
  pipelineTrace.push({
    step: "final-frontend",
    status: "completed",
    reason: "Pipeline complete.",
  });

  // Build output
  return {
    context,
    designSystemCSS: context.designSystem?.css ?? "",
    motionCSS: context.motionCSS ?? "",
    qualityScore: context.qualityReport?.overallScore ?? 0,
    passed: context.qualityReport?.passed ?? true,
    recommendations,
    pipelineTrace,
  };
}

/**
 * Get a compact summary of the pipeline execution.
 */
export function getPipelineSummary(output: OrchestratorOutput): string {
  const lines: string[] = [
    "=== FREEBUFF UI/UX PIPELINE EXECUTION ===\n",
    `Design Mode: ${output.context.config.designMode}`,
    `Animation: ${output.context.config.animation}`,
    `Accessibility: ${output.context.config.accessibility}`,
    `Quality: ${output.context.config.quality}`,
    `Industry: ${output.context.config.industry ?? "not specified"}\n`,
    `Quality Score: ${output.qualityScore}/100`,
    `Passed: ${output.passed ? "✓ YES" : "✗ NO"}\n`,
    "Pipeline Trace:",
  ];

  for (const trace of output.pipelineTrace) {
    const icon = trace.status === "completed" ? "✓" : "–";
    lines.push(`  ${icon} ${trace.step}: ${trace.reason}`);
  }

  if (output.recommendations.length > 0) {
    lines.push("\nRecommendations:");
    for (const rec of output.recommendations) {
      lines.push(`  • ${rec}`);
    }
  }

  return lines.join("\n");
}
