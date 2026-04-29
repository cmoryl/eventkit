// Shared converter: rich AI deck outline → editor SlideData[], with demo-theme styling.
import type { DeckOutline, SlideOutline } from "@/components/powerpoint/DeckPreview";
import type { SlideData, SlideLayout } from "@/components/slides/slideTypes";
import { applyDemoTheme, resolveDemoThemeId } from "@/components/slides/slideTypes";
import { v4 as uuidv4 } from "uuid";

/** Map every rich outline layout → an editor SlideLayout the renderer understands. */
const LAYOUT_MAP: Record<string, SlideLayout> = {
  title: "title",
  section: "section",
  bullets: "content",
  two_column: "two-column",
  stat: "big-number",
  quote: "quote",
  closing: "section",
  kpi_grid: "stats",
  agenda: "agenda",
  timeline: "timeline",
  comparison: "comparison",
  metrics: "stats",
  team: "content",
  image_hero: "full-image",
  chart: "chart",
  process: "process",
};

const VARIATION_MAP: Partial<Record<string, string>> = {
  title: "centered",
  bullets: "bullets",
  two_column: "equal",
  stat: "centered",
  quote: "centered",
};

/**
 * Convert a single AI outline slide to an editor SlideData (sans theme styling).
 * Theming (bgColor / variant / bgEffect) is applied separately by `applyDemoTheme`.
 */
