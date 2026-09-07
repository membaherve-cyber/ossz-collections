/**
 * Freebuff UI Engine — Browser QA Module
 *
 * REAL browser automation using playwright-core + system Edge browser.
 * REAL accessibility testing using axe-core injected into the page.
 *
 * Verified working:
 * - Browser launch (Edge headless)
 * - Page rendering
 * - Screenshot capture
 * - Viewport setting
 * - DOM inspection
 * - axe-core injection and execution
 * - WCAG violation detection
 */

import { chromium, type Browser, type Page } from "playwright-core";
import * as path from "path";
import * as fs from "fs";

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

const EDGE_PATH = path.join(
  "C:",
  "Program Files (x86)",
  "Microsoft",
  "Edge",
  "Application",
  "msedge.exe",
);

const REQUIRED_VIEWPORTS = [320, 375, 390, 430, 768, 1024, 1280, 1440, 1920] as const;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FindingSeverity = "critical" | "high" | "medium" | "low";

export type FindingCategory =
  | "alignment"
  | "spacing"
  | "typography"
  | "hierarchy"
  | "composition"
  | "container"
  | "grid"
  | "color"
  | "contrast"
  | "imagery"
  | "buttons"
  | "forms"
  | "navigation"
  | "cards"
  | "responsive"
  | "interaction"
  | "motion"
  | "accessibility"
  | "performance"
  | "structure";

export interface VisualFinding {
  id: string;
  category: FindingCategory;
  severity: FindingSeverity;
  viewport: number;
  selector?: string;
  description: string;
  evidence: string;
  recommendation: string;
  confidence: number; // 0-1
  status: "open" | "confirmed" | "dismissed" | "fixed";
}

export interface AxeViolation {
  id: string;
  impact: "critical" | "serious" | "moderate" | "minor";
  description: string;
  help: string;
  helpUrl: string;
  nodes: number;
  targets: string[];
}

export interface BrowserQAReport {
  url: string;
  timestamp: string;
  viewportsTested: number[];
  screenshots: ScreenshotRecord[];
  domFindings: VisualFinding[];
  axeViolations: AxeViolation[];
  axePasses: number;
  axeIncomplete: number;
  responsiveFindings: ResponsiveFinding[];
  consoleErrors: string[];
  networkErrors: string[];
  overallScore: number;
  summary: string;
}

export interface ScreenshotRecord {
  viewport: number;
  path: string;
  bytes: number;
  timestamp: string;
}

export interface ResponsiveFinding {
  viewport: number;
  category: FindingCategory;
  severity: FindingSeverity;
  description: string;
  evidence: string;
}

// ---------------------------------------------------------------------------
// Browser Lifecycle
// ---------------------------------------------------------------------------

let sharedBrowser: Browser | null = null;

/**
 * Launch the browser (Edge headless). Reuses existing instance.
 */
export async function launchBrowser(): Promise<Browser> {
  if (sharedBrowser && sharedBrowser.isConnected()) {
    return sharedBrowser;
  }

  if (!fs.existsSync(EDGE_PATH)) {
    throw new Error(
      `Edge browser not found at ${EDGE_PATH}. ` +
        `Browser QA requires Microsoft Edge installed.`,
    );
  }

  sharedBrowser = await chromium.launch({
    headless: true,
    executablePath: EDGE_PATH,
  });

  return sharedBrowser;
}

/**
 * Close the shared browser instance.
 */
export async function closeBrowser(): Promise<void> {
  if (sharedBrowser) {
    await sharedBrowser.close();
    sharedBrowser = null;
  }
}

// ---------------------------------------------------------------------------
// Page Operations
// ---------------------------------------------------------------------------

export interface PageOptions {
  viewport?: { width: number; height: number };
  timeout?: number;
}

/**
 * Open a page and optionally set viewport.
 */
