// PowerPoint Deck Generator - AI plans outline, pptxgenjs builds .pptx
// Rich-layout edition: kpi_grid, agenda, timeline, comparison, metrics, team, image_hero, chart, process
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import { requireUser } from "../_shared/auth.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

interface BrandStyle {
  primary?: string;
  secondary?: string;
  accent?: string;
  headingFont?: string;
  bodyFont?: string;
}

interface ExtractedSource {
  summary?: string;
  outline?: { heading: string; bullets: string[] }[];
  keyFacts?: string[];
  quotes?: { text: string; attribution?: string }[];
  lookAndFeel?: {
    palette?: string[];
    headingFont?: string;
    bodyFont?: string;
    mood?: string;
    description?: string;
  };
  imageDescriptions?: string[];
  influence?: number;
  scope?: { text?: boolean; imagery?: boolean; lookAndFeel?: boolean };
  fileName?: string;
  selectedImages?: { page: number; dataUrl: string }[];
}

/**
 * The client passes the selected template's full metadata so the AI plans a deck
 * that mirrors the preview's structure (KPI grids, agenda, timeline, comparison, etc.)
 * and the renderer locks palette/fonts to it.
 */
interface TemplateContext {
  id: string;
  name: string;
  description?: string;
  themePrompt?: string;
  palette: { bg: string; text: string; accent: string; secondary: string };
  fonts?: { heading?: string; body?: string };
}

interface DeckRequest {
  topic: string;
  audience?: string;
  slideCount: number;
  tone?: string;
  brand?: BrandStyle;
  themeOverride?: string;
  templateId?: string;
  template?: TemplateContext;
  source?: ExtractedSource;
  prebuiltOutline?: DeckOutline;
  planOnly?: boolean;
}

interface SlideChartSpec {
  type: "bar" | "line" | "pie" | "donut" | "area" | "scatter";
  title?: string;
  data: Array<{ label: string; value: number }>;
  notes?: string;
}

interface SlideReferenceImage {
  url: string;
  caption?: string;
  treatment?: "style-match" | "as-is" | "inspiration";
}

type SlideLayout =
  | "title"
  | "section"
  | "bullets"
  | "two_column"
  | "stat"
  | "quote"
  | "closing"
  // ---- new rich layouts ----
  | "kpi_grid"        // 3-4 KPI tiles with big numbers + sub-label
  | "agenda"          // numbered agenda with owner/duration
  | "timeline"        // horizontal milestones
  | "comparison"      // before/after, us/them
  | "metrics"         // 4-6 small metric tiles in a grid
  | "team"            // team grid with avatars (initials)
  | "image_hero"      // full-bleed image w/ headline overlay
  | "chart"           // dedicated data chart slide
  | "process";        // numbered process / steps

interface SlideOutline {
  layout: SlideLayout;
  title: string;
  subtitle?: string;
  bullets?: string[];
  leftColumn?: { heading: string; bullets: string[] };
  rightColumn?: { heading: string; bullets: string[] };
  stat?: { value: string; label: string };
  quote?: { text: string; attribution?: string };
  notes?: string;
  designNotes?: string;
  visualIntent?: "auto" | "photo" | "infographic" | "chart" | "icon-grid" | "screenshot" | "none";
  chart?: SlideChartSpec;
  references?: SlideReferenceImage[];

  // ---- rich layout fields ----
  kpis?: Array<{ value: string; label: string; sublabel?: string; trend?: string }>;
  agenda?: Array<{ step: string; title: string; body?: string; duration?: string; owner?: string }>;
  timeline?: Array<{ when: string; title: string; body?: string; deliverables?: string[] }>;
  comparison?: { heading?: string; before: { title: string; points: string[] }; after: { title: string; points: string[] } };
  metrics?: Array<{ value: string; label: string; sublabel?: string }>;
  team?: Array<{ name: string; role: string; initials: string; location?: string; focus?: string }>;
  process?: Array<{ step: string; title: string; body?: string }>;
}

interface DeckOutline {
  title: string;
  subtitle: string;
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  fonts: { heading: string; body: string };
  slides: SlideOutline[];
}

const ALL_LAYOUTS: SlideLayout[] = [
  "title", "section", "bullets", "two_column", "stat", "quote", "closing",
  "kpi_grid", "agenda", "timeline", "comparison", "metrics", "team", "image_hero", "chart", "process",
];

const SYSTEM = `You are a senior presentation designer at a top brand studio. Output a structured deck outline that mirrors the visual richness of award-winning industry decks.

NARRATIVE & LAYOUT RULES
- Slide 1 must be "title". Slide 2 should usually be "agenda".
- Final slide must be "closing".
- Use a wide variety of layouts. Aim for at least 6 of these in any deck of 8+ slides:
  agenda, kpi_grid, metrics, timeline, comparison, process, chart, team, image_hero, quote, section, two_column, bullets, stat
- Never use the same layout 3 times in a row. Avoid using "bullets" more than ~25% of the time.
- Insert "section" dividers every 4-6 slides to break up the deck.
- Always include speaker notes (1-3 sentences per slide) in the 'notes' field — this is REQUIRED, never omit it.

CONTENT FIDELITY (MOST IMPORTANT)
- When the user provides source material, an outline, or pre-structured slides, PRESERVE EVERY bullet, stat, percentage, dollar amount, and heading they wrote — do not summarize, paraphrase, condense, drop, or merge items.
- If a slide has 8 bullets in the source, return all 8 bullets — never trim to "fit" a layout.
- If the user wrote "Cost ↓ 20–40%, CSAT ↑ 10–25%, AHT ↓ 15–30%, FCR ↑ 15–25%, 3–5x scalability" that is FIVE distinct kpis/metrics — return all five.
- Headings inside a slide ("Business Impact", "Quantified Outcomes", "RESULTING GAP") must be preserved as section subheadings, two_column headings, or KPI sub-labels — never discarded.
- For exploratory or topic-only requests (no source content), keep bullets concise: aim for 3-5 bullets at ~12 words each, but go longer if the topic demands it.

OTHER QUALITY RULES
- KPIs and stats should feel real (numbers + units + sublabels), not "00%".
- Agenda items must have a step number, a short title, and ideally a duration.
- Timelines: 4-6 milestones, each with a date/quarter and a deliverable line.
- Comparisons: 3-6 contrast points per side, parallel phrasing.
- Process: 3-5 steps with verbs as titles.
- Team: 3-6 plausible roles with initials and 1-line focus.
- For "chart" slides, return a chart spec with 4-7 data points using REAL numbers from the source if present.

Match the requested template's palette, fonts, and visual mood. The renderer will style every slide using the deck palette + fonts you return.`;