function convertOne(s: SlideOutline & {
  // rich fields tacked on by generate-deck — typed loosely so we can read them
  kpis?: Array<{ value: string; label: string; sublabel?: string }>;
  agenda?: Array<{ step: string; title: string; body?: string; duration?: string }>;
  timeline?: Array<{ when: string; title: string; body?: string }>;
  comparison?: { heading?: string; before: { title: string; points: string[] }; after: { title: string; points: string[] } };
  metrics?: Array<{ value: string; label: string; sublabel?: string }>;
  team?: Array<{ name: string; role: string; initials: string; focus?: string }>;
  process?: Array<{ step: string; title: string; body?: string }>;
  chart?: { type: "bar" | "line" | "pie" | "doughnut"; title?: string; data: Array<{ label: string; value: number }> };
}): SlideData {
  const mappedLayout: SlideLayout = LAYOUT_MAP[s.layout] || "content";
  const base: SlideData = {
    id: uuidv4(),
    layout: mappedLayout,
    title: s.title || "",
    subtitle: s.subtitle,
    notes: s.notes,
    variant: "default",
    variation: VARIATION_MAP[s.layout],
  };

  switch (s.layout as string) {
    case "title":
    case "section":
    case "closing": {
      if (!base.subtitle && s.bullets?.length) base.subtitle = s.bullets[0];
      if (s.layout === "closing" && !base.title) base.title = "Thank You";
      break;
    }
    case "bullets": {
      const bullets = s.bullets?.length ? s.bullets : ["Add your first point here"];
      base.body = bullets.map((b) => `• ${b}`).join("\n");
      break;
    }
    case "two_column": {
      if (s.leftColumn || s.rightColumn) {
        const left = s.leftColumn
          ? [s.leftColumn.heading, ...(s.leftColumn.bullets || []).map((b) => `• ${b}`)].filter(Boolean).join("\n")
          : "";
        const right = s.rightColumn
          ? [s.rightColumn.heading, ...(s.rightColumn.bullets || []).map((b) => `• ${b}`)].filter(Boolean).join("\n")
          : "";
        base.body = `${left}\n---\n${right}`;
      } else if (s.bullets?.length) {
        const mid = Math.ceil(s.bullets.length / 2);
        base.body = `${s.bullets.slice(0, mid).map((b) => `• ${b}`).join("\n")}\n---\n${s.bullets.slice(mid).map((b) => `• ${b}`).join("\n")}`;
      }
      break;
    }
    case "stat": {
      if (s.stat) {
        base.stats = [{ value: s.stat.value, label: s.stat.label }];
      }
      break;
    }
    case "quote": {
      const rawText = (s.quote?.text || s.title || "").trim();
      const stripped = rawText.replace(/^["“”'']+|["“”'']+$/g, "").trim();
      base.title = `"${stripped}"`;
      base.quoteAuthor = (s.quote?.attribution ?? "").trim() || undefined;
      base.subtitle = undefined;
      break;
    }
    case "kpi_grid":
    case "metrics": {
      const items = s.kpis || s.metrics || [];
      if (items.length) {
        base.stats = items.map((k) => ({ value: k.value, label: k.sublabel ? `${k.label} — ${k.sublabel}` : k.label }));
      } else if (s.bullets?.length) {
        base.stats = s.bullets.slice(0, 6).map((b) => ({ value: "•", label: b }));
      }
      // 4-up KPI rows render with the BrandHub graduated tile style.
      if (base.stats && base.stats.length >= 3 && base.stats.length <= 4) {
        base.variation = "brandhub-tiles";
      }
      break;
    }
    case "agenda": {
      const items = s.agenda || [];
      if (items.length) {
        base.body = items.map((a) => `${a.step}. ${a.title}${a.duration ? ` — ${a.duration}` : ""}`).join("\n");
      } else if (s.bullets?.length) {
        base.body = s.bullets.map((b, i) => `${i + 1}. ${b}`).join("\n");
      }
      break;
    }
    case "timeline": {
      const items = s.timeline || [];
      if (items.length) {
        base.timeline = items.map((t) => ({ date: t.when, title: t.title, description: t.body }));
      }
      break;
    }
    case "comparison": {
      const c = s.comparison;
      if (c) {
        const left = [c.before.title, ...(c.before.points || []).map((p) => `• ${p}`)].filter(Boolean).join("\n");
        const right = [c.after.title, ...(c.after.points || []).map((p) => `• ${p}`)].filter(Boolean).join("\n");
        base.body = `${left}\n---\n${right}`;
      } else if (s.leftColumn || s.rightColumn) {
        const left = s.leftColumn ? [s.leftColumn.heading, ...(s.leftColumn.bullets || []).map((b) => `• ${b}`)].filter(Boolean).join("\n") : "";
        const right = s.rightColumn ? [s.rightColumn.heading, ...(s.rightColumn.bullets || []).map((b) => `• ${b}`)].filter(Boolean).join("\n") : "";
        base.body = `${left}\n---\n${right}`;
      }
      break;
    }
    case "process": {
      const items = s.process || [];
      if (items.length) {
        base.process = items.map((p) => ({ title: p.title, description: p.body }));
      } else if (s.bullets?.length) {
        base.process = s.bullets.map((b) => ({ title: b }));
      }
      break;
    }
    case "team": {
      const items = s.team || [];
      if (items.length) {
        base.body = items.map((m) => `• ${m.name} — ${m.role}${m.focus ? ` (${m.focus})` : ""}`).join("\n");
      }
      break;
    }
    case "image_hero": {
      // No image yet — leave as full-image with title overlay; user can add image after.
      break;
    }
    case "chart": {
      if (s.chart) {
        base.chart = { type: s.chart.type, title: s.chart.title, data: s.chart.data };
      }
      break;
    }
  }

  return base;
}

/**
 * Convert a full DeckOutline → editor slides, theming with the matching demo theme so
 * AI-generated decks look identical to the gallery demo (TransPerfect orbs, etc.).
 */
export function outlineToThemedSlides(
  outline: DeckOutline,
  opts: { templateId?: string } = {},
): SlideData[] {
  const themeId = resolveDemoThemeId(opts.templateId, outline.palette ? { bg: `#${outline.palette.background}` } : undefined);
  const converted = outline.slides.map(convertOne);
  // applyDemoTheme returns Omit<SlideData,'id'>[] — re-attach ids
  const themed = applyDemoTheme(
    converted.map(({ id: _id, ...rest }) => rest),
    themeId,
  );
  return themed.map((s, i) => ({ ...s, id: converted[i].id } as SlideData));
}
