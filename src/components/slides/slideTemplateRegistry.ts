// Smart Layout / named-slot template registry.
//
// Unlike Gamma's loose prompt-based template substitution, every template here
// declares:
//   • a stable `id` voice tools and AI can reference
//   • a `category` for the Smart Layouts library tabs
//   • a `layout` mapped to an existing SlideLayout the renderer already knows
//   • a typed `slots[]` schema with defaults & validation hints
//   • a `seed` of starter content
//
// applySlideTemplate(template, values) returns a fully-populated SlideData
// (minus `id`) by merging defaults, slot overrides, and the seed.

import type { SlideData, SlideLayout } from "./slideTypes";

export type SlotType = "text" | "longtext" | "image-url" | "stat" | "stat-list" | "timeline" | "process";

export interface SlideTemplateSlot {
  name: string;
  type: SlotType;
  label: string;
  required?: boolean;
  default?: unknown;
}

export type SmartLayoutCategory = "basic" | "structure" | "data" | "media";

export interface SlideBlockTemplate {
  id: string;
  category: SmartLayoutCategory;
  label: string;
  description: string;
  layout: SlideLayout;
  slots: SlideTemplateSlot[];
  seed: Omit<SlideData, "id" | "layout"> & { layout?: SlideLayout };
}

export const SLIDE_BLOCK_TEMPLATES: SlideBlockTemplate[] = [
  // ── BASIC ──────────────────────────────────────────────────────
  {
    id: "title-hero",
    category: "basic",
    label: "Title",
    description: "Cover or chapter opener",
    layout: "title",
    slots: [
      { name: "title", type: "text", label: "Headline", required: true, default: "Presentation Title" },
      { name: "subtitle", type: "text", label: "Subtitle", default: "Subtitle or tagline" },
    ],
    seed: { title: "Presentation Title", subtitle: "Subtitle or tagline", variant: "default" },
  },
  {
    id: "section-divider",
    category: "basic",
    label: "Section",
    description: "Chapter divider",
    layout: "section",
    slots: [
      { name: "title", type: "text", label: "Section name", required: true, default: "Section Header" },
      { name: "subtitle", type: "text", label: "Brief description", default: "" },
    ],
    seed: { title: "Section Header", subtitle: "Brief description", variant: "default" },
  },
  {
    id: "content-bullets",
    category: "basic",
    label: "Content",
    description: "Heading + body copy",
    layout: "content",
    slots: [
      { name: "title", type: "text", label: "Heading", required: true, default: "Slide Title" },
      { name: "body", type: "longtext", label: "Body copy", default: "Add your key points here." },
    ],
    seed: { title: "Slide Title", body: "Add your key points here.", variant: "default" },
  },
  {
    id: "blank-canvas",
    category: "basic",
    label: "Blank",
    description: "Empty canvas",
    layout: "blank",
    slots: [],
    seed: { title: "", variant: "default" },
  },

  // ── STRUCTURE ──────────────────────────────────────────────────
  {
    id: "two-column-split",
    category: "structure",
    label: "Two Column",
    description: "Side-by-side comparison",
    layout: "two-column",
    slots: [
      { name: "title", type: "text", label: "Title", required: true, default: "Two Column Layout" },
      { name: "body", type: "longtext", label: "Left ⟶ Right (use '---' separator)", default: "Left column content\n---\nRight column content" },
    ],
    seed: { title: "Two Column Layout", body: "Left column content\n---\nRight column content", variant: "default" },
  },
  {
    id: "comparison-vs",
    category: "structure",
    label: "Comparison",
    description: "Versus / option A vs B",
    layout: "comparison",
    slots: [
      { name: "title", type: "text", label: "Title", required: true, default: "Option A vs Option B" },
      { name: "body", type: "longtext", label: "Bullets per side (use '---')", default: "Pros of A\nFaster setup\nLower cost\n---\nPros of B\nMore power\nEnterprise ready" },
    ],
    seed: { title: "Option A vs Option B", body: "Pros of A\nFaster setup\nLower cost\n---\nPros of B\nMore power\nEnterprise ready", variant: "default" },
  },
  {
    id: "agenda-outline",
    category: "structure",
    label: "Agenda",
    description: "Bulleted outline",
    layout: "agenda",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Agenda" },
      { name: "body", type: "longtext", label: "Items (one per line)", default: "Introduction\nThe challenge\nOur approach\nResults & next steps" },
    ],
    seed: { title: "Agenda", body: "Introduction\nThe challenge\nOur approach\nResults & next steps", variant: "default" },
  },
  {
    id: "process-arrow",
    category: "structure",
    label: "Process",
    description: "Step-by-step flow",
    layout: "process",
    slots: [
      { name: "title", type: "text", label: "Title", default: "How it works" },
      { name: "process", type: "process", label: "Steps", default: [
        { title: "Discover", description: "Understand the problem" },
        { title: "Design", description: "Shape the solution" },
        { title: "Deliver", description: "Ship and measure" },
      ] },
    ],
    seed: {
      title: "How it works",
      variant: "default",
      process: [
        { title: "Discover", description: "Understand the problem" },
        { title: "Design", description: "Shape the solution" },
        { title: "Deliver", description: "Ship and measure" },
      ],
    },
  },
  {
    id: "timeline-horizontal",
    category: "structure",
    label: "Timeline",
    description: "Horizontal milestones",
    layout: "timeline",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Roadmap" },
      { name: "timeline", type: "timeline", label: "Milestones", default: [
        { date: "Q1", title: "Launch", description: "Public beta" },
        { date: "Q2", title: "Scale", description: "10× usage" },
        { date: "Q3", title: "Expand", description: "Global rollout" },
        { date: "Q4", title: "Optimize", description: "Profitability" },
      ] },
    ],
    seed: {
      title: "Roadmap",
      variant: "default",
      timeline: [
        { date: "Q1", title: "Launch", description: "Public beta" },
        { date: "Q2", title: "Scale", description: "10× usage" },
        { date: "Q3", title: "Expand", description: "Global rollout" },
        { date: "Q4", title: "Optimize", description: "Profitability" },
      ],
    },
  },

  // ── DATA ───────────────────────────────────────────────────────
  {
    id: "kpi-trio",
    category: "data",
    label: "KPI Trio",
    description: "Three headline metrics",
    layout: "stats",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Key Metrics" },
      { name: "stats", type: "stat-list", label: "Stats (3)", default: [
        { value: "120K", label: "Active users" },
        { value: "4.8★", label: "Avg rating" },
        { value: "32%", label: "YoY growth" },
      ] },
    ],
    seed: {
      title: "Key Metrics",
      variant: "default",
      stats: [
        { value: "120K", label: "Active users" },
        { value: "4.8★", label: "Avg rating" },
        { value: "32%", label: "YoY growth" },
      ],
    },
  },
  {
    id: "stat-hero",
    category: "data",
    label: "Big Number",
    description: "Single hero metric",
    layout: "big-number",
    slots: [
      { name: "title", type: "text", label: "Headline", default: "Headline metric" },
      { name: "statValue", type: "text", label: "Number", required: true, default: "99%" },
      { name: "statLabel", type: "text", label: "Label", default: "Customer satisfaction" },
    ],
    seed: {
      title: "Headline metric",
      stats: [{ value: "99%", label: "Customer satisfaction" }],
      variant: "default",
    },
  },
  {
    id: "chart-bar",
    category: "data",
    label: "Bar Chart",
    description: "Quick bar chart",
    layout: "chart",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Quarterly Growth" },
    ],
    seed: {
      title: "Quarterly Growth",
      variant: "default",
      chart: {
        type: "bar",
        title: "Quarterly Growth",
        data: [
          { label: "Q1", value: 24 },
          { label: "Q2", value: 38 },
          { label: "Q3", value: 52 },
          { label: "Q4", value: 71 },
        ],
      },
    },
  },
  {
    id: "pull-quote",
    category: "data",
    label: "Quote",
    description: "Pull quote with attribution",
    layout: "quote",
    slots: [
      { name: "title", type: "longtext", label: "Quote", required: true, default: "An inspiring quote that frames the next chapter." },
      { name: "quoteAuthor", type: "text", label: "Author", default: "Author Name" },
    ],
    seed: { title: "An inspiring quote that frames the next chapter.", quoteAuthor: "Author Name", variant: "default" },
  },

  // ── MEDIA ──────────────────────────────────────────────────────
  {
    id: "image-left",
    category: "media",
    label: "Image Left",
    description: "Image with text on right",
    layout: "image-left",
    slots: [
      { name: "title", type: "text", label: "Title", required: true, default: "Slide Title" },
      { name: "body", type: "longtext", label: "Body", default: "Supporting copy next to the image." },
      { name: "imageUrl", type: "image-url", label: "Image URL", default: "" },
    ],
    seed: { title: "Slide Title", body: "Supporting copy next to the image.", variant: "default" },
  },
  {
    id: "image-right",
    category: "media",
    label: "Image Right",
    description: "Text with image on right",
    layout: "image-right",
    slots: [
      { name: "title", type: "text", label: "Title", required: true, default: "Slide Title" },
      { name: "body", type: "longtext", label: "Body", default: "Supporting copy next to the image." },
      { name: "imageUrl", type: "image-url", label: "Image URL", default: "" },
    ],
    seed: { title: "Slide Title", body: "Supporting copy next to the image.", variant: "default" },
  },
  {
    id: "full-image-hero",
    category: "media",
    label: "Full Image",
    description: "Edge-to-edge hero image",
    layout: "full-image",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Hero Image" },
      { name: "imageUrl", type: "image-url", label: "Image URL", default: "" },
    ],
    seed: { title: "Hero Image", variant: "default" },
  },
  // ── EXTENDED ───────────────────────────────────────────────────
  {
    id: "cta-banner",
    category: "basic",
    label: "Call to Action",
    description: "Closing CTA with bold headline",
    layout: "title",
    slots: [
      { name: "title", type: "text", label: "Headline", required: true, default: "Let's get started" },
      { name: "subtitle", type: "text", label: "Sub-line", default: "Reach out · book a call · sign up" },
    ],
    seed: { title: "Let's get started", subtitle: "Reach out · book a call · sign up", variant: "bold" },
  },
  {
    id: "three-column",
    category: "structure",
    label: "Three Columns",
    description: "Trio of value props or features",
    layout: "two-column",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Three reasons" },
      { name: "body", type: "longtext", label: "Columns (one per line)", default: "Fast · Built for speed\nSecure · End-to-end encryption\nDelightful · Modern UI" },
    ],
    seed: { title: "Three reasons", body: "Fast · Built for speed\nSecure · End-to-end encryption\nDelightful · Modern UI", variant: "default" },
  },
  {
    id: "swot-grid",
    category: "structure",
    label: "SWOT 2×2",
    description: "Strengths · Weaknesses · Opportunities · Threats",
    layout: "comparison",
    slots: [
      { name: "title", type: "text", label: "Title", default: "SWOT Analysis" },
      { name: "body", type: "longtext", label: "Quadrants", default: "Strengths\nWeaknesses\nOpportunities\nThreats" },
    ],
    seed: { title: "SWOT Analysis", body: "Strengths\nWeaknesses\nOpportunities\nThreats", variant: "default" },
  },
  {
    id: "faq-list",
    category: "structure",
    label: "FAQ",
    description: "Question & answer list",
    layout: "content",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Frequently Asked Questions" },
      { name: "body", type: "longtext", label: "Q & A (one per line)", default: "Q: What is this?\nA: A new way to build decks.\nQ: How fast?\nA: Seconds, not hours." },
    ],
    seed: { title: "Frequently Asked Questions", body: "Q: What is this?\nA: A new way to build decks.\nQ: How fast?\nA: Seconds, not hours.", variant: "default" },
  },
  {
    id: "team-grid",
    category: "media",
    label: "Team Grid",
    description: "Photo grid for team or speakers",
    layout: "full-image",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Meet the team" },
    ],
    seed: { title: "Meet the team", variant: "default", images: [] },
  },
  // ── NEW: high-value slide types added for industry-standard editor ──
  {
    id: "big-quote-hero",
    category: "basic",
    label: "Big Quote",
    description: "Full-bleed oversized pull quote",
    layout: "quote",
    slots: [
      { name: "title", type: "longtext", label: "Quote", required: true, default: "“The best way to predict the future is to invent it.”" },
      { name: "quoteAuthor", type: "text", label: "Author", default: "Alan Kay" },
    ],
    seed: { title: "“The best way to predict the future is to invent it.”", quoteAuthor: "Alan Kay", variant: "bold", variation: "punch" },
  },
  {
    id: "closing-cta",
    category: "basic",
    label: "Closing CTA",
    description: "Final-slide call to action",
    layout: "section",
    slots: [
      { name: "title", type: "text", label: "Headline", required: true, default: "Thank you" },
      { name: "subtitle", type: "text", label: "Sub-line", default: "Questions? Reach out anytime." },
    ],
    seed: { title: "Thank you", subtitle: "Questions? Reach out anytime.", variant: "dark" },
  },
  {
    id: "qa-slide",
    category: "basic",
    label: "Q & A",
    description: "Big Q&A prompt slide",
    layout: "section",
    slots: [
      { name: "title", type: "text", label: "Headline", default: "Questions?" },
      { name: "subtitle", type: "text", label: "Sub-line", default: "We'd love to hear yours." },
    ],
    seed: { title: "Questions?", subtitle: "We'd love to hear yours.", variant: "gradient" },
  },
  {
    id: "mission-statement",
    category: "basic",
    label: "Mission",
    description: "Single-sentence mission slide",
    layout: "title",
    slots: [
      { name: "title", type: "longtext", label: "Mission", required: true, default: "We make great ideas happen." },
      { name: "subtitle", type: "text", label: "Eyebrow", default: "Our mission" },
    ],
    seed: { title: "We make great ideas happen.", subtitle: "Our mission", variant: "minimal", variation: "editorial" },
  },
  {
    id: "three-up-grid",
    category: "structure",
    label: "Three-Up Grid",
    description: "Three feature cards in a row",
    layout: "two-column",
    slots: [
      { name: "title", type: "text", label: "Title", default: "What you get" },
      { name: "body", type: "longtext", label: "Cards (one per line)", default: "Speed · Built for fast iteration\nClarity · Beautiful by default\nControl · Brand-perfect every time" },
    ],
    seed: { title: "What you get", body: "Speed · Built for fast iteration\nClarity · Beautiful by default\nControl · Brand-perfect every time", variant: "default" },
  },
  {
    id: "stairs-process",
    category: "structure",
    label: "Stair-Step Process",
    description: "Staircase-shaped process flow",
    layout: "process",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Our approach" },
      { name: "process", type: "process", label: "Steps", default: [
        { title: "Discover", description: "Understand needs" },
        { title: "Define", description: "Frame the problem" },
        { title: "Design", description: "Shape the solution" },
        { title: "Deliver", description: "Ship and learn" },
      ] },
    ],
    seed: {
      title: "Our approach",
      variant: "default",
      variation: "stairs",
      process: [
        { title: "Discover", description: "Understand needs" },
        { title: "Define", description: "Frame the problem" },
        { title: "Design", description: "Shape the solution" },
        { title: "Deliver", description: "Ship and learn" },
      ],
    },
  },
  {
    id: "ranked-stats",
    category: "data",
    label: "Ranked Stats",
    description: "Five ranked metric bars",
    layout: "stats",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Top performers" },
      { name: "stats", type: "stat-list", label: "Stats (5)", default: [
        { value: "1", label: "Acme Corp" },
        { value: "2", label: "Globex" },
        { value: "3", label: "Initech" },
        { value: "4", label: "Umbrella" },
        { value: "5", label: "Stark Inc" },
      ] },
    ],
    seed: {
      title: "Top performers",
      variant: "default",
      variation: "ranked",
      stats: [
        { value: "1", label: "Acme Corp" },
        { value: "2", label: "Globex" },
        { value: "3", label: "Initech" },
        { value: "4", label: "Umbrella" },
        { value: "5", label: "Stark Inc" },
      ],
    },
  },
  {
    id: "logo-wall",
    category: "media",
    label: "Logo Wall",
    description: "Customer / partner logo grid",
    layout: "full-image",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Trusted by teams worldwide" },
    ],
    seed: { title: "Trusted by teams worldwide", variant: "minimal", images: [] },
  },
  {
    id: "gallery-grid",
    category: "media",
    label: "Gallery Grid",
    description: "Multi-image gallery",
    layout: "full-image",
    slots: [
      { name: "title", type: "text", label: "Title", default: "Gallery" },
    ],
    seed: { title: "Gallery", variant: "default", images: [] },
  },
];