export async function openPage(
  url: string,
  options: PageOptions = {},
): Promise<{ page: Page; consoleErrors: string[]; networkErrors: string[] }> {
  const browser = await launchBrowser();
  const page = await browser.newPage();

  if (options.viewport) {
    await page.setViewportSize(options.viewport);
  }

  const consoleErrors: string[] = [];
  const networkErrors: string[] = [];

  page.on("console", (msg) => {
    if (msg.type() === "error") {
      consoleErrors.push(msg.text());
    }
  });

  page.on("requestfailed", (req) => {
    networkErrors.push(`${req.failure()?.errorText} ${req.url()}`);
  });

  await page.goto(url, {
    waitUntil: "networkidle",
    timeout: options.timeout ?? 30000,
  });

  return { page, consoleErrors, networkErrors };
}

/**
 * Capture a screenshot and save to disk.
 */
export async function captureScreenshot(
  page: Page,
  viewport: number,
  outputDir: string,
): Promise<ScreenshotRecord> {
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const filePath = path.join(outputDir, `viewport-${viewport}.png`);
  const buffer = await page.screenshot({
    type: "png",
    fullPage: true,
  });

  fs.writeFileSync(filePath, buffer);

  return {
    viewport,
    path: filePath,
    bytes: buffer.length,
    timestamp: new Date().toISOString(),
  };
}

// ---------------------------------------------------------------------------
// Accessibility (axe-core)
// ---------------------------------------------------------------------------

/**
 * Run axe-core accessibility audit on the current page.
 * Injects axe-core source into the page and executes it.
 */
export async function runAxeAudit(
  page: Page,
): Promise<{
  violations: AxeViolation[];
  passes: number;
  incomplete: number;
}> {
  // Inject axe-core source
  const axeSource = require("axe-core").source;
  await page.evaluate(axeSource);

  // Execute axe
  const results = await page.evaluate(async () => {
    const axeResults = await (window as any).axe.run();
    return {
      violations: axeResults.violations.map((v: any) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        help: v.help,
        helpUrl: v.helpUrl,
        nodes: v.nodes.length,
        targets: v.nodes
          .slice(0, 5)
          .map((n: any) => n.target?.[0] ?? "unknown"),
      })),
      passes: axeResults.passes.length,
      incomplete: axeResults.incomplete.length,
    };
  });

  return results;
}

// ---------------------------------------------------------------------------
// DOM Structural Inspection
// ---------------------------------------------------------------------------

/**
 * Inspect the DOM for structural/visual quality issues.
 * Returns findings based on real rendered DOM analysis.
 */