function buildTemplateBlock(tpl?: TemplateContext): string {
  if (!tpl) return "";
  const f = tpl.fonts || {};
  return `\n=== ACTIVE TEMPLATE ===
Template: ${tpl.name}${tpl.description ? ` — ${tpl.description}` : ""}
Locked palette (use these exact hex values, no #):
  background ${tpl.palette.bg}
  text       ${tpl.palette.text}
  accent     ${tpl.palette.accent}
  secondary  ${tpl.palette.secondary}
${f.heading || f.body ? `Locked fonts: heading "${f.heading || "Inter"}", body "${f.body || "Inter"}"` : ""}
${tpl.themePrompt ? `Mood / visual direction: ${tpl.themePrompt}` : ""}
Plan a deck that fully exploits this template's visual system (rich layouts, varied slide types, KPI tiles, agendas, timelines, comparisons, charts).
=== END TEMPLATE ===\n`;
}

/**
 * Detect when the user pasted pre-structured slide content.
 * Accepts a wide range of variants: "Slide 1:", "**Slide 1**", "## Slide 1 —",
 * "Slide 1.", "Slide 1 -", with optional markdown bold/heading prefixes.
 */
function detectPrestructuredSlides(topic: string): { count: number; blocks: string[] } | null {
  if (!topic) return null;
  // Strip leading markdown markers (#, *, -, >) so "## **Slide 1:**" still matches.
  const re = /^[\s>#*\-_]*\**\s*Slide\s+(\d+)\s*\**\s*[:\-–.)]/gim;
  const matches: { idx: number; num: number }[] = [];
  let m: RegExpExecArray | null;
  while ((m = re.exec(topic)) !== null) {
    matches.push({ idx: m.index, num: parseInt(m[1], 10) });
  }
  if (matches.length < 2) return null;
  const blocks: string[] = [];
  for (let i = 0; i < matches.length; i++) {
    const start = matches[i].idx;
    const end = i + 1 < matches.length ? matches[i + 1].idx : topic.length;
    blocks.push(topic.slice(start, end).trim());
  }
  return { count: matches.length, blocks };
}

async function planDeck(req: DeckRequest, apiKey: string): Promise<DeckOutline> {
  const src = req.source;
  const tplBlock = buildTemplateBlock(req.template);
  const prestructured = detectPrestructuredSlides(req.topic);
  if (prestructured) {
    // Force slide count to match what the user actually wrote.
    req = { ...req, slideCount: prestructured.count };
  }
  const verbatimBlock = prestructured
    ? `\n\n=== PRE-STRUCTURED USER CONTENT (${prestructured.count} slides) ===
The user has authored every slide explicitly below. You MUST:
- Produce EXACTLY ${prestructured.count} slides — one per "Slide N:" block, in order.
- Preserve ALL bullets, sub-bullets, stats, headings, and quoted text VERBATIM (do not summarize, condense, rewrite, or drop lines).
- Map each slide's content into the most appropriate rich layout (comparison for before/after, kpi_grid/metrics for numeric outcomes, bullets/two_column for narrative, quote for speaker-style narrative).
- Lift section headings inside a slide (e.g. "Business Impact", "Quantified Outcomes") into a two_column or sub-section, never discard them.
- The 5-bullet / 12-word style cap DOES NOT APPLY here — fidelity to the user's content is the priority.
- For "Speaker Notes" / narrative slides, put the prose into the slide's notes AND show key takeaways as bullets/quote on the slide.

User-authored slides:
${prestructured.blocks.map((b) => `---\n${b}`).join("\n")}
=== END PRE-STRUCTURED USER CONTENT ===\n`
    : "";
  const sourceBlock = src
    ? `\n\n=== SOURCE DOCUMENT ${src.fileName ? `(${src.fileName})` : ""} ===
Influence: ${src.influence ?? 70}/100
Scope: ${[src.scope?.text && "text", src.scope?.imagery && "imagery", src.scope?.lookAndFeel && "look-and-feel"].filter(Boolean).join(", ") || "all"}
Summary: ${src.summary || "(none)"}
${src.outline?.length ? `Outline:\n${src.outline.map((o) => `• ${o.heading}\n${o.bullets.map((b) => `   - ${b}`).join("\n")}`).join("\n")}` : ""}
${src.keyFacts?.length ? `Key facts:\n${src.keyFacts.map((f) => `- ${f}`).join("\n")}` : ""}
${src.quotes?.length ? `Quotes:\n${src.quotes.map((q) => `"${q.text}"${q.attribution ? ` — ${q.attribution}` : ""}`).join("\n")}` : ""}
=== END SOURCE ===

Use the source as the primary content backbone. Faithfully preserve facts and quotes.`
    : "";

  const userPrompt = `Create a ${req.slideCount}-slide deck.

${prestructured ? "" : `Topic: ${req.topic}`}
${req.audience ? `Audience: ${req.audience}` : ""}
${req.tone ? `Tone: ${req.tone}` : ""}
${req.themeOverride ? `Theme override: ${req.themeOverride}` : ""}
${req.brand ? `Brand colors: primary ${req.brand.primary}, secondary ${req.brand.secondary}, accent ${req.brand.accent}. Brand fonts: ${req.brand.headingFont || "default"} / ${req.brand.bodyFont || "default"}.` : ""}
${tplBlock}
${verbatimBlock}
${sourceBlock}

Return HEX colors WITHOUT the # prefix. Use the locked template palette/fonts above when provided.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      // Pro model handles long, faithful content reproduction far better than flash.
      // Flash silently summarizes when input/output is large.
      model: prestructured ? "google/gemini-2.5-pro" : "google/gemini-3-flash-preview",
      // Generous token budget so the model never has to truncate user content to fit.
      max_tokens: 16000,
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: src?.selectedImages?.length
            ? [
                { type: "text", text: userPrompt + `\n\nThe user attached ${src.selectedImages.length} reference page image(s). Match their imagery, color tone, layout style, and information hierarchy.` },
                ...src.selectedImages.map((img) => ({
                  type: "image_url" as const,
                  image_url: { url: img.dataUrl },
                })),
              ]
            : userPrompt,
        },
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "build_deck",
            description: "Return a complete deck outline with rich, varied layouts.",
            parameters: {
              type: "object",
              properties: {
                title: { type: "string" },
                subtitle: { type: "string" },
                palette: {
                  type: "object",
                  properties: {
                    primary: { type: "string", description: "6-char hex without #" },
                    secondary: { type: "string" },
                    accent: { type: "string" },
                    background: { type: "string" },
                    text: { type: "string" },
                  },
                  required: ["primary", "secondary", "accent", "background", "text"],
                },
                fonts: {
                  type: "object",
                  properties: { heading: { type: "string" }, body: { type: "string" } },
                  required: ["heading", "body"],
                },
                slides: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: {
                      layout: { type: "string", enum: ALL_LAYOUTS },
                      title: { type: "string" },
                      subtitle: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                      leftColumn: { type: "object", properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } },
                      rightColumn: { type: "object", properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } } },
                      stat: { type: "object", properties: { value: { type: "string" }, label: { type: "string" } } },
                      quote: { type: "object", properties: { text: { type: "string" }, attribution: { type: "string" } } },
                      notes: { type: "string" },
                      designNotes: { type: "string" },
                      visualIntent: { type: "string", enum: ["auto", "photo", "infographic", "chart", "icon-grid", "screenshot", "none"] },
                      kpis: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            value: { type: "string" }, label: { type: "string" },
                            sublabel: { type: "string" }, trend: { type: "string" },
                          },
                          required: ["value", "label"],
                        },
                      },
                      agenda: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            step: { type: "string" }, title: { type: "string" }, body: { type: "string" },
                            duration: { type: "string" }, owner: { type: "string" },
                          },
                          required: ["step", "title"],
                        },
                      },
                      timeline: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            when: { type: "string" }, title: { type: "string" }, body: { type: "string" },
                            deliverables: { type: "array", items: { type: "string" } },
                          },
                          required: ["when", "title"],
                        },
                      },
                      comparison: {
                        type: "object",
                        properties: {
                          heading: { type: "string" },
                          before: { type: "object", properties: { title: { type: "string" }, points: { type: "array", items: { type: "string" } } } },
                          after:  { type: "object", properties: { title: { type: "string" }, points: { type: "array", items: { type: "string" } } } },
                        },
                      },
                      metrics: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: { value: { type: "string" }, label: { type: "string" }, sublabel: { type: "string" } },
                          required: ["value", "label"],
                        },
                      },
                      team: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: {
                            name: { type: "string" }, role: { type: "string" }, initials: { type: "string" },
                            location: { type: "string" }, focus: { type: "string" },
                          },
                          required: ["name", "role", "initials"],
                        },
                      },
                      process: {
                        type: "array",
                        items: {
                          type: "object",
                          properties: { step: { type: "string" }, title: { type: "string" }, body: { type: "string" } },
                          required: ["step", "title"],
                        },
                      },
                      chart: {
                        type: "object",
                        properties: {
                          type: { type: "string", enum: ["bar", "line", "pie", "donut", "area", "scatter"] },
                          title: { type: "string" },
                          data: {
                            type: "array",
                            items: {
                              type: "object",
                              properties: { label: { type: "string" }, value: { type: "number" } },
                              required: ["label", "value"],
                            },
                          },
                        },
                      },
                    },
                    required: ["layout", "title"],
                  },
                },
              },
              required: ["title", "subtitle", "palette", "fonts", "slides"],
            },
          },
        },
      ],
      tool_choice: { type: "function", function: { name: "build_deck" } },
    }),
  });

  if (!response.ok) {
    if (response.status === 429) throw new Error("RATE_LIMIT");
    if (response.status === 402) throw new Error("PAYMENT_REQUIRED");
    throw new Error(`AI gateway error ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  const args = data.choices?.[0]?.message?.tool_calls?.[0]?.function?.arguments;
  if (!args) throw new Error("No outline returned by AI");
  const outline = JSON.parse(args) as DeckOutline;

  // Lock palette/fonts to template if provided (AI sometimes drifts)
  if (req.template) {
    const tp = req.template.palette;
    const stripHash = (c: string) => (c || "").replace("#", "");
    outline.palette = {
      primary: stripHash(tp.accent),
      secondary: stripHash(tp.secondary),
      accent: stripHash(tp.accent),
      background: stripHash(tp.bg),
      text: stripHash(tp.text),
    };
    if (req.template.fonts) {
      outline.fonts = {
        heading: req.template.fonts.heading || outline.fonts?.heading || "Inter",
        body: req.template.fonts.body || outline.fonts?.body || "Inter",
      };
    }
  }
  return outline;
}

// ----- Template background imagery -----
const TEMPLATE_IMAGES: Record<string, Record<string, string>> = {
  "transperfect-2026": {
    hero: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/hero.jpg",
    heroSquare: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/hero-square.jpg",
    sectionBg: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/section-bg.jpg",
    lightPattern: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/light-pattern.jpg",
    card: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/card.jpg",
    caseStudy: "https://fkrxorswdcuaiyiesooj.supabase.co/storage/v1/object/public/asset-images/templates/transperfect-2026/case-study.jpg",
  },
};

async function fetchAsDataUrl(url: string): Promise<string | null> {
  try {
    const r = await fetch(url);
    if (!r.ok) return null;
    const buf = await r.arrayBuffer();
    const bytes = new Uint8Array(buf);
    const mime =
      bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
        ? "image/png"
        : bytes[0] === 0xff && bytes[1] === 0xd8
        ? "image/jpeg"
        : r.headers.get("content-type")?.split(";")[0] || "image/png";
    let bin = "";
    for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
    return `data:${mime};base64,${btoa(bin)}`;
  } catch {
    return null;
  }
}

async function loadTemplateImages(templateId?: string): Promise<Record<string, string>> {
  if (!templateId) return {};
  const map = TEMPLATE_IMAGES[templateId];
  if (!map) return {};
  const entries = await Promise.all(
    Object.entries(map).map(async ([k, url]) => [k, await fetchAsDataUrl(url)] as const),
  );
  const out: Record<string, string> = {};
  for (const [k, v] of entries) if (v) out[k] = v;
  return out;
}

async function resolveSlideImages(outline: DeckOutline, apiKey: string): Promise<Array<string | undefined>> {
  const palette = outline.palette;
  const moodDesc = `Brand palette: primary #${palette.primary}, accent #${palette.accent}. Cohesive, on-brand, premium editorial style.`;

  return Promise.all(
    outline.slides.map(async (s) => {
      try {
        const userRef = s.references?.[0]?.url;
        if (userRef) {
          const data = await fetchAsDataUrl(userRef);
          if (data) return data;
        }

        const intent = s.visualIntent || "auto";
        if (intent === "none" || intent === "chart") return undefined;
        const layoutWantsImage =
          s.layout === "bullets" ||
          s.layout === "stat" ||
          s.layout === "section" ||
          s.layout === "title" ||
          s.layout === "closing" ||
          s.layout === "two_column" ||
          s.layout === "image_hero";
        if (!layoutWantsImage) return undefined;

        const styleHint =
          intent === "photo" ? "photorealistic editorial photograph, natural light, no text"
          : intent === "infographic" ? "minimal flat infographic illustration, geometric shapes, no text"
          : intent === "icon-grid" ? "set of minimal line icons in a clean grid, no text"
          : intent === "screenshot" ? "abstract product UI screenshot, soft glassmorphism, no readable text"
          : "clean abstract editorial illustration, no text, no logos";

        const prompt = `${styleHint}. Subject: "${s.title}". ${s.designNotes ? `Context: ${s.designNotes}.` : ""} ${moodDesc} ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO LOGOS in the image.`;

        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });
        if (!r.ok) return undefined;
        const j = await r.json();
        return j?.choices?.[0]?.message?.images?.[0]?.image_url?.url as string | undefined;
      } catch {
        return undefined;
      }
    }),
  );
}

