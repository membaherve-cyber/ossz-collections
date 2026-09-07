/**
 * Freebuff UI Engine — Visual QA Pipeline
 *
 * Orchestrates real browser-based visual quality assurance:
 * 1. Renders the page at multiple viewports
 * 2. Captures screenshots
 * 3. Runs axe-core accessibility audit
 * 4. Inspects DOM structure
 * 5. Checks responsive behavior
 * 6. Produces structured findings with severity and confidence
 * 7. Calculates quality score
 *
 * STATUS: REAL — Uses playwright-core + Edge + axe-core
 * All findings are based on actual rendered output, not heuristics.
 */

import {
  runBrowserQA,
  closeBrowser,
  type BrowserQAReport,
  type VisualFinding,
  type AxeViolation,
  type ResponsiveFinding,
} from "./browser-qa";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type QAStatus =
  | "PASS"
  | "NEEDS_REMEDIATION"
  | "CRITICAL_FAILURES"
  | "UNAVAILABLE";

export interface VisualQAReport {
  status: QAStatus;
  url: string;
  timestamp: string;
  viewportsTested: number[];
  screenshotCount: number;

  // Findings by severity
  criticalFindings: QAFinding[];
  highFindings: QAFinding[];
  mediumFindings: QAFinding[];
  lowFindings: QAFinding[];

  // Scores
  accessibilityScore: number; // 0-10
  responsiveScore: number; // 0-10
  structureScore: number; // 0-10
  overallScore: number; // 0-10

  // Summary
  totalFindings: number;
  axeViolationsCount: number;
  axePassesCount: number;
  consoleErrorsCount: number;
  summary: string;
  recommendations: string[];
}

export interface QAFinding {
  id: string;
  category: string;
  severity: "critical" | "high" | "medium" | "low";
  viewport: number;
  description: string;
  evidence: string;
  recommendation: string;
  source: "axe" | "dom" | "responsive" | "visual";
}

// ---------------------------------------------------------------------------
// Pipeline
// ---------------------------------------------------------------------------

export interface VisualQAOptions {
  url: string;
  viewports?: number[];
  screenshotDir?: string;
}

/**
 * Run the complete Visual QA pipeline.
 * Returns a structured report with all findings.
 */
export async function runVisualQA(
  options: VisualQAOptions,
): Promise<VisualQAReport> {
  const { url, viewports, screenshotDir } = options;

  try {
    // Run browser QA
    const browserReport = await runBrowserQA({
      url,
      viewports,
      screenshotDir,
      runAxe: true,
      inspectDOM: true,
    });

    // Convert findings to unified format
    const allFindings: QAFinding[] = [];

    // DOM findings
    for (const f of browserReport.domFindings) {
      allFindings.push({
        id: f.id,
        category: f.category,
        severity: f.severity,
        viewport: f.viewport,
        description: f.description,
        evidence: f.evidence,
        recommendation: f.recommendation,
        source: "dom",
      });
    }

    // axe violations
    for (const v of browserReport.axeViolations) {
      allFindings.push({
        id: `axe-${v.id}`,
        category: "accessibility",
        severity: v.impact === "critical" ? "critical" : v.impact === "serious" ? "high" : v.impact === "moderate" ? "medium" : "low",
        viewport: 1280,
        description: v.description,
        evidence: `axe rule: ${v.id} (${v.nodes} instances)`,
        recommendation: v.help,
        source: "axe",
      });
    }

    // Responsive findings
    for (const f of browserReport.responsiveFindings) {
      allFindings.push({
        id: `resp-${f.viewport}-${f.category}`,
        category: f.category,
        severity: f.severity,
        viewport: f.viewport,
        description: f.description,
        evidence: f.evidence,
        recommendation: "Fix responsive layout at this viewport",
        source: "responsive",
      });
    }

    // Sort by severity
    const criticalFindings = allFindings.filter((f) => f.severity === "critical");
    const highFindings = allFindings.filter((f) => f.severity === "high");
    const mediumFindings = allFindings.filter((f) => f.severity === "medium");
    const lowFindings = allFindings.filter((f) => f.severity === "low");

    // Calculate dimension scores
    const accessibilityScore = calculateAccessibilityScore(
      browserReport.axeViolations,
      allFindings.filter((f) => f.source === "axe"),
    );
    const responsiveScore = calculateResponsiveScore(
      browserReport.responsiveFindings,
      browserReport.viewportsTested.length,
    );
    const structureScore = calculateStructureScore(
      browserReport.domFindings,
    );

    // Overall score
    const overallScore = Math.round(
      ((accessibilityScore + responsiveScore + structureScore) / 3) * 10,
    ) / 10;

    // Determine status
    let status: QAStatus;
    if (criticalFindings.length > 0) {
      status = "CRITICAL_FAILURES";
    } else if (highFindings.length > 0 || overallScore < 7.5) {
      status = "NEEDS_REMEDIATION";
    } else {
      status = "PASS";
    }

    // Generate recommendations
    const recommendations = generateRecommendations(allFindings);

    return {
      status,
      url,
      timestamp: new Date().toISOString(),
      viewportsTested: browserReport.viewportsTested,
      screenshotCount: browserReport.screenshots.length,
      criticalFindings,
      highFindings,
      mediumFindings,
      lowFindings,
      accessibilityScore,
      responsiveScore,
      structureScore,
      overallScore,
      totalFindings: allFindings.length,
      axeViolationsCount: browserReport.axeViolations.length,
      axePassesCount: browserReport.axePasses,
      consoleErrorsCount: browserReport.consoleErrors.length,
      summary: [
        `Visual QA: ${status}`,
        `Score: ${overallScore}/10`,
        `${browserReport.viewportsTested.length} viewports tested`,
        `${allFindings.length} findings (${criticalFindings.length} critical, ${highFindings.length} high)`,
        `axe-core: ${browserReport.axeViolations.length} violations, ${browserReport.axePasses} passes`,
        `Console errors: ${browserReport.consoleErrors.length}`,
      ].join(" | "),
      recommendations,
    };
  } finally {
    await closeBrowser();
  }
}

