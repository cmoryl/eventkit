// Smart Objects — partial-slide patches users drop onto an existing slide.
// Two delivery modes:
//   • "snap"   — merge into typed slide fields (stats[], body lines, accent)
//   • "float"  — push a new entry (or several) into textBoxes[] at the drop
//                position (% of slide). Used for free-floating layers.
//
// Drag MIME: application/x-eventkit-object  payload: { id, mode, x, y }
// SlideEditor's canvas drop handler reads it and calls applySmartObject().
//
// Hold Alt while dragging from the panel to force "float" mode. Otherwise the
// object uses its declared `defaultMode`.

import type { SlideData } from "./slideTypes";
import { v4 as uuidv4 } from "uuid";

export const SLIDE_OBJECT_MIME = "application/x-eventkit-object";

export type SmartObjectCategory = "stat" | "text" | "shape" | "media" | "chart";
export type SmartObjectMode = "snap" | "float";

export interface SmartObjectTemplate {
  id: string;
  category: SmartObjectCategory;
  label: string;
  description: string;
  /** Object behaviour preference when dropped with no modifier. */
  defaultMode: SmartObjectMode;
  /** Modes the object accepts — used to gate Alt-key float override. */
  supports: SmartObjectMode[];
}

export const SMART_OBJECTS: SmartObjectTemplate[] = [
  // ── STAT ───────────────────────────────────────────────────────
  {
    id: "stat-kpi",
    category: "stat",
    label: "KPI Tile",
    description: "Single stat with label",
    defaultMode: "snap",
    supports: ["snap", "float"],
  },
  {
    id: "stat-trio",
    category: "stat",
    label: "Stat Trio",
    description: "Three side-by-side metrics",
    defaultMode: "snap",
    supports: ["snap"],
  },
  {
    id: "stat-big-number",
    category: "stat",
    label: "Big Number",
    description: "Oversized hero figure",
    defaultMode: "float",
    supports: ["float", "snap"],
  },

  // ── TEXT ───────────────────────────────────────────────────────
  {
    id: "text-callout",
    category: "text",
    label: "Callout",
    description: "Highlighted text block",
    defaultMode: "float",
    supports: ["float"],
  },
  {
    id: "text-pull-quote",
    category: "text",
    label: "Pull Quote",
    description: "Large quote with attribution",
    defaultMode: "float",
    supports: ["float", "snap"],
  },
  {
    id: "text-caption",
    category: "text",
    label: "Caption",
    description: "Small annotation text",
    defaultMode: "float",
    supports: ["float"],
  },
  {
    id: "text-cta-button",
    category: "text",
    label: "CTA Button",
    description: "Pill button with label",
    defaultMode: "float",
    supports: ["float"],
  },
  {
    id: "text-kicker",
    category: "text",
    label: "Kicker Label",
    description: "Tracked uppercase eyebrow",
    defaultMode: "float",
    supports: ["float"],
  },

  // ── SHAPE ──────────────────────────────────────────────────────
  {
    id: "shape-divider",
    category: "shape",
    label: "Divider",
    description: "Horizontal accent line",
    defaultMode: "float",
    supports: ["float"],
  },
  {
    id: "shape-badge",
    category: "shape",
    label: "Badge Pill",
    description: "Filled pill label",
    defaultMode: "float",
    supports: ["float"],
  },

  // ── CHART ──────────────────────────────────────────────────────
  {
    id: "chart-bar",
    category: "chart",
    label: "Bar Chart",
    description: "4-bar mini chart",
    defaultMode: "snap",
    supports: ["snap"],
  },

  // ── MEDIA ──────────────────────────────────────────────────────
  {
    id: "media-image-frame",
    category: "media",
    label: "Image Frame",
    description: "Placeholder for an image",
    defaultMode: "snap",
    supports: ["snap", "float"],
  },

  // ── INDUSTRY-STANDARD ADDITIONS (free-floating atoms) ─────────
  { id: "atom-progress-bar", category: "shape", label: "Progress Bar", description: "Horizontal % bar", defaultMode: "float", supports: ["float"] },
  { id: "atom-sparkline",    category: "chart", label: "Sparkline",    description: "Tiny inline trend",  defaultMode: "float", supports: ["float"] },
  { id: "atom-tag-list",     category: "text",  label: "Tag List",     description: "Row of pill tags",   defaultMode: "float", supports: ["float"] },
  { id: "atom-avatar-group", category: "media", label: "Avatar Group", description: "Stacked avatars",    defaultMode: "float", supports: ["float"] },
  { id: "atom-icon-text",    category: "text",  label: "Icon + Text",  description: "Bullet with icon",   defaultMode: "float", supports: ["float"] },
  { id: "atom-ticker",       category: "text",  label: "News Ticker",  description: "Pill with marquee text", defaultMode: "float", supports: ["float"] },
  { id: "atom-arrow",        category: "shape", label: "Arrow",        description: "Directional accent", defaultMode: "float", supports: ["float"] },
  { id: "atom-social",       category: "text",  label: "Social Handle",description: "@handle pill",       defaultMode: "float", supports: ["float"] },
  { id: "atom-timestamp",    category: "text",  label: "Timestamp",    description: "Date · time row",    defaultMode: "float", supports: ["float"] },
  { id: "atom-badge-stack",  category: "shape", label: "Badge Stack",  description: "Vertical badge column", defaultMode: "float", supports: ["float"] },
];

export function getSmartObject(id: string): SmartObjectTemplate | undefined {
  return SMART_OBJECTS.find((o) => o.id === id);
}

interface ApplyOpts {
  /** Position in % of slide (0-100). Used by float mode. */
  x?: number;
  y?: number;
  /** Forced mode — overrides the template's defaultMode. */
  mode?: SmartObjectMode;
}

