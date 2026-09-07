/**
 * Freebuff UI Engine — Industry Presets
 *
 * Provides industry-specific design intelligence, including visual direction,
 * typography choices, information density patterns, navigation styles,
 * component choices, motion styles, and conversion patterns.
 */

import type { Industry } from "./design-system-generator";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface IndustryPreset {
  id: Industry;
  name: string;
  visualDirection: string;
  typography: {
    display: string;
    body: string;
    reasoning: string;
  };
  informationDensity: "minimal" | "moderate" | "dense";
  navigationStyle: string;
  componentChoices: string[];
  motionStyle: string;
  conversionPatterns: string[];
  colorMood: string;
  photographyStyle: string;
  contentPatterns: string[];
}

// ---------------------------------------------------------------------------
// Industry presets
// ---------------------------------------------------------------------------

const PRESETS: Record<Industry, IndustryPreset> = {
  fintech: {
    id: "fintech",
    name: "Fintech",
    visualDirection: "Trust through precision. Clean lines, muted palette, data-dense layouts with clear numerical hierarchy.",
    typography: {
      display: "Inter",
      body: "Inter",
      reasoning: "A single, highly legible sans-serif communicates precision and trustworthiness.",
    },
    informationDensity: "dense",
    navigationStyle: "Sidebar dashboard navigation with clear categorization",
    componentChoices: ["data-table", "stat-card", "progress-bar", "toggle", "tabs"],
    motionStyle: "Minimal, purposeful. Smooth number transitions. No decorative animation.",
    conversionPatterns: ["Trust badges", "Security indicators", "Clear pricing", "Progress indicators"],
    colorMood: "Professional blues and grays with accent for actions",
    photographyStyle: "Minimal photography. Illustrations and icons preferred.",
    contentPatterns: ["Data visualization", "Dashboard widgets", "Transaction lists", "Account summaries"],
  },
  "real-estate": {
    id: "real-estate",
    name: "Real Estate",
    visualDirection: "Aspirational imagery with property-forward layouts. Warm tones, clear search and filtering.",
    typography: {
      display: "Playfair Display",
      body: "Source Sans 3",
      reasoning: "Serif display font for aspirational headings, paired with a highly readable sans-serif body.",
    },
    informationDensity: "moderate",
    navigationStyle: "Property-focused navigation with prominent search and filters",
    componentChoices: ["property-card", "search-bar", "filter-panel", "map", "gallery"],
    motionStyle: "Subtle image transitions, smooth filter changes, gentle scroll reveals.",
    conversionPatterns: ["Contact agent CTA", "Schedule viewing", "Mortgage calculator", "Saved search alerts"],
    colorMood: "Warm neutrals with bold accent for CTAs",
    photographyStyle: "Professional property photography with consistent lighting and staging.",
    contentPatterns: ["Property listings", "Floor plans", "Neighborhood guides", "Agent profiles"],
  },
  restaurants: {
    id: "restaurants",
    name: "Restaurants",
    visualDirection: "Appetizing and atmospheric. Food-forward photography, warm ambient tones, reservation prominence.",
    typography: {
      display: "Cormorant Garamond",
      body: "DM Sans",
      reasoning: "Elegant serif for restaurant personality, clean sans-serif for menu readability.",
    },
    informationDensity: "moderate",
    navigationStyle: "Simple top navigation with menu, reservations, and about sections",
    componentChoices: ["menu-card", "reservation-form", "gallery", "map", "hours-display"],
    motionStyle: "Warm, inviting transitions. Gentle image crossfades. No aggressive animation.",
    conversionPatterns: ["Reserve now button", "Order online", "View menu", "Gift cards"],
    colorMood: "Warm, appetite-inducing tones — earthy reds, warm whites, natural greens",
    photographyStyle: "Professional food photography with natural lighting. Overhead and 45-degree angles.",
    contentPatterns: ["Menu sections", "Chef profiles", "Gallery", "Location and hours", "Event spaces"],
  },
  hospitality: {
    id: "hospitality",
    name: "Hospitality",
    visualDirection: "Welcoming and serene. Spacious layouts, premium imagery, booking-forward flow.",
    typography: {
      display: "Cormorant",
      body: "Lato",
      reasoning: "Refined serif for luxury hospitality feel, warm sans-serif for readability.",
    },
    informationDensity: "minimal",
    navigationStyle: "Elegant top navigation with booking CTA always visible",
    componentChoices: ["booking-widget", "room-card", "amenity-icons", "gallery", "testimonial"],
    motionStyle: "Serene, slow transitions. Parallax on hero. Gentle fades between sections.",
    conversionPatterns: ["Book now", "Check availability", "Virtual tour", "Special offers"],
    colorMood: "Serene, muted palette — soft whites, warm grays, gold accents",
    photographyStyle: "Professional property photography with golden-hour lighting. Wide-angle interiors.",
    contentPatterns: ["Room descriptions", "Amenity lists", "Photo galleries", "Guest reviews", "Location guides"],
  },
  healthcare: {
    id: "healthcare",
    name: "Healthcare",
    visualDirection: "Calm and trustworthy. Clear information hierarchy, professional imagery, appointment-forward.",
    typography: {
      display: "Plus Jakarta Sans",
      body: "Inter",
      reasoning: "Modern, approachable sans-serif for healthcare. High legibility across all sizes.",
    },
    informationDensity: "moderate",
    navigationStyle: "Clear top navigation with prominent appointment booking",
    componentChoices: ["appointment-form", "service-card", "doctor-profile", "faq-accordion", "contact-form"],
    motionStyle: "Calm, minimal motion. Smooth page transitions. No distracting animations.",
    conversionPatterns: ["Book appointment", "Find a doctor", "Patient portal", "Insurance information"],
    colorMood: "Calming teals and blues with white space. Trustworthy and clean.",
    photographyStyle: "Professional, warm photography of facilities and staff. Avoid clinical stock photos.",
    contentPatterns: ["Service descriptions", "Doctor profiles", "Patient resources", "Health information"],
  },
  education: {
    id: "education",
    name: "Education",
    visualDirection: "Approachable and structured. Clear navigation, progress-oriented layouts, learning-first.",
    typography: {
      display: "Plus Jakarta Sans",
      body: "Nunito Sans",
      reasoning: "Friendly, approachable fonts that maintain readability for long-form educational content.",
    },
    informationDensity: "dense",
    navigationStyle: "Structured navigation with course catalog, progress tracking, and resources",
    componentChoices: ["course-card", "progress-bar", "quiz-widget", "video-player", "certificate"],
    motionStyle: "Moderate, encouraging animations. Progress celebrations. Smooth transitions.",
    conversionPatterns: ["Enroll now", "Start free trial", "Download syllabus", "Watch preview"],
    colorMood: "Inspiring blues and purples with warm accents. Encouraging and approachable.",
    photographyStyle: "Diverse, real photography of students and learning environments.",
    contentPatterns: ["Course descriptions", "Curriculum outlines", "Instructor profiles", "Student reviews"],
  },
  "e-commerce": {
    id: "e-commerce",
    name: "E-commerce",
    visualDirection: "Clean, conversion-focused. Product photography dominant. Clear pricing and CTAs.",
    typography: {
      display: "Satoshi",
      body: "Inter",
      reasoning: "Modern geometric sans-serif for product presentation, universal body font.",
    },
    informationDensity: "dense",
    navigationStyle: "Category-driven navigation with search, filters, and cart always visible",
    componentChoices: ["product-card", "filter-panel", "cart-drawer", "product-gallery", "review-stars"],
    motionStyle: "Subtle product hover effects. Smooth cart transitions. Quick page loads.",
    conversionPatterns: ["Add to cart", "Buy now", "Free shipping threshold", "Trust badges", "Reviews"],
    colorMood: "Clean whites with strategic accent color for CTAs. Product photography provides color.",
    photographyStyle: "Professional product photography on clean backgrounds. Consistent aspect ratios.",
    contentPatterns: ["Product listings", "Product details", "Customer reviews", "Size guides", "Shipping info"],
  },
  saas: {
    id: "saas",
    name: "SaaS",
    visualDirection: "Modern, efficient, approachable. Feature-forward with clear value propositions.",
    typography: {
      display: "Geist",
      body: "Inter",
      reasoning: "Clean, modern sans-serif pair that communicates efficiency and technical competence.",
    },
    informationDensity: "moderate",
    navigationStyle: "Product-focused with pricing, features, and docs navigation",
    componentChoices: ["pricing-table", "feature-grid", "testimonial-carousel", "demo-widget", "signup-form"],
    motionStyle: "Moderate, purposeful animations. Feature demonstrations. Smooth onboarding flows.",
    conversionPatterns: ["Start free trial", "Book demo", "See pricing", "Feature comparison"],
    colorMood: "Clean, modern palette. Neutral background with bold accent for CTAs.",
    photographyStyle: "Product screenshots, UI mockups, and abstract illustrations.",
    contentPatterns: ["Feature descriptions", "Pricing tiers", "Integration lists", "Documentation"],
  },
  ai: {
    id: "ai",
    name: "AI",
    visualDirection: "Futuristic yet minimal. Intelligence-forward with restrained use of futuristic elements.",
    typography: {
      display: "Geist",
      body: "Inter",
      reasoning: "Technical, modern fonts that communicate innovation without being gimmicky.",
    },
    informationDensity: "minimal",
    navigationStyle: "Minimal navigation focused on the product experience",
    componentChoices: ["chat-interface", "demo-widget", "capability-grid", "benchmark-card", "code-block"],
    motionStyle: "Subtle, intelligent animations. Typing indicators. Smooth AI response reveals.",
    conversionPatterns: ["Try it now", "See it in action", "API documentation", "Pricing"],
    colorMood: "Dark theme preferred. Subtle gradients. Monochromatic with strategic accent.",
    photographyStyle: "Abstract visuals, product UI, terminal/code aesthetics.",
    contentPatterns: ["Capability demonstrations", "API references", "Use cases", "Benchmarks"],
  },
  "professional-services": {
    id: "professional-services",
    name: "Professional Services",
    visualDirection: "Authoritative and credible. Polished layouts with trust-building content.",
    typography: {
      display: "Fraunces",
      body: "Inter",
      reasoning: "Serif display for authority and credibility, clean sans-serif for professionalism.",
    },
    informationDensity: "moderate",
    navigationStyle: "Service-focused navigation with team and contact prominent",
    componentChoices: ["service-card", "team-member", "case-study", "testimonial", "contact-form"],
    motionStyle: "Minimal, professional. Subtle hover states. No playful animations.",
    conversionPatterns: ["Schedule consultation", "Request proposal", "Download whitepaper", "Contact us"],
    colorMood: "Professional navy, gray, and white with gold or blue accent.",
    photographyStyle: "Professional team photography and office imagery. Clean and polished.",
    contentPatterns: ["Service descriptions", "Case studies", "Team profiles", "Client testimonials"],
  },
  construction: {
    id: "construction",
    name: "Construction",
    visualDirection: "Robust and reliable. Project-forward imagery, direct communication, practical layouts.",
    typography: {
      display: "Barlow",
      body: "DM Sans",
      reasoning: "Strong, industrial-feeling sans-serif for construction's robust personality.",
    },
    informationDensity: "dense",
    navigationStyle: "Project and service-focused navigation with prominent contact",
    componentChoices: ["project-gallery", "service-card", "quote-form", "team-card", "certification-badge"],
    motionStyle: "Minimal, reliable. No decorative animation. Focus on image galleries.",
    conversionPatterns: ["Request quote", "View projects", "Schedule consultation", "Emergency contact"],
    colorMood: "Industrial tones — concrete grays, safety orange, steel blue accents.",
    photographyStyle: "Professional project photography showing completed work and active sites.",
    contentPatterns: ["Project portfolios", "Service descriptions", "Safety certifications", "Equipment lists"],
  },
  logistics: {
    id: "logistics",
    name: "Logistics",
    visualDirection: "Efficient and systematic. Data-forward with clear tracking and status visualization.",
    typography: {
      display: "Plus Jakarta Sans",
      body: "Inter",
      reasoning: "Clean, efficient fonts for data-dense logistics interfaces.",
    },
    informationDensity: "dense",
    navigationStyle: "Dashboard-style with tracking, fleet, and analytics sections",
    componentChoices: ["tracking-widget", "status-timeline", "data-table", "map-view", "stat-card"],
    motionStyle: "Minimal, functional. Status transitions. No decorative animation.",
    conversionPatterns: ["Track shipment", "Get quote", "Schedule pickup", "API access"],
    colorMood: "Professional blues and grays with status colors (green/yellow/red).",
    photographyStyle: "Minimal. Maps, diagrams, and data visualizations preferred.",
    contentPatterns: ["Shipment tracking", "Service areas", "Rate calculators", "API documentation"],
  },
  corporate: {
    id: "corporate",
    name: "Corporate",
    visualDirection: "Authoritative and established. Trust-building content with polished execution.",
    typography: {
      display: "DM Serif Display",
      body: "Inter",
      reasoning: "Classic serif for corporate authority, modern sans-serif for digital readability.",
    },
    informationDensity: "moderate",
    navigationStyle: "Standard corporate nav with investor relations, careers, and contact",
    componentChoices: ["stat-card", "team-card", "news-card", "report-download", "contact-form"],
    motionStyle: "Minimal, professional. Subtle scroll reveals. No playful animation.",
    conversionPatterns: ["Contact us", "Annual report", "Investor relations", "Careers"],
    colorMood: "Corporate blue, gray, and white. Conservative and trustworthy.",
    photographyStyle: "Professional corporate photography. Office, team, and event imagery.",
    contentPatterns: ["Company overview", "Leadership team", "Financial reports", "News and press"],
  },
  luxury: {
    id: "luxury",
    name: "Luxury",
    visualDirection: "Refined and exclusive. Generous whitespace, editorial photography, restrained typography.",
    typography: {
      display: "Cormorant Garamond",
      body: "EB Garamond",
      reasoning: "Double serif pairing signals luxury and exclusivity. Less is more.",
    },
    informationDensity: "minimal",
    navigationStyle: "Minimal top navigation, possibly hidden. Focus on visual storytelling.",
    componentChoices: ["editorial-layout", "full-bleed-image", "minimal-card", "timeline", "quote"],
    motionStyle: "Slow, deliberate. Gentle parallax. Slow crossfades. No fast transitions.",
    conversionPatterns: ["Private consultation", "Exclusive access", "Bespoke service", "Appointment"],
    colorMood: "Restrained palette — black, white, gold, cream. Photography provides color.",
    photographyStyle: "Editorial photography. High contrast, professional lighting, artistic composition.",
    contentPatterns: ["Editorial stories", "Craftsmanship narratives", "Heritage content", "Lookbooks"],
  },
  media: {
    id: "media",
    name: "Media",
    visualDirection: "Bold and editorial. Content-forward with attention-grabbing headlines.",
    typography: {
      display: "Oswald",
      body: "Source Sans 3",
      reasoning: "Condensed display font for dramatic headlines, readable body for articles.",
    },
    informationDensity: "dense",
    navigationStyle: "Category-driven with trending, latest, and search prominent",
    componentChoices: ["article-card", "video-player", "category-nav", "share-buttons", "comment-section"],
    motionStyle: "Dynamic but controlled. Smooth page transitions. Video autoplay on hover.",
    conversionPatterns: ["Subscribe", "Newsletter signup", "Follow on social", "Read more"],
    colorMood: "High contrast. Bold colors for sections. Photography-driven.",
    photographyStyle: "Professional editorial photography. High impact, storytelling compositions.",
    contentPatterns: ["Article layouts", "Video content", "Photo galleries", "Podcast players"],
  },
  marketplaces: {
    id: "marketplaces",
    name: "Marketplaces",
    visualDirection: "Trustworthy and organized. Multi-vendor friendly with clear categorization.",
    typography: {
      display: "Plus Jakarta Sans",
      body: "Inter",
      reasoning: "Versatile, readable fonts that work across diverse product categories.",
    },
    informationDensity: "dense",
    navigationStyle: "Category and search-driven with vendor profiles and reviews",
    componentChoices: ["product-card", "vendor-card", "search-bar", "filter-panel", "review-stars"],
    motionStyle: "Subtle product interactions. Smooth filter transitions. Quick search results.",
    conversionPatterns: ["Add to cart", "Vendor ratings", "Buyer protection", "Free returns"],
    colorMood: "Clean whites with category-specific accent colors. Trust signals prominent.",
    photographyStyle: "User-generated product photography mixed with professional hero images.",
    contentPatterns: ["Product listings", "Vendor profiles", "Buyer reviews", "Category guides"],
  },
  "mobile-applications": {
    id: "mobile-applications",
    name: "Mobile Applications",
    visualDirection: "Fluid and thumb-friendly. Native-feeling interactions with clear hierarchy.",
    typography: {
      display: "SF Pro Display",
      body: "SF Pro Text",
      reasoning: "Platform-native fonts for the most native-feeling experience.",
    },
    informationDensity: "moderate",
    navigationStyle: "Bottom tab navigation, swipe gestures, pull-to-refresh",
    componentChoices: ["bottom-nav", "swipe-card", "pull-refresh", "toast", "bottom-sheet"],
    motionStyle: "Fluid, native-feeling. Spring physics. Gesture-driven transitions.",
    conversionPatterns: ["Sign up flow", "Onboarding", "Push notification opt-in", "Share"],
    colorMood: "Platform-adaptive. Supports light and dark mode natively.",
    photographyStyle: "App screenshots, device mockups, lifestyle imagery.",
    contentPatterns: ["Feature walkthroughs", "Settings screens", "Profile pages", "Notification feeds"],
  },
  fashion: {
    id: "fashion",
    name: "Fashion",
    visualDirection: "Editorial and aspirational. Photography-forward with collection storytelling.",
    typography: {
      display: "Cormorant Garamond",
      body: "Inter",
      reasoning: "Elegant serif for fashion headings, clean sans-serif for product details.",
    },
    informationDensity: "minimal",
    navigationStyle: "Collection-driven navigation with editorial and shop sections",
    componentChoices: ["editorial-layout", "product-card", "gallery", "lookbook", "size-selector"],
    motionStyle: "Refined, editorial. Gentle parallax. Smooth image transitions. No playful effects.",
    conversionPatterns: ["Shop the look", "Add to bag", "Book appointment", "View collection"],
    colorMood: "Restrained palette. Photography provides the color. Neutral backgrounds.",
    photographyStyle: "Editorial fashion photography. Professional lighting, artistic composition.",
    contentPatterns: ["Collection stories", "Lookbooks", "Editorial content", "Product details"],
  },
  architecture: {
    id: "architecture",
    name: "Architecture",
    visualDirection: "Authoritative and structural. Large imagery, bold typography, generous whitespace, portfolio-forward.",
    typography: {
      display: "Playfair Display",
      body: "Inter",
      reasoning: "Serif display for architectural authority, clean sans for readability.",
    },
    informationDensity: "minimal",
    navigationStyle: "Minimal top navigation with portfolio and contact prominent",
    componentChoices: ["project-gallery", "service-card", "team-card", "testimonial", "contact-form"],
    motionStyle: "Refined, deliberate. Parallax on hero. Smooth scroll reveals. No playful effects.",
    conversionPatterns: ["Schedule consultation", "View portfolio", "Request quote"],
    colorMood: "Dark charcoal primary with warm gold accent. Clean whites.",
    photographyStyle: "Professional architectural photography with consistent composition.",
    contentPatterns: ["Project portfolios", "Service descriptions", "Team profiles", "Awards"],
  },
  "interior-design": {
    id: "interior-design",
    name: "Interior Design",
    visualDirection: "Warm and tactile. Photography-forward with rich material textures and inviting spaces.",
    typography: {
      display: "Cormorant Garamond",
      body: "Inter",
      reasoning: "Elegant serif for interior design warmth, clean sans for details.",
    },
    informationDensity: "minimal",
    navigationStyle: "Visual navigation with portfolio and services",
    componentChoices: ["project-gallery", "before-after", "service-card", "testimonial", "booking-form"],
    motionStyle: "Gentle transitions. Smooth image reveals. Parallax on interiors.",
    conversionPatterns: ["Book consultation", "View portfolio", "Request mood board"],
    colorMood: "Warm neutrals with earthy accent. Rich textures.",
    photographyStyle: "Interior photography with natural light, consistent color grading.",
    contentPatterns: ["Project showcases", "Material palettes", "Design process", "Client stories"],
  },
  other: {
    id: "other",
    name: "Other",
    visualDirection: "Clean, modern, and adaptable. Defaults to best practices for the specific content.",
    typography: {
      display: "Inter",
      body: "Inter",
      reasoning: "Versatile, universal font that works across most contexts.",
    },
    informationDensity: "moderate",
    navigationStyle: "Standard responsive navigation",
    componentChoices: ["card", "list", "form", "modal", "table"],
    motionStyle: "Moderate, purposeful animations aligned with content.",
    conversionPatterns: ["Clear primary CTA", "Contact or signup", "Content engagement"],
    colorMood: "Neutral with strategic accent color.",
    photographyStyle: "Professional imagery appropriate to the content.",
    contentPatterns: ["Varied based on specific project needs."],
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Get the design preset for an industry.
 */
export function getIndustryPreset(industry: Industry): IndustryPreset {
  return PRESETS[industry] ?? PRESETS.other;
}

/**
 * Get a summary of an industry preset for AI context.
 */
export function getIndustrySummary(industry: Industry): string {
  const preset = getIndustryPreset(industry);
  return [
    `=== INDUSTRY: ${preset.name.toUpperCase()} ===`,
    `Visual Direction: ${preset.visualDirection}`,
    `Typography: ${preset.typography.display} (display) + ${preset.typography.body} (body)`,
    `  Reasoning: ${preset.typography.reasoning}`,
    `Information Density: ${preset.informationDensity}`,
    `Navigation: ${preset.navigationStyle}`,
    `Components: ${preset.componentChoices.join(", ")}`,
    `Motion: ${preset.motionStyle}`,
    `Conversion Patterns: ${preset.conversionPatterns.join(", ")}`,
    `Color Mood: ${preset.colorMood}`,
    `Photography: ${preset.photographyStyle}`,
    `Content Patterns: ${preset.contentPatterns.join(", ")}`,
  ].join("\n");
}

/**
 * Get all available industry presets.
 */
export function getAllIndustries(): Industry[] {
  return Object.keys(PRESETS) as Industry[];
}
