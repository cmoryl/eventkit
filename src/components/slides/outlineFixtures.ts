import type { DeckOutline, SlideOutline } from "@/components/powerpoint/DeckPreview";

/**
 * Example DeckOutline covering every layout the outline-to-slide mapper supports.
 * Used by the "Load examples" dev button on /slides for quick visual verification.
 *
 * Order mirrors SlideOutline["layout"]:
 *   title → section → bullets → two_column → stat → quote → closing
 *
 * Each fixture exercises:
 *   - The "happy path" (all expected fields present)
 *   - A sparse variant where the AI omits structured data, so the mapper's
 *     fallbacks (e.g. two_column without leftColumn/rightColumn) get rendered.
 */

const baseMeta = {
  title: "Outline Layout Showcase",
  subtitle: "Every layout, two ways: structured + sparse",
  palette: {
    primary: "#6366f1",
    secondary: "#a78bfa",
    accent: "#22d3ee",
    background: "#0b0b1a",
    text: "#f8fafc",
  },
  fonts: { heading: "Inter", body: "Inter" },
} satisfies Omit<DeckOutline, "slides">;

const slides: SlideOutline[] = [
  // ── TITLE ──────────────────────────────────────────────────────
  {
    layout: "title",
    title: "Outline Layout Showcase",
    subtitle: "A guided tour of every supported slide layout",
    notes: "Opening slide — sets expectations for what follows.",
  },
  {
    layout: "title",
    title: "Sparse Title (no subtitle)",
    bullets: ["Tagline promoted from the first bullet"],
  },

  // ── SECTION ────────────────────────────────────────────────────
  {
    layout: "section",
    title: "Section · Structured",
    subtitle: "Divider between major chapters",
  },
  {
    layout: "section",
    title: "Section · Sparse",
    bullets: ["Subtitle promoted from this bullet"],
  },

  // ── BULLETS ────────────────────────────────────────────────────
  {
    layout: "bullets",
    title: "Why Outline-First Works",
    subtitle: "Three reasons users trust the flow",
    bullets: [
      "You see the structure before any pixels are painted",
      "Edits are cheap at the outline stage",
      "The AI never argues with content you already approved",
    ],
  },
  {
    layout: "bullets",
    title: "Bullets · Sparse (placeholder)",
    // No bullets supplied → mapper falls back to placeholder text
  },

  // ── TWO COLUMN ─────────────────────────────────────────────────
  {
    layout: "two_column",
    title: "Before vs After",
    leftColumn: {
      heading: "Before",
      bullets: [
        "Manual slide assembly",
        "Hours of formatting",
        "Inconsistent branding",
      ],
    },
    rightColumn: {
      heading: "After",
      bullets: [
        "Outline approved in minutes",
        "Auto-applied brand theme",
        "Editable, exportable, on-brand",
      ],
    },
  },
  {
    layout: "two_column",
    title: "Two Column · Bullets-only fallback",
    bullets: [
      "Left point one",
      "Left point two",
      "Right point one",
      "Right point two",
    ],
  },

  // ── STAT ───────────────────────────────────────────────────────
  {
    layout: "stat",
    title: "Time saved per deck",
    stat: { value: "92%", label: "less time spent on formatting" },
  },
  {
    layout: "stat",
    title: "Stat · Sparse (no stat object)",
    subtitle: "Mapper supplies a graceful default",
  },

  // ── QUOTE ──────────────────────────────────────────────────────
  {
    layout: "quote",
    title: "Structured quote",
    quote: {
      text: "Design is intelligence made visible.",
      attribution: "Alina Wheeler",
    },
  },
  {
    layout: "quote",
    title: "“Already-quoted text from the AI”",
    subtitle: "Subtitle attribution fallback",
    // attribution missing → mapper uses subtitle, smart quotes get normalized
  },

  // ── CLOSING ────────────────────────────────────────────────────
  {
    layout: "closing",
    title: "Thank You",
    subtitle: "Questions? hello@example.com",
  },
  {
    layout: "closing",
    // No title → mapper defaults to "Thank You"
    bullets: ["Subtitle promoted from this bullet"],
  },
];

export const EXAMPLE_OUTLINE: DeckOutline = {
  ...baseMeta,
  slides,
};