/**
 * Find a template by id.
 */
export function getSlideTemplate(id: string): SlideBlockTemplate | undefined {
  return SLIDE_BLOCK_TEMPLATES.find((t) => t.id === id);
}

/**
 * Validate user-supplied slot values against template schema.
 * Returns a sanitized values map + any missing required slot names.
 */
export function validateSlotValues(
  template: SlideBlockTemplate,
  values: Record<string, unknown> = {},
): { values: Record<string, unknown>; missing: string[] } {
  const out: Record<string, unknown> = {};
  const missing: string[] = [];
  for (const slot of template.slots) {
    const v = values[slot.name];
    if (v === undefined || v === null || v === "") {
      if (slot.required && (slot.default === undefined || slot.default === "")) {
        missing.push(slot.name);
      } else {
        out[slot.name] = slot.default;
      }
    } else {
      out[slot.name] = v;
    }
  }
  return { values: out, missing };
}

/**
 * Apply a template + slot values to produce a SlideData payload (no id).
 * Used by the Smart Layouts panel, drag/drop, and voice agent.
 */
export function applySlideTemplate(
  templateId: string,
  values: Record<string, unknown> = {},
): Omit<SlideData, "id"> | null {
  const template = getSlideTemplate(templateId);
  if (!template) return null;
  const { values: filled } = validateSlotValues(template, values);

  // Merge seed with slot-derived fields. Slots win.
  const payload: Omit<SlideData, "id"> = {
    layout: template.layout,
    variant: "default",
    title: "",
    ...template.seed,
    templateId: template.id,
    slotValues: filled,
  };

  // Apply slot values to standard SlideData fields.
  for (const slot of template.slots) {
    const v = filled[slot.name];
    if (v === undefined) continue;
    switch (slot.name) {
      case "title":
      case "subtitle":
      case "body":
      case "imageUrl":
      case "quoteAuthor":
        (payload as any)[slot.name] = String(v);
        break;
      case "stats":
        if (Array.isArray(v)) payload.stats = v as SlideData["stats"];
        break;
      case "statValue":
      case "statLabel": {
        const current = payload.stats?.[0] ?? { value: "", label: "" };
        const next = { ...current };
        if (slot.name === "statValue") next.value = String(v);
        else next.label = String(v);
        payload.stats = [next];
        break;
      }
      case "timeline":
        if (Array.isArray(v)) payload.timeline = v as SlideData["timeline"];
        break;
      case "process":
        if (Array.isArray(v)) payload.process = v as SlideData["process"];
        break;
    }
  }
  return payload;
}