// ---------------------------------------------------------------------------
// Score Calculators
// ---------------------------------------------------------------------------

function calculateAccessibilityScore(
  axeViolations: AxeViolation[],
  findings: QAFinding[],
): number {
  let score = 10;
  for (const v of axeViolations) {
    if (v.impact === "critical") score -= 1.5;
    else if (v.impact === "serious") score -= 0.8;
    else if (v.impact === "moderate") score -= 0.3;
    else score -= 0.1;
  }
  return Math.max(0, Math.round(score * 10) / 10);
}

function calculateResponsiveScore(
  findings: ResponsiveFinding[],
  viewportCount: number,
): number {
  let score = 10;
  for (const f of findings) {
    if (f.severity === "critical") score -= 2;
    else if (f.severity === "high") score -= 1;
    else if (f.severity === "medium") score -= 0.4;
    else score -= 0.1;
  }
  // Bonus for testing more viewports
  if (viewportCount >= 9) score += 0.5;
  return Math.max(0, Math.min(10, Math.round(score * 10) / 10));
}

function calculateStructureScore(findings: VisualFinding[]): number {
  let score = 10;
  for (const f of findings) {
    if (f.severity === "critical") score -= 1.5;
    else if (f.severity === "high") score -= 0.7;
    else if (f.severity === "medium") score -= 0.3;
    else score -= 0.1;
  }
  return Math.max(0, Math.round(score * 10) / 10);
}

// ---------------------------------------------------------------------------
// Recommendation Generator
// ---------------------------------------------------------------------------

function generateRecommendations(findings: QAFinding[]): string[] {
  const recs: string[] = [];
  const seen = new Set<string>();

  for (const f of findings) {
    if (f.severity === "critical" || f.severity === "high") {
      const key = f.recommendation;
      if (!seen.has(key)) {
        seen.add(key);
        recs.push(`[${f.severity.toUpperCase()}] ${f.recommendation}`);
      }
    }
  }

  return recs.slice(0, 10);
}

/**
 * Format a Visual QA report as a human-readable string.
 */
export function formatVisualQAReport(report: VisualQAReport): string {
  const lines: string[] = [
    "=== VISUAL QA REPORT ===",
    `URL: ${report.url}`,
    `Status: ${report.status}`,
    `Overall Score: ${report.overallScore}/10`,
    `Timestamp: ${report.timestamp}`,
    "",
    `Viewports tested: ${report.viewportsTested.join(", ")}`,
    `Screenshots captured: ${report.screenshotCount}`,
    "",
    "--- Scores ---",
    `Accessibility: ${report.accessibilityScore}/10`,
    `Responsive: ${report.responsiveScore}/10`,
    `Structure: ${report.structureScore}/10`,
    `Overall: ${report.overallScore}/10`,
    "",
    "--- Findings ---",
    `Critical: ${report.criticalFindings.length}`,
    `High: ${report.highFindings.length}`,
    `Medium: ${report.mediumFindings.length}`,
    `Low: ${report.lowFindings.length}`,
    "",
  ];

  if (report.criticalFindings.length > 0) {
    lines.push("CRITICAL FINDINGS:");
    for (const f of report.criticalFindings) {
      lines.push(`  [${f.source}] ${f.description}`);
      lines.push(`    Evidence: ${f.evidence}`);
      lines.push(`    Fix: ${f.recommendation}`);
    }
    lines.push("");
  }

  if (report.highFindings.length > 0) {
    lines.push("HIGH FINDINGS:");
    for (const f of report.highFindings) {
      lines.push(`  [${f.source}] ${f.description}`);
    }
    lines.push("");
  }

  if (report.recommendations.length > 0) {
    lines.push("RECOMMENDATIONS:");
    for (const r of report.recommendations) {
      lines.push(`  • ${r}`);
    }
  }

  return lines.join("\n");
}
