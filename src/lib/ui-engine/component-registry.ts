/**
 * Freebuff UI Engine — Component Registry & Router
 *
 * Maintains a prioritized registry of component sources. When a component is
 * needed, the router searches sources in priority order and returns the best
 * match, preventing duplicates and reducing bundle size.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ComponentSource =
  | "project-local"
  | "freebuff-core"
  | "shadcn-ui"
  | "radix-ui"
  | "freebuff-registry"
  | "magic-ui"
  | "aceternity-ui"
  | "cult-ui"
  | "motion-primitives"
  | "animate-ui"
  | "velora-ui"
  | "custom";

export interface ComponentEntry {
  /** Unique key, e.g. "button", "dialog", "toast". */
  name: string;
  /** Where this component comes from. */
  source: ComponentSource;
  /** Capabilities this component satisfies. */
  tags: string[];
  /** Path (relative) or package reference. */
  path: string;
  /** Whether the component is interactive (client component). */
  client: boolean;
  /** Accessible primitive wrapper, if any. */
  accessible?: boolean;
  /** Premium quality tier: "standard" | "premium". */
  tier: "standard" | "premium";
  /** Brief description for the AI to decide suitability. */
  description: string;
}

export interface ComponentRequest {
  /** Semantic name, e.g. "button", "dialog", "data-table". */
  name: string;
  /** Required capabilities. */
  capabilities?: string[];
  /** Preferred tier. */
  tier?: "standard" | "premium";
  /** Maximum source priority to search up to (inclusive). */
  maxSourcePriority?: number;
}

export interface ComponentMatch {
  entry: ComponentEntry;
  /** 0–1 relevance score. */
  score: number;
  /** Why this component was chosen. */
  reasoning: string;
}

// ---------------------------------------------------------------------------
// Priority order — lower index = higher priority
// ---------------------------------------------------------------------------

const SOURCE_PRIORITY: ComponentSource[] = [
  "project-local",
  "freebuff-core",
  "shadcn-ui",
  "radix-ui",
  "freebuff-registry",
  "magic-ui",
  "aceternity-ui",
  "cult-ui",
  "motion-primitives",
  "animate-ui",
  "velora-ui",
  "custom",
];

// ---------------------------------------------------------------------------
// Global registry (module-level singleton)
// ---------------------------------------------------------------------------

const registry: ComponentEntry[] = [];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Register a component in the global registry.
 */
export function registerComponent(entry: ComponentEntry): void {
  const existing = registry.findIndex(
    (r) => r.name === entry.name && r.source === entry.source,
  );
  if (existing >= 0) {
    registry[existing] = entry;
  } else {
    registry.push(entry);
  }
}

/**
 * Register multiple components at once.
 */
export function registerComponents(entries: ComponentEntry[]): void {
  for (const entry of entries) registerComponent(entry);
}

/**
 * Find the best component matching a request using the priority router.
 */
export function findComponent(request: ComponentRequest): ComponentMatch | null {
  const maxPriority =
    request.maxSourcePriority ?? SOURCE_PRIORITY.length - 1;

  // Filter candidates
  const candidates = registry.filter((entry) => {
    if (entry.name !== request.name) return false;
    const sourceIdx = SOURCE_PRIORITY.indexOf(entry.source);
    if (sourceIdx < 0 || sourceIdx > maxPriority) return false;
    if (request.capabilities && request.capabilities.length > 0) {
      const hasAll = request.capabilities.every((cap) =>
        entry.tags.includes(cap),
      );
      if (!hasAll) return false;
    }
    return true;
  });

  if (candidates.length === 0) return null;

  // Score each candidate
  const scored: Array<{ entry: ComponentEntry; score: number }> =
    candidates.map((entry) => {
      let score = 0;
      const sourceIdx = SOURCE_PRIORITY.indexOf(entry.source);

      // Higher priority source = higher base score (max 60 points)
      score += (SOURCE_PRIORITY.length - sourceIdx) * 5;

      // Premium tier bonus
      if (request.tier === "premium" && entry.tier === "premium") score += 20;
      if (request.tier === "standard" && entry.tier === "standard") score += 10;

      // Accessible component bonus
      if (entry.accessible) score += 10;

      // Tag match bonus
      if (request.capabilities) {
        const matchCount = request.capabilities.filter((cap) =>
          entry.tags.includes(cap),
        ).length;
        score += (matchCount / request.capabilities.length) * 20;
      }

      return { entry, score };
    });

  // Sort by score descending
  scored.sort((a, b) => b.score - a.score);
  const best = scored[0];

  const maxScore = SOURCE_PRIORITY.length * 5 + 40;
  return {
    entry: best.entry,
    score: Math.min(best.score / maxScore, 1),
    reasoning: `Selected ${best.entry.source}/${best.entry.name} (score ${best.score.toFixed(1)})`,
  };
}

/**
 * List all registered components, optionally filtered by source.
 */
export function listComponents(source?: ComponentSource): ComponentEntry[] {
  if (!source) return [...registry];
  return registry.filter((e) => e.source === source);
}

/**
 * Get a summary of all registered components for the AI context.
 */
export function getRegistrySummary(): string {
  const grouped: Record<string, ComponentEntry[]> = {};
  for (const entry of registry) {
    if (!grouped[entry.source]) grouped[entry.source] = [];
    grouped[entry.source].push(entry);
  }

  const lines: string[] = ["=== FREEBUFF COMPONENT REGISTRY ===\n"];
  for (const [source, entries] of Object.entries(grouped)) {
    lines.push(`\n[${source}] (${entries.length} components)`);
    for (const e of entries) {
      lines.push(
        `  ${e.name} — ${e.description} [${e.tags.join(", ")}]${e.client ? " (client)" : ""}`,
      );
    }
  }
  return lines.join("\n");
}

/**
 * Check if a component name exists in the registry.
 */
export function hasComponent(name: string): boolean {
  return registry.some((e) => e.name === name);
}

/**
 * Clear all registered components (for testing).
 */
export function clearRegistry(): void {
  registry.length = 0;
}

/**
 * Export source priority for external use.
 */
export { SOURCE_PRIORITY };
