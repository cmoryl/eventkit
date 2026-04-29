/**
 * Convert a TemplatePreview DemoContent (the exact content rendered in the
 * preview dialog) into SlideData[] for the SlideEditor — so "Open in Editor"
 * loads the same slides the user just previewed, not a generic theme-matched
 * starter deck.
 *
 * Slide order mirrors `SLIDES` in TemplatePreviewDialog.tsx (17 slides).
 * Layouts are mapped to the closest equivalent supported by SlideRenderer.
 */
import type { DemoContent } from "./TemplateDemoCard";
import type { DeckTemplate } from "./TemplateGallery";
import {
  applyDemoTheme,
  resolveDemoThemeId,
  DECK_TEMPLATE_TO_DEMO_THEME,
  type SlideData,
} from "@/components/slides/slideTypes";

/** Convert DemoContent → unthemed SlideData[] (no id, no bgColor yet). */
function demoToRawSlides(d: DemoContent): Omit<SlideData, "id">[] {
  const slides: Omit<SlideData, "id">[] = [];

  // 1. Title
  slides.push({
    layout: "title",
    title: d.title,
    subtitle: d.subtitle,
    variant: "gradient",
  });

  // 2. Agenda
  slides.push({
    layout: "agenda",
    title: "Agenda",
    body: d.agenda
      .map((a) => (a.duration ? `${a.title} — ${a.duration}` : a.title))
      .join("\n"),
    variant: "default",
  });

  // 3. KPI hero — use big-number layout
  slides.push({
    layout: "big-number",
    title: d.kpi.headline,
    subtitle: d.kpi.bigLabel,
    variant: "brand",
    stats: [
      { value: d.kpi.big, label: d.kpi.bigLabel },
      ...d.kpi.supporting.slice(0, 4),
    ],
  });

  // 4. Section divider
  slides.push({
    layout: "section",
    title: d.eyebrow,
    subtitle: d.title,
    variant: "dark",
  });

  // 5. Cards (3-up content)
  slides.push({
    layout: "content",
    variation: "cards",
    title: "Highlights",
    body: d.cards
      .map((c) => `• ${c.title} — ${c.body}`)
      .join("\n"),
    variant: "default",
  });

  // 6. Bento — render as stats grid (closest equivalent)
  slides.push({
    layout: "stats",
    variation: "grid",
    title: "At a glance",
    variant: "brand",
    stats: d.bento.slice(0, 6).map((b) => ({
      value: b.metric || b.title,
      label: b.body || (b.metric ? b.title : ""),
    })),
  });

  // 7. Feature split — two-column with image
  slides.push({
    layout: "two-column",
    variation: "image-text",
    title: d.cards[0]?.title || "Why it matters",
    body: d.cards
      .slice(0, 4)
      .map((c) => `• ${c.title}\n  ${c.body}`)
      .join("\n"),
    variant: "default",
    imageUrl: d.imagery?.[0],
  });

  // 8. Metrics — stats row
  slides.push({
    layout: "stats",
    variation: "row",
    title: "Key metrics",
    variant: "brand",
    stats: d.metrics.slice(0, 4).map((m) => ({
      value: m.value,
      label: m.sublabel ? `${m.label} · ${m.sublabel}` : m.label,
    })),
  });

  // 9. Chart
  slides.push({
    layout: "chart",
    title: d.chart.title,
    variant: "default",
    chart: {
      type: "bar",
      title: d.chart.title,
      data: d.chart.series.map((s) => ({ label: s.label, value: s.value })),
    },
  });

  // 10. Process
  slides.push({
    layout: "process",
    title: "How it works",
    variant: "default",
    process: d.process.slice(0, 5).map((p) => ({
      title: p.title,
      description: p.duration ? `${p.body} · ${p.duration}` : p.body,
    })),
  });

  // 11. Timeline
  slides.push({
    layout: "timeline",
    title: "Roadmap",
    variant: "default",
    timeline: d.timeline.map((t) => ({
      date: t.when,
      title: t.title,
      description: t.body,
    })),
  });

  // 12. Compare
  slides.push({
    layout: "comparison",
    title: d.compare.heading,
    body: `${d.compare.before.title}\n${d.compare.before.points
      .map((p) => `• ${p}`)
      .join("\n")}\n---\n${d.compare.after.title}\n${d.compare.after.points
      .map((p) => `• ${p}`)
      .join("\n")}`,
    variant: "default",
  });

  // 13. Team
  slides.push({
    layout: "content",
    variation: "cards",
    title: "Meet the team",
    body: d.team
      .slice(0, 6)
      .map((m) => `• ${m.name} — ${m.role}${m.location ? ` (${m.location})` : ""}`)
      .join("\n"),
    variant: "default",
  });

  // 14. Pricing
  slides.push({
    layout: "comparison",
    title: "Pricing",
    body: d.pricing
      .slice(0, 3)
      .map(
        (t) =>
          `${t.name} — ${t.price} ${t.cadence}\n${t.features
            .slice(0, 4)
            .map((f) => `• ${f}`)
            .join("\n")}`,
      )
      .join("\n---\n"),
    variant: "minimal",
  });

  // 15. Gallery — full-image hero
  if (d.imagery && d.imagery.length) {
    slides.push({
      layout: "full-image",
      title: d.eyebrow,
      subtitle: d.title,
      imageUrl: d.imagery[0],
      images: d.imagery,
      variant: "dark",
    });
  }

  // 16. Stat
  slides.push({
    layout: "big-number",
    title: d.stat.label,
    variant: "brand",
    stats: [{ value: d.stat.value, label: d.stat.label }],
  });

  // 17. Quote
  slides.push({
    layout: "quote",
    title: `"${d.quote.text}"`,
    quoteAuthor: d.quote.by,
    variant: "dark",
  });

  return slides;
}

/**
 * Build SlideData[] for the editor that mirrors the template's preview deck.
 * Themes the slides using the matching demo theme (TransPerfect orbs, Modern
 * Dark mesh, Editorial Light grain, etc.) so look-and-feel matches the preview.
 */
export function demoContentToSlides(
  template: DeckTemplate,
  demo: DemoContent,
): SlideData[] {
  const themeId =
    DECK_TEMPLATE_TO_DEMO_THEME[template.id] ||
    resolveDemoThemeId(template.id, template.palette);
  const raw = demoToRawSlides(demo);
  const themed = applyDemoTheme(raw, themeId);
  return themed.map((s) => ({ ...s, id: crypto.randomUUID() } as SlideData));
}
