/**
 * Freebuff UI Engine — Skill Registry & Retriever
 *
 * Manages the external design skill knowledge base. Skills are NOT injected
 * into every prompt. Instead, the registry provides retrieval-based access:
 * the orchestrator queries relevant skills per pipeline step, receiving
 * only the knowledge segment needed for the current task.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SkillRole =
  | "primary-design-intelligence"
  | "visual-art-direction"
  | "critique-and-refinement"
  | "distinctive-frontend-design"
  | "visual-refinement"
  | "modern-implementation"
  | "quality-gates"
  | "design-knowledge-registry"
  | "motion-specialist";

export interface SkillDefinition {
  id: string;
  name: string;
  role: SkillRole;
  repository?: string;
  capabilities: string[];
  enabled: boolean;
  /** Cached knowledge segments, keyed by topic. */
  knowledgeCache: Map<string, SkillKnowledge>;
  /** License identifier. */
  license?: string;
  /** Version. */
  version?: string;
  /** Last synced timestamp. */
  lastSynced?: number;
}

export interface SkillKnowledge {
  skillId: string;
  topic: string;
  content: string;
  /** Tags for relevance matching. */
  tags: string[];
  /** When this knowledge was cached. */
  cachedAt: number;
}

export interface SkillQuery {
  /** The pipeline step requesting knowledge. */
  step: string;
  /** Required capabilities. */
  capabilities: string[];
  /** Optional context keywords for relevance matching. */
  context?: string[];
  /** Maximum number of knowledge segments to return. */
  maxResults?: number;
}

export interface SkillResponse {
  skillId: string;
  skillName: string;
  role: SkillRole;
  knowledge: SkillKnowledge[];
  relevanceScore: number;
}

// ---------------------------------------------------------------------------
// Built-in knowledge — distilled from each skill's capabilities
// This avoids fetching from external repos at runtime.
// ---------------------------------------------------------------------------