// ============================================================================
// PPTX BUILDER
// ============================================================================
function buildPptx(outline: DeckOutline, templateImages: Record<string, string> = {}, slideImages: Array<string | undefined> = []): Promise<ArrayBuffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE";
  pptx.title = outline.title;
  pptx.author = "EventKIT PowerPoint Agent";

  const W = 13.33;
  const H = 7.5;
  const PAD = 0.6;
  const p = outline.palette;
  const headFont = outline.fonts.heading || "Inter";
  const bodyFont = outline.fonts.body || "Inter";
  const clean = (c: string) => (c || "").replace("#", "").toUpperCase();

  const PRIMARY = clean(p.primary);
  const SECONDARY = clean(p.secondary);
  const ACCENT = clean(p.accent);
  const BG = clean(p.background);
  const TEXT = clean(p.text);

  // Decide if background is dark, so we know what color to use for text on it
  const isDarkBg = (() => {
    try {
      const r = parseInt(BG.slice(0, 2), 16);
      const g = parseInt(BG.slice(2, 4), 16);
      const b = parseInt(BG.slice(4, 6), 16);
      return (r * 299 + g * 587 + b * 114) / 1000 < 128;
    } catch { return true; }
  })();
  const ON_BG = isDarkBg ? "FFFFFF" : "111111";
  const MUTED = isDarkBg ? "B8C0CC" : "5A6271";
  const SURFACE = isDarkBg ? "1A1F2E" : "F4F2EE"; // card surface

  const bgFor = (layout: string): string | undefined => {
    if (!templateImages || Object.keys(templateImages).length === 0) return undefined;
    switch (layout) {
      case "title":
      case "closing":
      case "image_hero": return templateImages.hero;
      case "section": return templateImages.sectionBg;
      case "quote": return templateImages.heroSquare || templateImages.hero;
      case "stat": return templateImages.card;
      default: return undefined;
    }
  };

  const paintBackground = (slide: any, image?: string, color?: string) => {
    slide.background = { color: color || BG };
    if (image) {
      slide.addImage({ data: image, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", x: 0, y: 0, w: W, h: H } });
    }
  };

  const addEyebrow = (slide: any, text: string, x: number, y: number, w: number, color = ACCENT) => {
    slide.addText(text.toUpperCase(), {
      x, y, w, h: 0.3,
      fontSize: 10, bold: true, color, fontFace: bodyFont, charSpacing: 2,
    });
  };

  const ph = {
    title: "Untitled slide",
    subtitle: "Add a subtitle to introduce this section",
    bullet: ["Headline point", "Supporting detail", "Outcome or proof point", "Action or takeaway"],
  };
  const orPh = (v: string | undefined | null, fb: string) => (v && v.trim().length > 0 ? v : fb);
  const orPhBullets = (arr: string[] | undefined, count = 4) => {
    const list = (arr || []).filter((b) => b && b.trim().length > 0);
    return list.length >= 1 ? list : ph.bullet.slice(0, count);
  };

  outline.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    const tplBg = bgFor(s.layout);
    paintBackground(slide, tplBg);
    if (s.notes) slide.addNotes(s.notes);
    const slideImg = slideImages[idx];
    const slideTitle = orPh(s.title, ph.title);

    // Footer (skip on title/closing/image_hero)
    if (idx > 0 && !["title", "closing", "image_hero", "section"].includes(s.layout)) {
      slide.addText(`${idx + 1} / ${outline.slides.length}`, {
        x: W - 1.2, y: H - 0.4, w: 0.8, h: 0.3,
        fontSize: 9, color: MUTED, fontFace: bodyFont, align: "right",
      });
      slide.addText(outline.title || "Presentation", {
        x: PAD, y: H - 0.4, w: W - 2, h: 0.3,
        fontSize: 9, color: MUTED, fontFace: bodyFont,
      });
    }

    switch (s.layout) {
      // ────────────────────────── TITLE ──────────────────────────
      case "title": {
        if (!tplBg) paintBackground(slide, undefined, PRIMARY);
        // Big accent block + corner mark
        slide.addShape("rect", { x: 0, y: H - 1.4, w: 0.4, h: 1.4, fill: { color: ACCENT } });
        slide.addShape("rect", { x: PAD, y: PAD, w: 0.6, h: 0.06, fill: { color: ACCENT } });
        slide.addText((outline.subtitle || "PRESENTATION").toUpperCase(), {
          x: PAD, y: PAD + 0.15, w: W - PAD * 2, h: 0.4,
          fontSize: 12, bold: true, color: "FFFFFF", fontFace: bodyFont, charSpacing: 4,
        });
        slide.addText(slideTitle, {
          x: PAD, y: H / 2 - 1.6, w: W - PAD * 2, h: 2.4,
          fontSize: 64, bold: true, color: "FFFFFF", fontFace: headFont,
        });
        slide.addText(orPh(s.subtitle, "A presentation by EventKIT"), {
          x: PAD, y: H / 2 + 1.0, w: W - PAD * 2, h: 0.6,
          fontSize: 22, color: "FFFFFF", fontFace: bodyFont, transparency: 25,
        });
        break;
      }

      // ────────────────────────── SECTION ──────────────────────────
      case "section": {
        if (!tplBg) paintBackground(slide, undefined, SECONDARY);
        slide.addText(`0${idx + 1}`.slice(-2), {
          x: PAD, y: PAD, w: 3, h: 1.4, fontSize: 88, bold: true, color: ACCENT, fontFace: headFont,
        });
        slide.addShape("rect", { x: PAD, y: H / 2 - 0.05, w: 1.2, h: 0.06, fill: { color: ACCENT } });
        slide.addText(slideTitle, {
          x: PAD, y: H / 2 + 0.1, w: W - PAD * 2, h: 1.6,
          fontSize: 52, bold: true, color: "FFFFFF", fontFace: headFont,
        });
        slide.addText(orPh(s.subtitle, "Section overview"), {
          x: PAD, y: H / 2 + 1.7, w: W - PAD * 2, h: 0.6,
          fontSize: 18, color: "FFFFFF", fontFace: bodyFont, transparency: 25,
        });
        break;
      }

      // ────────────────────────── KPI GRID ──────────────────────────
      case "kpi_grid": {
        addEyebrow(slide, orPh(s.subtitle, "Key results"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const kpis = (s.kpis && s.kpis.length ? s.kpis : [
          { value: "+42%", label: "Growth", sublabel: "vs last quarter" },
          { value: "12k", label: "Active users", sublabel: "monthly" },
          { value: "4.8★", label: "CSAT", sublabel: "n=1,200" },
          { value: "$2.4M", label: "ARR", sublabel: "trailing 12mo" },
        ]).slice(0, 4);

        const n = kpis.length;
        const gap = 0.25;
        const tileW = (W - PAD * 2 - gap * (n - 1)) / n;
        const tileY = 2.0;
        const tileH = H - tileY - PAD - 0.4;

        kpis.forEach((k, i) => {
          const x = PAD + i * (tileW + gap);
          slide.addShape("roundRect", {
            x, y: tileY, w: tileW, h: tileH,
            fill: { color: SURFACE }, line: { color: ACCENT, width: 0, type: "solid" },
            rectRadius: 0.15,
          });
          slide.addShape("rect", { x: x + 0.3, y: tileY + 0.3, w: 0.5, h: 0.06, fill: { color: ACCENT } });
          slide.addText(k.value || "—", {
            x: x + 0.25, y: tileY + 0.7, w: tileW - 0.5, h: 1.6,
            fontSize: 56, bold: true, color: ON_BG, fontFace: headFont,
          });
          slide.addText(k.label || "Metric", {
            x: x + 0.25, y: tileY + 2.4, w: tileW - 0.5, h: 0.4,
            fontSize: 14, bold: true, color: ON_BG, fontFace: bodyFont,
          });
          if (k.sublabel) {
            slide.addText(k.sublabel, {
              x: x + 0.25, y: tileY + 2.85, w: tileW - 0.5, h: 0.4,
              fontSize: 11, color: MUTED, fontFace: bodyFont,
            });
          }
          if (k.trend) {
            slide.addText(k.trend, {
              x: x + 0.25, y: tileY + tileH - 0.5, w: tileW - 0.5, h: 0.35,
              fontSize: 10, bold: true, color: ACCENT, fontFace: bodyFont,
            });
          }
        });
        break;
      }

      // ────────────────────────── METRICS GRID (smaller, 6-up) ──────────────────────────
      case "metrics": {
        addEyebrow(slide, orPh(s.subtitle, "By the numbers"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const metrics = (s.metrics && s.metrics.length ? s.metrics : [
          { value: "98%", label: "Uptime" },
          { value: "320ms", label: "P95 latency" },
          { value: "4.8★", label: "Reviews" },
          { value: "+38%", label: "Adoption" },
          { value: "12k", label: "Users" },
          { value: "0", label: "Critical bugs" },
        ]).slice(0, 6);

        const cols = 3, rows = Math.ceil(metrics.length / cols);
        const gap = 0.2;
        const gridY = 2.0;
        const gridH = H - gridY - PAD - 0.4;
        const tileW = (W - PAD * 2 - gap * (cols - 1)) / cols;
        const tileH = (gridH - gap * (rows - 1)) / rows;

        metrics.forEach((m, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x = PAD + c * (tileW + gap);
          const y = gridY + r * (tileH + gap);
          slide.addShape("roundRect", {
            x, y, w: tileW, h: tileH,
            fill: { color: SURFACE }, line: { type: "none" }, rectRadius: 0.12,
          });
          slide.addText(m.value, {
            x: x + 0.2, y: y + 0.25, w: tileW - 0.4, h: tileH * 0.55,
            fontSize: 38, bold: true, color: ACCENT, fontFace: headFont,
          });
          slide.addText(m.label, {
            x: x + 0.2, y: y + tileH * 0.65, w: tileW - 0.4, h: 0.4,
            fontSize: 13, bold: true, color: ON_BG, fontFace: bodyFont,
          });
          if (m.sublabel) {
            slide.addText(m.sublabel, {
              x: x + 0.2, y: y + tileH * 0.85, w: tileW - 0.4, h: 0.3,
              fontSize: 10, color: MUTED, fontFace: bodyFont,
            });
          }
        });
        break;
      }

      // ────────────────────────── AGENDA ──────────────────────────
      case "agenda": {
        addEyebrow(slide, "Agenda", PAD, PAD, W - PAD * 2);
        slide.addText(orPh(s.title, "What we'll cover"), {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 32, bold: true, color: ON_BG, fontFace: headFont,
        });

        const items = (s.agenda && s.agenda.length ? s.agenda : [
          { step: "01", title: "Context & opportunity", duration: "10 min" },
          { step: "02", title: "Strategy & approach", duration: "15 min" },
          { step: "03", title: "Roadmap & milestones", duration: "20 min" },
          { step: "04", title: "Investment & next steps", duration: "10 min" },
        ]).slice(0, 6);

        const startY = 2.0;
        const rowH = (H - startY - PAD - 0.4) / Math.max(items.length, 1);
        items.forEach((it, i) => {
          const y = startY + i * rowH;
          slide.addText(it.step || `0${i + 1}`.slice(-2), {
            x: PAD, y, w: 1.0, h: rowH, fontSize: 36, bold: true, color: ACCENT, fontFace: headFont, valign: "middle",
          });
          slide.addText(it.title, {
            x: PAD + 1.1, y, w: W - PAD * 2 - 3, h: rowH * 0.5,
            fontSize: 18, bold: true, color: ON_BG, fontFace: headFont, valign: "middle",
          });
          if (it.body) {
            slide.addText(it.body, {
              x: PAD + 1.1, y: y + rowH * 0.5, w: W - PAD * 2 - 3, h: rowH * 0.5,
              fontSize: 12, color: MUTED, fontFace: bodyFont,
            });
          }
          if (it.duration || it.owner) {
            slide.addText([it.duration, it.owner].filter(Boolean).join(" · "), {
              x: W - PAD - 1.8, y, w: 1.8, h: rowH,
              fontSize: 11, color: MUTED, fontFace: bodyFont, align: "right", valign: "middle",
            });
          }
          // separator line
          if (i < items.length - 1) {
            slide.addShape("line", {
              x: PAD, y: y + rowH - 0.02, w: W - PAD * 2, h: 0,
              line: { color: MUTED, width: 0.5, transparency: 70 },
            });
          }
        });
        break;
      }

      // ────────────────────────── TIMELINE ──────────────────────────
      case "timeline": {
        addEyebrow(slide, orPh(s.subtitle, "Roadmap"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const items = (s.timeline && s.timeline.length ? s.timeline : [
          { when: "Q1", title: "Discovery", body: "Research & insights", deliverables: ["Findings", "Persona"] },
          { when: "Q2", title: "Design", body: "Concept & validate", deliverables: ["Wireframes"] },
          { when: "Q3", title: "Build", body: "Engineering sprint", deliverables: ["MVP launch"] },
          { when: "Q4", title: "Scale", body: "Rollout & optimize", deliverables: ["GA release"] },
        ]).slice(0, 5);

        const trackY = 3.6;
        slide.addShape("line", {
          x: PAD + 0.4, y: trackY, w: W - PAD * 2 - 0.8, h: 0,
          line: { color: ACCENT, width: 2, transparency: 30 },
        });

        const n = items.length;
        const colW = (W - PAD * 2) / n;
        items.forEach((it, i) => {
          const cx = PAD + colW * i + colW / 2;
          // node
          slide.addShape("ellipse", {
            x: cx - 0.18, y: trackY - 0.18, w: 0.36, h: 0.36,
            fill: { color: ACCENT }, line: { color: BG, width: 2 },
          });
          // when (above)
          slide.addText(it.when, {
            x: cx - colW / 2 + 0.1, y: trackY - 1.0, w: colW - 0.2, h: 0.4,
            fontSize: 14, bold: true, color: ACCENT, fontFace: headFont, align: "center",
          });
          slide.addText(it.title, {
            x: cx - colW / 2 + 0.1, y: trackY - 0.6, w: colW - 0.2, h: 0.45,
            fontSize: 16, bold: true, color: ON_BG, fontFace: headFont, align: "center",
          });
          // body (below)
          if (it.body) {
            slide.addText(it.body, {
              x: cx - colW / 2 + 0.1, y: trackY + 0.4, w: colW - 0.2, h: 0.5,
              fontSize: 12, color: MUTED, fontFace: bodyFont, align: "center",
            });
          }
          if (it.deliverables?.length) {
            slide.addText(it.deliverables.slice(0, 3).map((d) => `• ${d}`).join("\n"), {
              x: cx - colW / 2 + 0.1, y: trackY + 1.0, w: colW - 0.2, h: 1.4,
              fontSize: 11, color: ON_BG, fontFace: bodyFont, align: "center",
            });
          }
        });
        break;
      }

      // ────────────────────────── COMPARISON ──────────────────────────
      case "comparison": {
        addEyebrow(slide, orPh(s.comparison?.heading || s.subtitle, "Comparison"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const cmp = s.comparison || {
          heading: "Before vs After",
          before: { title: "Current state", points: ["Manual", "Slow", "Error-prone"] },
          after: { title: "With our solution", points: ["Automated", "Fast", "Reliable"] },
        };
        const colY = 2.0;
        const colH = H - colY - PAD - 0.4;
        const colW = (W - PAD * 3) / 2;

        const renderColumn = (x: number, side: { title: string; points: string[] }, accent: string, isAfter: boolean) => {
          slide.addShape("roundRect", {
            x, y: colY, w: colW, h: colH,
            fill: { color: SURFACE }, line: { color: accent, width: isAfter ? 2 : 0, type: "solid" },
            rectRadius: 0.15,
          });
          slide.addShape("rect", { x: x + 0.4, y: colY + 0.4, w: 0.5, h: 0.06, fill: { color: accent } });
          slide.addText(side.title, {
            x: x + 0.4, y: colY + 0.6, w: colW - 0.8, h: 0.5,
            fontSize: 22, bold: true, color: ON_BG, fontFace: headFont,
          });
          const pts = (side.points || []).slice(0, 5);
          slide.addText(
            pts.map((pt) => ({ text: pt, options: { bullet: { code: isAfter ? "25CF" : "2014" }, paraSpaceAfter: 8 } })),
            {
              x: x + 0.4, y: colY + 1.4, w: colW - 0.8, h: colH - 1.6,
              fontSize: 16, color: ON_BG, fontFace: bodyFont, valign: "top",
            },
          );
        };
        renderColumn(PAD, cmp.before, MUTED, false);
        renderColumn(PAD * 2 + colW, cmp.after, ACCENT, true);

        // VS divider
        slide.addShape("ellipse", {
          x: W / 2 - 0.35, y: colY + colH / 2 - 0.35, w: 0.7, h: 0.7,
          fill: { color: ACCENT }, line: { type: "none" },
        });
        slide.addText("VS", {
          x: W / 2 - 0.35, y: colY + colH / 2 - 0.35, w: 0.7, h: 0.7,
          fontSize: 14, bold: true, color: BG, fontFace: headFont, align: "center", valign: "middle",
        });
        break;
      }

      // ────────────────────────── PROCESS ──────────────────────────
      case "process": {
        addEyebrow(slide, orPh(s.subtitle, "Our process"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const steps = (s.process && s.process.length ? s.process : [
          { step: "01", title: "Discover", body: "Understand the problem" },
          { step: "02", title: "Design", body: "Explore solutions" },
          { step: "03", title: "Build", body: "Ship fast, learn faster" },
          { step: "04", title: "Scale", body: "Grow with confidence" },
        ]).slice(0, 5);

        const n = steps.length;
        const gap = 0.2;
        const tileW = (W - PAD * 2 - gap * (n - 1)) / n;
        const tileY = 2.4;
        const tileH = H - tileY - PAD - 0.4;
        steps.forEach((st, i) => {
          const x = PAD + i * (tileW + gap);
          slide.addShape("roundRect", {
            x, y: tileY, w: tileW, h: tileH,
            fill: { color: SURFACE }, line: { type: "none" }, rectRadius: 0.15,
          });
          slide.addShape("ellipse", {
            x: x + tileW / 2 - 0.4, y: tileY - 0.4, w: 0.8, h: 0.8,
            fill: { color: ACCENT }, line: { type: "none" },
          });
          slide.addText(st.step || `0${i + 1}`.slice(-2), {
            x: x + tileW / 2 - 0.4, y: tileY - 0.4, w: 0.8, h: 0.8,
            fontSize: 18, bold: true, color: BG, fontFace: headFont, align: "center", valign: "middle",
          });
          slide.addText(st.title, {
            x: x + 0.25, y: tileY + 0.7, w: tileW - 0.5, h: 0.6,
            fontSize: 18, bold: true, color: ON_BG, fontFace: headFont, align: "center",
          });
          if (st.body) {
            slide.addText(st.body, {
              x: x + 0.25, y: tileY + 1.4, w: tileW - 0.5, h: tileH - 1.6,
              fontSize: 13, color: MUTED, fontFace: bodyFont, align: "center", valign: "top",
            });
          }
          // arrow between
          if (i < n - 1) {
            slide.addShape("rightTriangle", {
              x: x + tileW + gap / 2 - 0.08, y: tileY + tileH / 2 - 0.1, w: 0.16, h: 0.2,
              fill: { color: ACCENT }, line: { type: "none" }, rotate: 90,
            });
          }
        });
        break;
      }

      // ────────────────────────── TEAM ──────────────────────────
      case "team": {
        addEyebrow(slide, orPh(s.subtitle, "The team"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const members = (s.team && s.team.length ? s.team : [
          { name: "Alex Rivera", role: "Lead Designer", initials: "AR", focus: "Brand systems" },
          { name: "Sam Patel", role: "Head of Eng", initials: "SP", focus: "Platform" },
          { name: "Jordan Kim", role: "PM", initials: "JK", focus: "Roadmap" },
          { name: "Taylor Reed", role: "Strategy", initials: "TR", focus: "Insights" },
        ]).slice(0, 6);

        const cols = members.length <= 3 ? members.length : Math.min(4, members.length);
        const rows = Math.ceil(members.length / cols);
        const gap = 0.3;
        const gridY = 2.0;
        const gridH = H - gridY - PAD - 0.4;
        const tileW = (W - PAD * 2 - gap * (cols - 1)) / cols;
        const tileH = (gridH - gap * (rows - 1)) / rows;

        members.forEach((m, i) => {
          const c = i % cols, r = Math.floor(i / cols);
          const x = PAD + c * (tileW + gap);
          const y = gridY + r * (tileH + gap);
          slide.addShape("roundRect", {
            x, y, w: tileW, h: tileH, fill: { color: SURFACE }, line: { type: "none" }, rectRadius: 0.15,
          });
          // Avatar circle
          const avatarSize = Math.min(1.4, tileH * 0.45);
          slide.addShape("ellipse", {
            x: x + tileW / 2 - avatarSize / 2, y: y + 0.35, w: avatarSize, h: avatarSize,
            fill: { color: ACCENT }, line: { type: "none" },
          });
          slide.addText(m.initials, {
            x: x + tileW / 2 - avatarSize / 2, y: y + 0.35, w: avatarSize, h: avatarSize,
            fontSize: avatarSize > 1.2 ? 24 : 18, bold: true, color: BG, fontFace: headFont,
            align: "center", valign: "middle",
          });
          slide.addText(m.name, {
            x: x + 0.2, y: y + 0.4 + avatarSize, w: tileW - 0.4, h: 0.4,
            fontSize: 14, bold: true, color: ON_BG, fontFace: headFont, align: "center",
          });
          slide.addText(m.role, {
            x: x + 0.2, y: y + 0.8 + avatarSize, w: tileW - 0.4, h: 0.35,
            fontSize: 11, color: ACCENT, fontFace: bodyFont, align: "center",
          });
          if (m.focus) {
            slide.addText(m.focus, {
              x: x + 0.2, y: y + 1.15 + avatarSize, w: tileW - 0.4, h: 0.5,
              fontSize: 10, color: MUTED, fontFace: bodyFont, align: "center",
            });
          }
        });
        break;
      }

      // ────────────────────────── IMAGE HERO ──────────────────────────
      case "image_hero": {
        if (slideImg) {
          slide.addImage({ data: slideImg, x: 0, y: 0, w: W, h: H, sizing: { type: "cover", w: W, h: H } });
        } else if (!tplBg) {
          paintBackground(slide, undefined, PRIMARY);
        }
        // Dark overlay band at bottom for legibility
        slide.addShape("rect", { x: 0, y: H - 3.2, w: W, h: 3.2, fill: { color: "000000", transparency: 40 } });
        slide.addShape("rect", { x: PAD, y: H - 2.8, w: 0.6, h: 0.06, fill: { color: ACCENT } });
        addEyebrow(slide, orPh(s.subtitle, "Spotlight"), PAD, H - 2.6, W - PAD * 2, "FFFFFF");
        slide.addText(slideTitle, {
          x: PAD, y: H - 2.2, w: W - PAD * 2, h: 1.2,
          fontSize: 44, bold: true, color: "FFFFFF", fontFace: headFont,
        });
        if (s.bullets?.length) {
          slide.addText(orPhBullets(s.bullets, 2).slice(0, 2).join(" · "), {
            x: PAD, y: H - 1.0, w: W - PAD * 2, h: 0.5,
            fontSize: 16, color: "FFFFFF", fontFace: bodyFont, transparency: 15,
          });
        }
        break;
      }

      // ────────────────────────── CHART ──────────────────────────
      case "chart": {
        addEyebrow(slide, orPh(s.subtitle, "Data"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });

        const c = s.chart || {
          type: "bar" as const,
          title: "",
          data: [
            { label: "Q1", value: 24 }, { label: "Q2", value: 38 },
            { label: "Q3", value: 52 }, { label: "Q4", value: 68 },
          ],
        };
        const data = c.data && c.data.length ? c.data : [{ label: "—", value: 1 }];

        const chartType = (() => {
          switch (c.type) {
            case "line": return pptx.ChartType.line;
            case "pie": return pptx.ChartType.pie;
            case "donut": return pptx.ChartType.doughnut;
            case "area": return pptx.ChartType.area;
            case "scatter": return pptx.ChartType.scatter;
            default: return pptx.ChartType.bar;
          }
        })();

        const chartData = [{
          name: c.title || s.title,
          labels: data.map((d) => d.label),
          values: data.map((d) => d.value),
        }];

        slide.addChart(chartType, chartData as any, {
          x: PAD, y: 2.0, w: W - PAD * 2, h: H - 2.0 - PAD - 0.4,
          chartColors: [ACCENT, SECONDARY, PRIMARY, MUTED],
          showLegend: false, showTitle: false,
          catAxisLabelColor: ON_BG, catAxisLabelFontFace: bodyFont, catAxisLabelFontSize: 11,
          valAxisLabelColor: ON_BG, valAxisLabelFontFace: bodyFont, valAxisLabelFontSize: 11,
          dataLabelColor: ON_BG, dataLabelFontFace: bodyFont, dataLabelFontSize: 11,
          plotArea: { fill: { color: SURFACE } },
        });
        break;
      }

      // ────────────────────────── STAT ──────────────────────────
      case "stat": {
        slide.addShape("rect", { x: 0, y: 0, w: 0.15, h: H, fill: { color: ACCENT } });
        const statImgW = slideImg ? 4.0 : 0;
        const statContentW = W - PAD * 2 - statImgW - (slideImg ? PAD : 0);
        addEyebrow(slide, orPh(s.subtitle, "Headline metric"), PAD, PAD, statContentW);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: statContentW, h: 0.7,
          fontSize: 24, bold: true, color: ON_BG, fontFace: headFont,
        });
        slide.addText(orPh(s.stat?.value, "+72%"), {
          x: PAD, y: H / 2 - 1.6, w: statContentW, h: 2.6,
          fontSize: 150, bold: true, color: ACCENT, fontFace: headFont, align: "center",
        });
        slide.addText(orPh(s.stat?.label, "improvement after launch"), {
          x: PAD, y: H / 2 + 1.5, w: statContentW, h: 0.6,
          fontSize: 20, color: ON_BG, fontFace: bodyFont, align: "center", transparency: 20,
        });
        if (slideImg) {
          slide.addImage({
            data: slideImg, x: W - PAD - statImgW, y: PAD + 0.3, w: statImgW, h: H - PAD * 2 - 0.6,
            sizing: { type: "cover", w: statImgW, h: H - PAD * 2 - 0.6 },
          });
        }
        break;
      }

      // ────────────────────────── QUOTE ──────────────────────────
      case "quote": {
        if (!tplBg) paintBackground(slide, undefined, PRIMARY);
        slide.addText("\u201C", {
          x: PAD, y: PAD - 0.3, w: 2.5, h: 2.5, fontSize: 220, color: ACCENT, fontFace: headFont, bold: true,
        });
        slide.addText(orPh(s.quote?.text, orPh(s.title, "An anchoring quote.")), {
          x: PAD + 1.4, y: H / 2 - 1.6, w: W - PAD * 2 - 1.4, h: 2.8,
          fontSize: 30, italic: true, color: "FFFFFF", fontFace: headFont,
        });
        slide.addShape("rect", { x: PAD + 1.4, y: H / 2 + 1.5, w: 0.4, h: 0.04, fill: { color: ACCENT } });
        slide.addText(orPh(s.quote?.attribution, "Speaker · Title"), {
          x: PAD + 1.9, y: H / 2 + 1.4, w: W - PAD * 2 - 1.9, h: 0.5,
          fontSize: 14, color: ACCENT, fontFace: bodyFont, bold: true,
        });
        break;
      }

      // ────────────────────────── TWO COLUMN ──────────────────────────
      case "two_column": {
        addEyebrow(slide, orPh(s.subtitle, "Overview"), PAD, PAD, W - PAD * 2);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: W - PAD * 2, h: 0.9,
          fontSize: 30, bold: true, color: ON_BG, fontFace: headFont,
        });
        const colW = (W - PAD * 3) / 2;
        const colY = 2.0;
        const colH = H - colY - PAD - 0.4;
        const renderCol = (x: number, heading: string, bullets: string[], accent: string) => {
          slide.addShape("roundRect", {
            x, y: colY, w: colW, h: colH, fill: { color: SURFACE }, line: { type: "none" }, rectRadius: 0.12,
          });
          slide.addShape("rect", { x: x + 0.4, y: colY + 0.5, w: 0.4, h: 0.06, fill: { color: accent } });
          slide.addText(orPh(heading, "Column"), {
            x: x + 0.4, y: colY + 0.7, w: colW - 0.8, h: 0.5,
            fontSize: 20, bold: true, color: ON_BG, fontFace: headFont,
          });
          slide.addText(
            orPhBullets(bullets, 4).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 8 } })),
            {
              x: x + 0.4, y: colY + 1.4, w: colW - 0.8, h: colH - 1.6,
              fontSize: 14, color: ON_BG, fontFace: bodyFont, valign: "top",
            },
          );
        };
        renderCol(PAD, s.leftColumn?.heading || "", s.leftColumn?.bullets || [], ACCENT);
        renderCol(PAD * 2 + colW, s.rightColumn?.heading || "", s.rightColumn?.bullets || [], SECONDARY);
        break;
      }

      // ────────────────────────── CLOSING ──────────────────────────
      case "closing": {
        if (!tplBg) paintBackground(slide, undefined, PRIMARY);
        slide.addShape("rect", { x: W / 2 - 1.5, y: H / 2 - 1.5, w: 3, h: 0.06, fill: { color: ACCENT } });
        slide.addText(orPh(s.title, "Thank you"), {
          x: PAD, y: H / 2 - 1.1, w: W - PAD * 2, h: 1.5,
          fontSize: 64, bold: true, color: "FFFFFF", fontFace: headFont, align: "center",
        });
        slide.addText(orPh(s.subtitle, "Questions? Let's talk."), {
          x: PAD, y: H / 2 + 0.8, w: W - PAD * 2, h: 0.6,
          fontSize: 22, color: "FFFFFF", fontFace: bodyFont, align: "center", transparency: 20,
        });
        break;
      }

      // ────────────────────────── BULLETS (default) ──────────────────────────
      case "bullets":
      default: {
        const tplFeature = templateImages.card || templateImages.heroSquare;
        const featureImg = slideImg || (idx > 0 && idx % 4 === 0 ? tplFeature : undefined);
        const hasFeature = !!featureImg;
        const contentW = hasFeature ? W - PAD * 3 - 4.8 : W - PAD * 2;

        addEyebrow(slide, orPh(s.subtitle, "Key points"), PAD, PAD, contentW);
        slide.addText(slideTitle, {
          x: PAD, y: PAD + 0.4, w: contentW, h: 0.9,
          fontSize: 32, bold: true, color: ON_BG, fontFace: headFont,
        });
        slide.addShape("rect", { x: PAD, y: PAD + 1.35, w: 0.5, h: 0.06, fill: { color: ACCENT } });
        slide.addText(
          orPhBullets(s.bullets, 5).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 12 } })),
          {
            x: PAD, y: PAD + 1.55, w: contentW, h: H - PAD * 2 - 1.55 - 0.4,
            fontSize: 18, color: ON_BG, fontFace: bodyFont, valign: "top",
          },
        );
        if (hasFeature && featureImg) {
          slide.addImage({
            data: featureImg, x: W - PAD - 4.8, y: PAD + 0.4, w: 4.8, h: H - PAD * 2 - 0.8,
            sizing: { type: "cover", w: 4.8, h: H - PAD * 2 - 0.8 },
            rounding: true,
          });
        }
        break;
      }
    }
  });

  return pptx.write({ outputType: "arraybuffer" }) as Promise<ArrayBuffer>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const auth = await requireUser(req, corsHeaders);
  if ("error" in auth) return auth.error;

  try {
    const body = (await req.json()) as DeckRequest;
    if (!body.topic || typeof body.topic !== "string") {
      return new Response(JSON.stringify({ error: "topic is required" }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    // If the user pasted explicit "Slide N:" blocks, honor that count (up to 60).
    const detected = detectPrestructuredSlides(body.topic);
    const slideCount = detected
      ? Math.max(3, Math.min(60, detected.count))
      : Math.max(3, Math.min(30, Number(body.slideCount) || 10));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing server configuration");
    }

    let outline: DeckOutline;
    if (body.prebuiltOutline && Array.isArray(body.prebuiltOutline.slides) && body.prebuiltOutline.slides.length) {
      outline = body.prebuiltOutline;
    } else {
      try {
        outline = await planDeck({ ...body, slideCount }, LOVABLE_API_KEY);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg === "RATE_LIMIT") {
          return new Response(JSON.stringify({ error: "Rate limit. Please try again." }), {
            status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        if (msg === "PAYMENT_REQUIRED") {
          return new Response(JSON.stringify({ error: "AI credits exhausted. Add credits in Settings → Workspace → Usage." }), {
            status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
        throw e;
      }
    }

    if (body.planOnly) {
      return new Response(JSON.stringify({
        success: true, planOnly: true, templateId: body.templateId,
        title: outline.title, subtitle: outline.subtitle,
        slideCount: outline.slides.length, palette: outline.palette, fonts: outline.fonts,
        slides: outline.slides.map((s) => ({ layout: s.layout, title: s.title })),
        outline,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const templateImages = await loadTemplateImages(body.templateId);
    const slideImages = await resolveSlideImages(outline, LOVABLE_API_KEY);
    const pptxBuffer = await buildPptx(outline, templateImages, slideImages);

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
    const safeName = outline.title.replace(/[^a-z0-9]+/gi, "-").toLowerCase().slice(0, 40) || "deck";
    const filename = `${crypto.randomUUID()}/${safeName}.pptx`;
    const { error: uploadError } = await supabase.storage
      .from("generated-decks")
      .upload(filename, new Uint8Array(pptxBuffer), {
        contentType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        upsert: false,
      });
    if (uploadError) throw new Error(`Upload failed: ${uploadError.message}`);

    const { data: pub } = supabase.storage.from("generated-decks").getPublicUrl(filename);

    return new Response(JSON.stringify({
      success: true,
      downloadUrl: pub.publicUrl,
      filename: `${safeName}.pptx`,
      templateId: body.templateId,
      title: outline.title, subtitle: outline.subtitle,
      slideCount: outline.slides.length, palette: outline.palette, fonts: outline.fonts,
      slides: outline.slides.map((s) => ({ layout: s.layout, title: s.title })),
      outline,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (e) {
    console.error("generate-deck error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