export async function inspectDOM(
  page: Page,
  viewport: number,
): Promise<VisualFinding[]> {
  const findings: VisualFinding[] = [];
  let findingId = 0;

  // Check for horizontal overflow (responsive failure)
  const hasHorizontalScroll = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (hasHorizontalScroll) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "responsive",
      severity: "critical",
      viewport,
      description: "Horizontal overflow detected — page wider than viewport",
      evidence: "scrollWidth > clientWidth",
      recommendation: "Find and fix the element causing overflow at this viewport",
      confidence: 1.0,
      status: "open",
    });
  }

  // Check heading hierarchy
  const headings = await page.evaluate(() => {
    const hs = document.querySelectorAll("h1, h2, h3, h4, h5, h6");
    return Array.from(hs).map((h) => ({
      level: parseInt(h.tagName[1]),
      text: h.textContent?.trim().slice(0, 60) ?? "",
      visible: h.getBoundingClientRect().height > 0,
    }));
  });

  const h1Count = headings.filter((h) => h.level === 1 && h.visible).length;
  if (h1Count === 0) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "typography",
      severity: "high",
      viewport,
      description: "No visible h1 heading found on page",
      evidence: `Found ${headings.length} headings, 0 visible h1`,
      recommendation: "Add a single h1 heading for page structure",
      confidence: 0.9,
      status: "open",
    });
  } else if (h1Count > 1) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "typography",
      severity: "medium",
      viewport,
      description: `Multiple h1 headings found (${h1Count})`,
      evidence: headings.filter((h) => h.level === 1).map((h) => h.text).join(", "),
      recommendation: "Use only one h1 per page",
      confidence: 0.8,
      status: "open",
    });
  }

  // Check heading hierarchy skips
  let prevLevel = 0;
  for (const h of headings.filter((h) => h.visible)) {
    if (prevLevel > 0 && h.level > prevLevel + 1) {
      findings.push({
        id: `dom-${++findingId}`,
        category: "typography",
        severity: "medium",
        viewport,
        description: `Heading level skip: h${prevLevel} → h${h.level}`,
        evidence: `"${h.text}"`,
        recommendation: "Don't skip heading levels (h1→h3)",
        confidence: 0.85,
        status: "open",
      });
    }
    prevLevel = h.level;
  }

  // Check images without alt text
  const imagesNoAlt = await page.evaluate(() => {
    const imgs = document.querySelectorAll("img");
    return Array.from(imgs)
      .filter((img) => !img.alt && !img.getAttribute("role"))
      .map((img) => ({
        src: img.src?.slice(-60) ?? "unknown",
        width: img.getBoundingClientRect().width,
      }));
  });

  if (imagesNoAlt.length > 0) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "accessibility",
      severity: "critical",
      viewport,
      description: `${imagesNoAlt.length} image(s) missing alt text`,
      evidence: imagesNoAlt.map((i) => i.src).join(", "),
      recommendation: "Add descriptive alt text to all images",
      confidence: 1.0,
      status: "open",
    });
  }

  // Check for tiny touch targets (< 44px)
  const tinyTargets = await page.evaluate(() => {
    const interactives = document.querySelectorAll(
      "a, button, input, select, textarea, [role='button'], [onclick]",
    );
    return Array.from(interactives)
      .map((el) => {
        const rect = el.getBoundingClientRect();
        return { width: rect.width, height: rect.height, tag: el.tagName };
      })
      .filter((el) => el.width > 0 && el.height > 0 && (el.width < 44 || el.height < 44));
  });

  if (tinyTargets.length > 0) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "buttons",
      severity: "medium",
      viewport,
      description: `${tinyTargets.length} interactive element(s) smaller than 44x44px`,
      evidence: tinyTargets.map((t) => `${t.tag} ${t.width}x${t.height}`).join(", "),
      recommendation: "Increase touch target size to at least 44x44px",
      confidence: 0.9,
      status: "open",
    });
  }

  // Check for missing form labels
  const unlabeledInputs = await page.evaluate(() => {
    const inputs = document.querySelectorAll("input, select, textarea");
    return Array.from(inputs)
      .filter((input) => {
        const id = input.id;
        const hasLabel = id && document.querySelector(`label[for="${id}"]`);
        const hasAriaLabel = input.getAttribute("aria-label");
        const hasAriaLabelledBy = input.getAttribute("aria-labelledby");
        const wrappedInLabel = input.closest("label");
        return !hasLabel && !hasAriaLabel && !hasAriaLabelledBy && !wrappedInLabel;
      })
      .map((input) => ({
        type: input.getAttribute("type") ?? "text",
        name: input.getAttribute("name") ?? "unnamed",
      }));
  });

  if (unlabeledInputs.length > 0) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "forms",
      severity: "high",
      viewport,
      description: `${unlabeledInputs.length} form input(s) without associated labels`,
      evidence: unlabeledInputs.map((i) => `${i.type}(${i.name})`).join(", "),
      recommendation: "Add <label>, aria-label, or aria-labelledby to all form inputs",
      confidence: 0.95,
      status: "open",
    });
  }

  // Check for fixed-width elements causing overflow
  const fixedWidthOverflows = await page.evaluate((vp) => {
    const all = document.querySelectorAll("*");
    const overflows: Array<{ tag: string; width: number }> = [];
    for (const el of Array.from(all)) {
      const rect = el.getBoundingClientRect();
      if (rect.right > vp && rect.width > 0) {
        const style = window.getComputedStyle(el);
        if (style.position !== "absolute" && style.position !== "fixed") {
          overflows.push({
            tag: el.tagName + (el.className ? "." + String(el.className).split(" ")[0] : ""),
            width: Math.round(rect.width),
          });
        }
      }
    }
    return overflows.slice(0, 5);
  }, viewport);

  if (fixedWidthOverflows.length > 0) {
    findings.push({
      id: `dom-${++findingId}`,
      category: "responsive",
      severity: "high",
      viewport,
      description: `${fixedWidthOverflows.length} element(s) overflowing viewport at ${viewport}px`,
      evidence: fixedWidthOverflows.map((e) => `${e.tag} (${e.width}px)`).join(", "),
      recommendation: "Use max-width: 100% or responsive utilities",
      confidence: 0.85,
      status: "open",
    });
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Full Browser QA Pipeline
// ---------------------------------------------------------------------------

export interface BrowserQAOptions {
  url: string;
  viewports?: number[];
  screenshotDir?: string;
  runAxe?: boolean;
  inspectDOM?: boolean;
}

/**
 * Run the complete Browser QA pipeline against a URL.
 */
export async function runBrowserQA(
  options: BrowserQAOptions,
): Promise<BrowserQAReport> {
  const {
    url,
    viewports = [...REQUIRED_VIEWPORTS],
    screenshotDir = path.join(process.cwd(), ".freebuff", "screenshots"),
    runAxe: shouldRunAxe = true,
    inspectDOM: shouldInspectDOM = true,
  } = options;

  const allDomFindings: VisualFinding[] = [];
  const allAxeViolations: AxeViolation[] = [];
  const allResponsiveFindings: ResponsiveFinding[] = [];
  const screenshots: ScreenshotRecord[] = [];
  const allConsoleErrors: string[] = [];
  const allNetworkErrors: string[] = [];
  let totalAxePasses = 0;
  let totalAxeIncomplete = 0;

  // Clean screenshot directory
  if (fs.existsSync(screenshotDir)) {
    const existing = fs.readdirSync(screenshotDir);
    for (const f of existing) {
      if (f.endsWith(".png")) fs.unlinkSync(path.join(screenshotDir, f));
    }
  }

  for (const viewport of viewports) {
    try {
      const { page, consoleErrors, networkErrors } = await openPage(url, {
        viewport: { width: viewport, height: 800 },
      });

      allConsoleErrors.push(...consoleErrors);
      allNetworkErrors.push(...networkErrors);

      // Screenshot
      const screenshot = await captureScreenshot(page, viewport, screenshotDir);
      screenshots.push(screenshot);

      // DOM inspection
      if (shouldInspectDOM) {
        const domFindings = await inspectDOM(page, viewport);
        allDomFindings.push(...domFindings);
      }

      // axe-core
      if (shouldRunAxe && viewport === 1280) {
        // Run axe at desktop viewport only to avoid duplicate findings
        const axeResults = await runAxeAudit(page);
        allAxeViolations.push(...axeResults.violations);
        totalAxePasses = axeResults.passes;
        totalAxeIncomplete = axeResults.incomplete;
      }

      // Responsive-specific checks
      const responsiveFindings = await checkResponsive(page, viewport);
      allResponsiveFindings.push(...responsiveFindings);

      await page.close();
    } catch (err) {
      allResponsiveFindings.push({
        viewport,
        category: "responsive",
        severity: "high",
        description: `Failed to render at ${viewport}px: ${String(err).slice(0, 100)}`,
        evidence: "Page load error",
      });
    }
  }

  // Calculate score
  const criticalCount = [
    ...allDomFindings.filter((f) => f.severity === "critical"),
    ...allAxeViolations.filter((v) => v.impact === "critical"),
    ...allResponsiveFindings.filter((f) => f.severity === "critical"),
  ].length;

  const highCount = [
    ...allDomFindings.filter((f) => f.severity === "high"),
    ...allAxeViolations.filter((v) => v.impact === "serious"),
    ...allResponsiveFindings.filter((f) => f.severity === "high"),
  ].length;

  const mediumCount = [
    ...allDomFindings.filter((f) => f.severity === "medium"),
    ...allAxeViolations.filter((v) => v.impact === "moderate"),
    ...allResponsiveFindings.filter((f) => f.severity === "medium"),
  ].length;

  // Score: start at 10, deduct for issues
  let score = 10;
  score -= criticalCount * 1.5;
  score -= highCount * 0.8;
  score -= mediumCount * 0.3;
  score = Math.max(0, Math.round(score * 10) / 10);

  return {
    url,
    timestamp: new Date().toISOString(),
    viewportsTested: [...viewports],
    screenshots,
    domFindings: allDomFindings,
    axeViolations: allAxeViolations,
    axePasses: totalAxePasses,
    axeIncomplete: totalAxeIncomplete,
    responsiveFindings: allResponsiveFindings,
    consoleErrors: allConsoleErrors,
    networkErrors: allNetworkErrors,
    overallScore: score,
    summary: [
      `Browser QA: ${viewports.length} viewports tested`,
      `DOM findings: ${allDomFindings.length} (${allDomFindings.filter((f) => f.severity === "critical").length} critical)`,
      `axe violations: ${allAxeViolations.length} (${allAxeViolations.filter((v) => v.impact === "critical").length} critical)`,
      `Responsive findings: ${allResponsiveFindings.length}`,
      `Console errors: ${allConsoleErrors.length}`,
      `Score: ${score}/10`,
    ].join(" | "),
  };
}

// ---------------------------------------------------------------------------
// Responsive-Specific Checks
// ---------------------------------------------------------------------------

async function checkResponsive(
  page: Page,
  viewport: number,
): Promise<ResponsiveFinding[]> {
  const findings: ResponsiveFinding[] = [];

  // Check for horizontal scroll
  const overflow = await page.evaluate(() => {
    return document.documentElement.scrollWidth > document.documentElement.clientWidth;
  });
  if (overflow) {
    findings.push({
      viewport,
      category: "responsive",
      severity: "critical",
      description: `Horizontal overflow at ${viewport}px`,
      evidence: "Document wider than viewport",
    });
  }

  // Check header visibility
  const headerVisible = await page.evaluate(() => {
    const header = document.querySelector("header, [role='banner'], nav");
    if (!header) return "no-header";
    const rect = header.getBoundingClientRect();
    return rect.height > 0 ? "visible" : "hidden";
  });
  if (headerVisible === "no-header" && viewport < 768) {
    findings.push({
      viewport,
      category: "navigation",
      severity: "medium",
      description: `No header/nav element found at ${viewport}px`,
      evidence: "No <header>, [role=banner], or <nav> in DOM",
    });
  }

  // Check text readability at small viewports
  if (viewport <= 430) {
    const tinyText = await page.evaluate(() => {
      const all = document.querySelectorAll("p, span, a, li, td, th, label, button");
      let tinyCount = 0;
      for (const el of Array.from(all)) {
        const style = window.getComputedStyle(el);
        const fontSize = parseFloat(style.fontSize);
        if (fontSize < 11 && el.getBoundingClientRect().height > 0) {
          tinyCount++;
        }
      }
      return tinyCount;
    });
    if (tinyText > 3) {
      findings.push({
        viewport,
        category: "typography",
        severity: "medium",
        description: `${tinyText} text elements below 11px at ${viewport}px`,
        evidence: "Font size too small for mobile readability",
      });
    }
  }

  // Check touch targets at mobile viewports
  if (viewport <= 430) {
    const touchTargets = await page.evaluate(() => {
      const interactives = document.querySelectorAll("a, button, [role='button']");
      let smallCount = 0;
      for (const el of Array.from(interactives)) {
        const rect = el.getBoundingClientRect();
        if (rect.width > 0 && rect.height > 0 && (rect.width < 40 || rect.height < 40)) {
          smallCount++;
        }
      }
      return smallCount;
    });
    if (touchTargets > 0) {
      findings.push({
        viewport,
        category: "buttons",
        severity: "medium",
        description: `${touchTargets} interactive elements below 40px at ${viewport}px`,
        evidence: "Touch targets too small for mobile",
      });
    }
  }

  return findings;
}