/** Build a single textBox entry. */
function tb(partial: Partial<NonNullable<SlideData["textBoxes"]>[number]> & {
  text: string;
  xPct: number;
  yPct: number;
  wPct: number;
  fontSize: number;
  color: string;
}): NonNullable<SlideData["textBoxes"]>[number] {
  return {
    id: uuidv4(),
    align: "center",
    weight: 600,
    ...partial,
  };
}

/** Apply a smart object to a slide. Pure — returns the next slide. */
export function applySmartObject(
  templateId: string,
  slide: SlideData,
  opts: ApplyOpts = {},
): SlideData {
  const tpl = getSmartObject(templateId);
  if (!tpl) return slide;

  const requested = opts.mode ?? tpl.defaultMode;
  const mode: SmartObjectMode = tpl.supports.includes(requested)
    ? requested
    : tpl.defaultMode;

  const x = clampPct(opts.x ?? 50);
  const y = clampPct(opts.y ?? 50);

  switch (templateId) {
    // ── stat snap = push into stats[] ; float = textBox group ──
    case "stat-kpi": {
      if (mode === "snap") {
        const next = [...(slide.stats ?? []), { value: "00", label: "New metric" }];
        return { ...slide, stats: next };
      }
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "00", xPct: x, yPct: y - 4, wPct: 22, fontSize: 96, color: "#ffffff", weight: 800 }),
        tb({ text: "New metric", xPct: x, yPct: y + 8, wPct: 22, fontSize: 22, color: "#aab2c8", weight: 500 }),
      ];
      return { ...slide, textBoxes };
    }
    case "stat-trio": {
      const next = [
        { value: "00", label: "Metric A" },
        { value: "00", label: "Metric B" },
        { value: "00", label: "Metric C" },
      ];
      return { ...slide, stats: next, layout: slide.layout === "stats" ? slide.layout : slide.layout };
    }
    case "stat-big-number": {
      if (mode === "float") {
        const textBoxes = [...(slide.textBoxes ?? []),
          tb({ text: "99%", xPct: x, yPct: y, wPct: 40, fontSize: 220, color: "#ffffff", weight: 800 }),
          tb({ text: "Customer satisfaction", xPct: x, yPct: y + 16, wPct: 40, fontSize: 28, color: "#aab2c8", weight: 500 }),
        ];
        return { ...slide, textBoxes };
      }
      return { ...slide, stats: [{ value: "99%", label: "Customer satisfaction" }] };
    }

    // ── text always floats ──
    case "text-callout": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "Important takeaway", xPct: x, yPct: y, wPct: 36, fontSize: 32, color: "#ffffff", bg: "rgba(99, 102, 241, 0.9)", weight: 700 }),
      ];
      return { ...slide, textBoxes };
    }
    case "text-pull-quote": {
      if (mode === "snap") {
        return { ...slide, layout: "quote", title: "An inspiring quote that frames the next chapter.", quoteAuthor: "Author Name" };
      }
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "“An inspiring quote that frames the next chapter.”", xPct: x, yPct: y, wPct: 50, fontSize: 44, color: "#ffffff", weight: 600, italic: true, align: "left" }),
        tb({ text: "— Author Name", xPct: x, yPct: y + 12, wPct: 50, fontSize: 20, color: "#aab2c8", weight: 500, align: "left" }),
      ];
      return { ...slide, textBoxes };
    }
    case "text-caption": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "Caption text", xPct: x, yPct: y, wPct: 28, fontSize: 18, color: "#aab2c8", weight: 400, italic: true }),
      ];
      return { ...slide, textBoxes };
    }
    case "text-cta-button": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "Get started →", xPct: x, yPct: y, wPct: 18, fontSize: 22, color: "#0a0a0a", bg: "#ffd24a", weight: 700 }),
      ];
      return { ...slide, textBoxes };
    }
    case "text-kicker": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "CHAPTER 01", xPct: x, yPct: y, wPct: 24, fontSize: 18, color: "#aab2c8", weight: 700, align: "left" }),
      ];
      return { ...slide, textBoxes };
    }

    // ── shapes — emulated with styled textBoxes ──
    case "shape-divider": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: " ", xPct: x, yPct: y, wPct: 40, fontSize: 4, color: "transparent", bg: "#ffffff", align: "center" }),
      ];
      return { ...slide, textBoxes };
    }
    case "shape-badge": {
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "NEW", xPct: x, yPct: y, wPct: 10, fontSize: 18, color: "#0a0a0a", bg: "#a7f3d0", weight: 700 }),
      ];
      return { ...slide, textBoxes };
    }

    // ── chart snap = set slide.chart ──
    case "chart-bar": {
      return {
        ...slide,
        chart: {
          type: "bar",
          title: slide.chart?.title ?? "Quick chart",
          data: [
            { label: "Q1", value: 24 },
            { label: "Q2", value: 38 },
            { label: "Q3", value: 52 },
            { label: "Q4", value: 71 },
          ],
        },
      };
    }

    // ── media snap = clear imageUrl placeholder hint ──
    case "media-image-frame": {
      if (mode === "snap") {
        return { ...slide, imageUrl: slide.imageUrl || "" , needsImage: true };
      }
      const textBoxes = [...(slide.textBoxes ?? []),
        tb({ text: "🖼  Drop image here", xPct: x, yPct: y, wPct: 30, fontSize: 22, color: "#aab2c8", bg: "rgba(255,255,255,0.05)", weight: 500 }),
      ];
      return { ...slide, textBoxes };
    }
  }
  return slide;
}

function clampPct(v: number): number {
  if (Number.isNaN(v)) return 50;
  return Math.max(2, Math.min(98, v));
}