const BUILTIN_KNOWLEDGE: Record<string, SkillKnowledge[]> = {
  "ui-ux-pro-max": [
    {
      skillId: "ui-ux-pro-max",
      topic: "design-system-generation",
      content: `Design System Generation Protocol:
1. Analyze the project's industry, audience, and brand personality.
2. Select a visual direction that reflects the business context — never generic.
3. Define a color system: primary palette (2-4 colors), neutral palette (5-9 shades), semantic colors (success, warning, error, info).
4. Choose typography: one display font for headings, one body font for readability. Ensure they complement each other.
5. Define spacing scale: use a consistent base unit (4px, 8px, or rem-based).
6. Set border-radius, shadows, and elevation rules aligned with brand personality.
7. Create component tokens: buttons, inputs, cards, badges, dialogs.
8. Generate responsive rules for mobile, tablet, and desktop.
9. Document accessibility requirements: contrast ratios, focus states, touch targets.
10. Test the design system against the brand personality: does it feel right?`,
      tags: ["design-system", "colors", "typography", "spacing", "brand"],
      cachedAt: Date.now(),
    },
    {
      skillId: "ui-ux-pro-max",
      topic: "typography",
      content: `Typography Guidelines:
- Display: Use for hero headings and section titles. Weight 300-500. Letter-spacing -0.02em to -0.05em.
- Body: Use for paragraphs and UI text. Weight 400-500. Line-height 1.5-1.8.
- Caption: Use for labels and metadata. Weight 500. Letter-spacing 0.05-0.2em uppercase.
- Scale: Use a modular scale (1.25x or golden ratio) for consistent hierarchy.
- Font pairing: Combine a serif display with a sans body for editorial. Combine two sans-serifs for modern/SaaS.
- Never use more than 2-3 font families in a single project.
- Ensure CJK and special character support where needed.`,
      tags: ["typography", "fonts", "display", "body", "hierarchy"],
      cachedAt: Date.now(),
    },
    {
      skillId: "ui-ux-pro-max",
      topic: "responsive-design",
      content: `Responsive Design Rules:
- Mobile-first approach: design for 320px, scale up.
- Breakpoints: 320px, 375px, 390px, 430px, 768px, 1024px, 1280px, 1440px, 1920px.
- Navigation: hamburger on mobile, horizontal on desktop.
- Typography: scale down 1-2 steps on mobile (e.g., text-4xl becomes text-3xl).
- Spacing: reduce vertical spacing on mobile by 25-40%.
- Grid: single column on mobile, 2-col on tablet, 3-4 col on desktop.
- Touch targets: minimum 44x44px on mobile.
- Images: responsive with srcset, aspect-ratio preserved.
- Forms: single column on mobile, multi-column on desktop.`,
      tags: ["responsive", "mobile", "breakpoints", "layout"],
      cachedAt: Date.now(),
    },
    {
      skillId: "ui-ux-pro-max",
      topic: "accessibility",
      content: `Accessibility Requirements:
- Semantic HTML: use <nav>, <main>, <article>, <aside>, <header>, <footer>, <section>.
- Keyboard navigation: all interactive elements must be reachable via Tab.
- Focus states: visible, high-contrast focus rings on all interactive elements.
- Labels: every form input must have an associated <label> or aria-label.
- ARIA: use aria-live for dynamic content, aria-expanded for toggles, aria-hidden for decorative elements.
- Contrast: text must meet WCAG AA (4.5:1 for normal text, 3:1 for large text).
- Touch targets: minimum 44x44px.
- Form errors: announced to screen readers via aria-describedby.
- Reduced motion: respect prefers-reduced-motion.
- Screen reader: test with VoiceOver/NVDA for critical flows.`,
      tags: ["accessibility", "a11y", "aria", "keyboard", "contrast"],
      cachedAt: Date.now(),
    },
    {
      skillId: "ui-ux-pro-max",
      topic: "industry-specific",
      content: `Industry-Specific Design Patterns:
- Fintech: trust through precision. Muted colors, data-dense layouts, numerical hierarchy.
- Real Estate: aspirational photography, location prominence, mortgage calculators.
- Restaurants: appetite-inducing photography, menu clarity, reservation flow.
- Healthcare: calming palette, clear information hierarchy, appointment booking.
- Education: structured navigation, progress tracking, content hierarchy.
- E-commerce: product photography, clear pricing, trust badges, fast checkout.
- SaaS: feature comparison, pricing tables, onboarding flows.
- Luxury: whitespace as luxury, restrained typography, editorial photography.
- Fashion: editorial layouts, large imagery, collection storytelling.`,
      tags: ["industry", "fashion", "luxury", "ecommerce", "saas"],
      cachedAt: Date.now(),
    },
  ],
  taste: [
    {
      skillId: "taste",
      topic: "composition",
      content: `Visual Composition Principles:
- Rule of thirds: place key elements at intersection points.
- Visual hierarchy: guide the eye with size, color, contrast, and spacing.
- White space: use generously — it signals quality and allows content to breathe.
- Grid systems: align elements to a consistent grid for order and rhythm.
- Focal points: every section should have one clear focal point.
- Asymmetry: create interest through deliberate asymmetry; avoid centered-everything layouts.
- Proximity: group related elements, separate unrelated ones.
- Scale contrast: mix large and small elements for visual dynamism.`,
      tags: ["composition", "layout", "hierarchy", "whitespace", "grid"],
      cachedAt: Date.now(),
    },
    {
      skillId: "taste",
      topic: "visual-personality",
      content: `Visual Personality & Premium Presentation:
- Premium = deliberate. Every design choice should have a reason.
- Typography is personality: the font, weight, size, and spacing of text communicates brand character.
- Color restraint: 2-3 colors maximum. Neutral backgrounds let content shine.
- Photography treatment: consistent crop, color grade, and aspect ratio.
- Motion as character: how things move says as much as how they look.
- Micro-interactions: subtle hover states, focus rings, and transitions signal craft.
- Details matter: line heights, letter spacing, border radius — these small choices compound.
- Anti-generic: never produce default-looking UI. Make every element feel considered.`,
      tags: ["personality", "premium", "craft", "details", "anti-generic"],
      cachedAt: Date.now(),
    },
    {
      skillId: "taste",
      topic: "spacing-and-hierarchy",
      content: `Spacing & Hierarchy:
- Vertical rhythm: consistent spacing between sections (2-4rem for major, 1-2rem for minor).
- Component spacing: 0.5-1rem within components, 1.5-3rem between them.
- Text hierarchy: clear size difference between headings (1.5x-2x ratio).
- Subheading treatment: smaller, lighter, tracked wider than body text.
- Density control: luxury brands use more space; data-dense apps use less.
- Section separation: borders, backgrounds, or generous whitespace.
- Form spacing: 0.75-1rem between fields, 1.5-2rem between field groups.`,
      tags: ["spacing", "hierarchy", "rhythm", "density"],
      cachedAt: Date.now(),
    },
  ],
  "better-web-ui": [
    {
      skillId: "better-web-ui",
      topic: "critique",
      content: `Frontend Critique Protocol:
1. Visual hierarchy: Is the most important element visually dominant?
2. Typography: Are font sizes, weights, and spacing creating clear hierarchy?
3. Spacing: Is whitespace consistent and purposeful?
4. Color: Is the palette cohesive? Are semantic colors used correctly?
5. Contrast: Do text and interactive elements meet WCAG AA?
6. Consistency: Do similar elements look and behave similarly?
7. Responsive: Does the layout work at all breakpoints?
8. Forms: Are inputs labeled, validated, and accessible?
9. Loading states: Are skeletons, spinners, or placeholders shown during async operations?
10. Empty states: Do empty lists/tables have helpful messaging?
11. Error states: Are errors shown inline with clear recovery actions?
12. Animation: Are transitions purposeful and not distracting?
13. Touch: Are interactive elements large enough for mobile?
14. Performance: Are images lazy-loaded? Is there unnecessary re-rendering?`,
      tags: ["critique", "audit", "quality", "review"],
      cachedAt: Date.now(),
    },
    {
      skillId: "better-web-ui",
      topic: "polish",
      content: `Polish Checklist:
- Smooth transitions on all interactive states (hover, focus, active, disabled).
- Consistent border-radius across all components.
- Shadows that follow an elevation system (not random).
- Text truncation with ellipsis where content overflows.
- Loading states for all async operations.
- Skeleton screens instead of spinners where possible.
- Proper focus management in modals and dialogs.
- Scroll behavior: smooth scrolling, scroll-linked animations.
- Image handling: aspect-ratio, object-fit, fallback placeholders.
- Typography: consistent line-heights and letter-spacing throughout.`,
      tags: ["polish", "refinement", "transitions", "shadows"],
      cachedAt: Date.now(),
    },
  ],
  "frontend-design-anthropic": [
    {
      skillId: "frontend-design-anthropic",
      topic: "distinctive-design",
      content: `Distinctive Frontend Design Principles:
- Start with content, not containers. The content dictates the layout.
- Typography as architecture: let type carry the design. Large, confident type choices.
- Meaningful color: every color should serve a purpose — emphasis, status, or brand.
- Intentional spacing: space is not empty — it's a design element.
- Motion with meaning: animate to communicate state changes, not for decoration.
- Component composition: build complex UIs from simple, well-designed primitives.
- Responsive by nature: design for fluidity, not fixed breakpoints.
- Accessibility as quality: accessible interfaces are better interfaces for everyone.
- Anti-generic: purple gradients, glassmorphism overload, and card grids are not design.
- Business-driven: every visual decision should serve the business goal.`,
      tags: ["design", "distinctive", "composition", "anti-generic"],
      cachedAt: Date.now(),
    },
  ],
  impeccable: [
    {
      skillId: "impeccable",
      topic: "visual-refinement",
      content: `Visual Refinement Standards:
- Typography: no more than 2 font families. Weight contrast of 200+ between display and body.
- Line height: 1.1-1.2 for headings, 1.5-1.7 for body, 1.3-1.4 for UI elements.
- Letter spacing: -0.02em to -0.05em for large headings, 0 to 0.02em for body.
- Spacing: use a consistent 4px or 8px grid. Never use odd pixel values.
- Borders: 1px solid with low-opacity neutral, or no border at all.
- Shadows: minimal, layered, following elevation principles.
- Border radius: consistent across similar elements. 2px for buttons, 8-12px for cards.
- Color: desaturated is premium. Avoid pure black (#000) — use #111, #1a1a1a, or #0f172a.
- States: every interactive element needs default, hover, focus, active, disabled, and loading.
- Micro-interactions: 150-250ms duration, ease-out for entrances, ease-in for exits.`,
      tags: ["refinement", "typography", "spacing", "shadows", "polish"],
      cachedAt: Date.now(),
    },
  ],
  "modern-frontend-design": [
    {
      skillId: "modern-frontend-design",
      topic: "modern-implementation",
      content: `Modern Frontend Implementation:
- CSS: use container queries, :has(), nesting, and logical properties.
- Animations: use CSS animations over JS where possible. Use View Transitions API for page transitions.
- Color: use oklch() for perceptually uniform color manipulation.
- Responsive: use clamp() for fluid typography and spacing.
- Performance: use content-visibility, will-change sparingly, and CSS containment.
- Accessibility: prefers-reduced-motion, prefers-color-scheme, prefers-contrast.
- Modern selectors: :focus-visible, :target, :in-range, :placeholder-shown.
- Grid: use CSS Grid for complex layouts, Flexbox for alignment within components.
- Scroll-driven animations: use animation-timeline for scroll-linked effects.
- Transitions: use transition-behavior: allow-discrete for reveal transitions.`,
      tags: ["modern", "css", "animation", "view-transitions", "performance"],
      cachedAt: Date.now(),
    },
  ],
  "ai-motion-engine": [
    {
      skillId: "ai-motion-engine",
      topic: "motion-design",
      content: `Motion Design Rules:
- Purpose: every animation must communicate something — state change, spatial relationship, or feedback.
- Duration: 100-200ms for micro-interactions, 200-400ms for transitions, 400-600ms for page-level.
- Easing: use natural curves. Default: cubic-bezier(0.22, 1, 0.36, 1). Spring: cubic-bezier(0.34, 1.56, 0.64, 1).
- Entrance: elements entering should fade in and slide up 8-16px. Stagger by 50-90ms.
- Exit: elements leaving should fade out. Reverse of entrance.
- Hover: scale 1.02-1.05 for cards, color shift for links/buttons, underline reveal for text links.
- Focus: ring or outline that appears within 100ms of Tab key.
- Press: scale down 0.98 on active/click. Quick spring back on release.
- Scroll: use IntersectionObserver. Trigger once or on enter/exit.
- Loading: skeleton shimmer, not spinning wheel. Pulse opacity 0.4-1.0.
- Reduced motion: respect prefers-reduced-motion. Replace motion with opacity-only changes.
- Performance: only animate transform and opacity. Use will-change for known animations.
- Interruptibility: animations must be interruptible — don't lock the UI during transitions.`,
      tags: ["motion", "animation", "transitions", "easing", "performance"],
      cachedAt: Date.now(),
    },
  ],
  "skill-kit": [
    {
      skillId: "skill-kit",
      topic: "design-patterns",
      content: `Design Pattern Registry:
- Hero: full-width or contained. Background image/video with overlay text. CTA below.
- Feature grid: 2-4 columns. Icon + title + description. Consistent card height.
- Testimonial: quote text, author name, photo. Carousel on mobile.
- Pricing: 2-3 tier comparison. Highlight recommended tier.
- CTA section: full-width background, centered text, prominent button.
- Stats: large numbers with labels. Horizontal on desktop, stacked on mobile.
- Gallery: masonry or grid. Lightbox on click. Lazy load below fold.
- FAQ: accordion. One open at a time. Smooth height animation.
- Footer: multi-column links, social icons, newsletter signup, legal text.
- Navigation: sticky header, transparent on hero, solid on scroll.`,
      tags: ["patterns", "components", "layouts", "hero", "pricing"],
      cachedAt: Date.now(),
    },
  ],
};

// ---------------------------------------------------------------------------
// Global registry
// ---------------------------------------------------------------------------

const skills: Map<string, SkillDefinition> = new Map();

// Initialize with built-in knowledge
for (const [id, knowledge] of Object.entries(BUILTIN_KNOWLEDGE)) {
  const firstKnowledge = knowledge[0];
  if (!firstKnowledge) continue;
  skills.set(id, {
    id,
    name: id.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    role: inferRole(id),
    capabilities: firstKnowledge.tags,
    enabled: true,
    knowledgeCache: new Map(
      knowledge.map((k) => [k.topic, k]),
    ),
  });
}

function inferRole(id: string): SkillRole {
  if (id === "ui-ux-pro-max") return "primary-design-intelligence";
  if (id === "taste") return "visual-art-direction";
  if (id === "better-web-ui") return "critique-and-refinement";
  if (id === "frontend-design-anthropic") return "distinctive-frontend-design";
  if (id === "impeccable") return "visual-refinement";
  if (id === "modern-frontend-design") return "modern-implementation";
  if (id === "ai-motion-engine") return "motion-specialist";
  if (id === "skill-kit") return "design-knowledge-registry";
  return "quality-gates";
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Query the skill registry for relevant knowledge.
 */
export function querySkills(query: SkillQuery): SkillResponse[] {
  const results: SkillResponse[] = [];

  for (const [, skill] of skills) {
    if (!skill.enabled) continue;

    // Check capability overlap
    const capOverlap = query.capabilities.filter((c) =>
      skill.capabilities.includes(c),
    );
    if (capOverlap.length === 0) continue;

    // Gather matching knowledge segments
    const matchingKnowledge: SkillKnowledge[] = [];
    const queryText = (query.context ?? []).join(" ").toLowerCase();

    for (const [, knowledge] of skill.knowledgeCache) {
      // Check tag relevance
      const tagMatch = query.capabilities.some((c) =>
        knowledge.tags.includes(c),
      );
      // Check keyword relevance
      const keywordMatch = queryText
        ? knowledge.tags.some((t) => queryText.includes(t)) ||
          knowledge.content.toLowerCase().includes(queryText.slice(0, 50))
        : true;

      if (tagMatch || keywordMatch) {
        matchingKnowledge.push(knowledge);
      }
    }

    if (matchingKnowledge.length > 0) {
      const relevanceScore =
        capOverlap.length / query.capabilities.length;
      results.push({
        skillId: skill.id,
        skillName: skill.name,
        role: skill.role,
        knowledge: matchingKnowledge.slice(0, query.maxResults ?? 3),
        relevanceScore,
      });
    }
  }

  // Sort by relevance
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  return results;
}

/**
 * Get a condensed knowledge summary for a specific skill.
 */
export function getSkillSummary(skillId: string): string | null {
  const skill = skills.get(skillId);
  if (!skill) return null;

  const lines: string[] = [`[${skill.name}] Role: ${skill.role}`];
  for (const [, knowledge] of skill.knowledgeCache) {
    lines.push(`  Topic: ${knowledge.topic} [${knowledge.tags.join(", ")}]`);
    // First line of content as summary
    const firstLine = knowledge.content.split("\n")[0];
    lines.push(`    ${firstLine}`);
  }
  return lines.join("\n");
}

/**
 * Task-based skill routing. Returns the smallest effective skill set
 * for a given project type. This prevents injecting every skill into
 * every prompt.
 */
export type ProjectTask =
  | "landing-page"
  | "dashboard"
  | "e-commerce"
  | "portfolio"
  | "blog"
  | "animation-heavy"
  | "data-heavy"
  | "marketing"
  | "enterprise"
  | "general";

const TASK_SKILL_MAP: Record<ProjectTask, string[]> = {
  "landing-page": ["ui-ux-pro-max", "taste", "frontend-design-anthropic", "better-web-ui", "impeccable"],
  "dashboard": ["ui-ux-pro-max", "frontend-design-anthropic", "better-web-ui", "modern-frontend-design"],
  "e-commerce": ["ui-ux-pro-max", "frontend-design-anthropic", "better-web-ui", "impeccable"],
  "portfolio": ["ui-ux-pro-max", "taste", "frontend-design-anthropic", "impeccable"],
  "blog": ["ui-ux-pro-max", "frontend-design-anthropic", "better-web-ui"],
  "animation-heavy": ["ui-ux-pro-max", "taste", "ai-motion-engine", "frontend-design-anthropic", "better-web-ui"],
  "data-heavy": ["ui-ux-pro-max", "modern-frontend-design", "better-web-ui", "frontend-design-anthropic"],
  "marketing": ["ui-ux-pro-max", "taste", "frontend-design-anthropic", "impeccable", "better-web-ui"],
  "enterprise": ["ui-ux-pro-max", "modern-frontend-design", "better-web-ui", "frontend-design-anthropic"],
  "general": ["ui-ux-pro-max", "frontend-design-anthropic", "better-web-ui"],
};

/**
 * Get the recommended skills for a specific project task.
 * Returns only enabled skills from the task's recommended set.
 */
export function getSkillsForTask(task: ProjectTask): SkillDefinition[] {
  const recommended = TASK_SKILL_MAP[task] ?? TASK_SKILL_MAP.general;
  return recommended
    .map((id) => skills.get(id))
    .filter((s): s is SkillDefinition => s !== undefined && s.enabled);
}

/**
 * Get a compact skill summary for a specific task.
 */
export function getTaskSkillSummary(task: ProjectTask): string {
  const skillDefs = getSkillsForTask(task);
  const lines: string[] = [`=== SKILLS FOR: ${task.toUpperCase()} ===\n`];
  for (const s of skillDefs) {
    lines.push(`• ${s.name} (${s.role})`);
  }
  lines.push(`\nTotal: ${skillDefs.length} skills (out of ${skills.size} available)`);
  return lines.join("\n");
}

/**
 * Get all enabled skills for the AI context (compact form).
 */
export function getEnabledSkillsSummary(): string {
  const lines: string[] = ["=== FREEBUFF DESIGN SKILLS ===\n"];
  for (const [, skill] of skills) {
    if (!skill.enabled) continue;
    lines.push(`• ${skill.name} (${skill.role})`);
    lines.push(`  Capabilities: ${skill.capabilities.join(", ")}`);
  }
  return lines.join("\n");
}

/**
 * Enable or disable a skill.
 */
export function setSkillEnabled(skillId: string, enabled: boolean): void {
  const skill = skills.get(skillId);
  if (skill) skill.enabled = enabled;
}

/**
 * Get a specific skill definition.
 */
export function getSkill(skillId: string): SkillDefinition | undefined {
  return skills.get(skillId);
}
