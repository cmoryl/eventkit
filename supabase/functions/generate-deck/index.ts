// PowerPoint Deck Generator - AI plans outline, pptxgenjs builds .pptx
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
  selectedImages?: { page: number; dataUrl: string }[]; // user-picked PDF page snapshots
}

interface DeckRequest {
  topic: string;
  audience?: string;
  slideCount: number;
  tone?: string;
  brand?: BrandStyle;
  themeOverride?: string; // free-form override "use a dark navy and gold theme"
  templateId?: string; // e.g. "transperfect-2026" — enables branded background imagery
  source?: ExtractedSource; // PDF-derived material
  prebuiltOutline?: DeckOutline; // skip AI planning and just build .pptx from this
  planOnly?: boolean; // when true, return outline only — skip .pptx build & upload
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

interface SlideOutline {
  layout: "title" | "section" | "bullets" | "two_column" | "stat" | "quote" | "closing";
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
}

interface DeckOutline {
  title: string;
  subtitle: string;
  palette: { primary: string; secondary: string; accent: string; background: string; text: string };
  fonts: { heading: string; body: string };
  slides: SlideOutline[];
}

const SYSTEM = `You are a senior presentation designer. Output a structured deck outline that follows pitch-deck best practices: clear narrative arc, varied layouts, concise text (max 6 bullets/slide, max 12 words/bullet), strong opening and closing.

Layout rules:
- Slide 1 must be "title"
- Final slide should be "closing" (call to action / thank you)
- Mix layouts (don't use "bullets" for every content slide) — use "two_column", "stat", "quote", "section" for variety
- Section dividers ("section") help break up long decks
- Always include speaker notes (1-3 sentences per slide)`;

async function planDeck(req: DeckRequest, apiKey: string): Promise<DeckOutline> {
  const src = req.source;
  const sourceBlock = src
    ? `\n\n=== SOURCE DOCUMENT ${src.fileName ? `(${src.fileName})` : ""} ===
Influence: ${src.influence ?? 70}/100 — ${(src.influence ?? 70) >= 70 ? "stay very close to source" : (src.influence ?? 70) >= 40 ? "primary inspiration" : "light reference"}
Scope: ${[src.scope?.text && "text", src.scope?.imagery && "imagery", src.scope?.lookAndFeel && "look-and-feel"].filter(Boolean).join(", ") || "all"}

Summary: ${src.summary || "(none)"}

${src.outline?.length ? `Outline:\n${src.outline.map((o) => `• ${o.heading}\n${o.bullets.map((b) => `   - ${b}`).join("\n")}`).join("\n")}` : ""}

${src.keyFacts?.length ? `Key facts:\n${src.keyFacts.map((f) => `- ${f}`).join("\n")}` : ""}

${src.quotes?.length ? `Quotes:\n${src.quotes.map((q) => `"${q.text}"${q.attribution ? ` — ${q.attribution}` : ""}`).join("\n")}` : ""}

${src.scope?.lookAndFeel && src.lookAndFeel ? `Source look-and-feel: palette ${(src.lookAndFeel.palette || []).join(", ")}; fonts ${src.lookAndFeel.headingFont || "?"} / ${src.lookAndFeel.bodyFont || "?"}; mood ${src.lookAndFeel.mood || "?"}. ${src.lookAndFeel.description || ""}` : ""}

${src.scope?.imagery && src.imageDescriptions?.length ? `Imagery cues to evoke (describe in speaker notes):\n${src.imageDescriptions.map((d) => `- ${d}`).join("\n")}` : ""}
=== END SOURCE ===

Use the source material as the primary content backbone proportional to the influence level. Faithfully preserve facts and quotes; do not invent contradicting data.`
    : "";

  const userPrompt = `Create a ${req.slideCount}-slide deck.

Topic: ${req.topic}
${req.audience ? `Audience: ${req.audience}` : ""}
${req.tone ? `Tone: ${req.tone}` : ""}
${req.themeOverride ? `Theme override: ${req.themeOverride}` : ""}
${req.brand ? `Brand colors available: primary ${req.brand.primary}, secondary ${req.brand.secondary}, accent ${req.brand.accent}. Brand fonts: ${req.brand.headingFont || "default"} / ${req.brand.bodyFont || "default"}.` : ""}
${sourceBlock}

Pick a palette that fits the topic. Priority: theme override > brand > source look-and-feel > your judgement. Use HEX colors WITHOUT the # prefix.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM },
        {
          role: "user",
          content: src?.selectedImages?.length
            ? [
                { type: "text", text: userPrompt + `\n\nThe user attached ${src.selectedImages.length} reference page image(s) from the source PDF (page numbers: ${src.selectedImages.map((i) => i.page).join(", ")}). Use these as primary visual & layout inspiration — match their imagery, color tone, layout style, and information hierarchy where appropriate. Reference them in speaker notes (e.g. "based on PDF p.${src.selectedImages[0].page}").` },
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
            description: "Return a complete deck outline.",
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
                      layout: { type: "string", enum: ["title", "section", "bullets", "two_column", "stat", "quote", "closing"] },
                      title: { type: "string" },
                      subtitle: { type: "string" },
                      bullets: { type: "array", items: { type: "string" } },
                      leftColumn: {
                        type: "object",
                        properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } },
                      },
                      rightColumn: {
                        type: "object",
                        properties: { heading: { type: "string" }, bullets: { type: "array", items: { type: "string" } } },
                      },
                      stat: {
                        type: "object",
                        properties: { value: { type: "string" }, label: { type: "string" } },
                      },
                      quote: {
                        type: "object",
                        properties: { text: { type: "string" }, attribution: { type: "string" } },
                      },
                      notes: { type: "string" },
                      designNotes: { type: "string", description: "Internal AI guidance — not shown on the slide. Mirror what the user wrote." },
                      visualIntent: { type: "string", enum: ["auto", "photo", "infographic", "chart", "icon-grid", "screenshot", "none"] },
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
  return JSON.parse(args) as DeckOutline;
}

// Map of template id -> bundled background images (public URLs)
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

/**
 * Generate or fetch one feature image per slide.
 * Priority:
 *  1. First user-uploaded reference (s.references[0]) — fetched & embedded as-is
 *  2. AI-generated image via Gemini Flash Image when visualIntent indicates imagery
 *  3. undefined → renderer falls back to template feature image
 */
async function resolveSlideImages(
  outline: DeckOutline,
  apiKey: string,
): Promise<Array<string | undefined>> {
  const palette = outline.palette;
  const moodDesc = `Brand palette: primary ${palette.primary}, secondary ${palette.secondary}, accent ${palette.accent}. Background ${palette.background}. Cohesive, on-brand, premium editorial style.`;

  return Promise.all(
    outline.slides.map(async (s) => {
      try {
        // 1) User-provided reference
        const userRef = s.references?.[0]?.url;
        if (userRef) {
          const data = await fetchAsDataUrl(userRef);
          if (data) return data;
        }

        // 2) AI-generated when intent calls for imagery
        const intent = s.visualIntent || "auto";
        if (intent === "none" || intent === "chart") return undefined;
        // Only generate for layouts that have room for a feature image
        const layoutWantsImage =
          s.layout === "bullets" ||
          s.layout === "stat" ||
          s.layout === "section" ||
          s.layout === "title" ||
          s.layout === "closing" ||
          s.layout === "two_column";
        if (!layoutWantsImage) return undefined;

        const styleHint =
          intent === "photo" ? "photorealistic editorial photograph, natural light, no text, no logos"
          : intent === "infographic" ? "minimal flat infographic illustration, geometric shapes, no text, no logos"
          : intent === "icon-grid" ? "set of minimal line icons in a clean grid, no text, no logos"
          : intent === "screenshot" ? "abstract product UI screenshot, soft glassmorphism, no readable text"
          : "clean abstract editorial illustration, no text, no logos";

        const prompt = `${styleHint}. Subject: "${s.title}". ${s.designNotes ? `Context: ${s.designNotes}.` : ""} ${moodDesc} Aspect 4:3. ABSOLUTELY NO TEXT, NO WORDS, NO LETTERS, NO LOGOS in the image.`;

        const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash-image",
            messages: [{ role: "user", content: prompt }],
            modalities: ["image", "text"],
          }),
        });
        if (!r.ok) {
          console.warn(`[slide-image] gen failed (${r.status}) for "${s.title}"`);
          return undefined;
        }
        const j = await r.json();
        const url: string | undefined = j?.choices?.[0]?.message?.images?.[0]?.image_url?.url;
        return url;
      } catch (e) {
        console.warn("[slide-image] error:", e instanceof Error ? e.message : e);
        return undefined;
      }
    }),
  );
}

function buildPptx(outline: DeckOutline, templateImages: Record<string, string> = {}, slideImages: Array<string | undefined> = []): Promise<ArrayBuffer> {
  const pptx = new PptxGenJS();
  pptx.layout = "LAYOUT_WIDE"; // 13.33 x 7.5
  pptx.title = outline.title;
  pptx.author = "EventKIT PowerPoint Agent";

  const W = 13.33;
  const H = 7.5;
  const PAD = 0.6;
  const p = outline.palette;
  const headFont = outline.fonts.heading || "Calibri";
  const bodyFont = outline.fonts.body || "Calibri";
  const clean = (c: string) => c.replace("#", "").toUpperCase();

  const PRIMARY = clean(p.primary);
  const SECONDARY = clean(p.secondary);
  const ACCENT = clean(p.accent);
  const BG = clean(p.background);
  const TEXT = clean(p.text);

  // Pick a background image for a given layout from the template library
  const bgFor = (layout: string): string | undefined => {
    if (!templateImages || Object.keys(templateImages).length === 0) return undefined;
    switch (layout) {
      case "title": return templateImages.hero;
      case "closing": return templateImages.hero;
      case "section": return templateImages.sectionBg;
      case "quote": return templateImages.heroSquare || templateImages.hero;
      case "stat": return templateImages.card;
      case "two_column": return templateImages.lightPattern;
      case "bullets":
      default: return templateImages.lightPattern;
    }
  };

  const paintTemplateBackground = (slide: any, image?: string) => {
    slide.background = { color: BG };
    if (!image) return;
    slide.addImage({
      data: image,
      x: 0, y: 0, w: W, h: H,
      sizing: { type: "cover", x: 0, y: 0, w: W, h: H },
    });
  };

  // Fallback placeholder content (used when AI returns sparse fields)
  const ph = {
    title: "Untitled slide",
    subtitle: "Add a subtitle to introduce this section",
    sectionLabel: "Section",
    bullet: [
      "Headline point — replace with your key message",
      "Supporting detail — explain the context",
      "Outcome or proof point — quantify the impact",
      "Action — what the audience should take away",
    ],
    statValue: "00%",
    statLabel: "Replace with your headline metric",
    quote: "Add a memorable quote that anchors this slide.",
    quoteAttribution: "Speaker · Title",
    columnHeading: "Column heading",
    closingTitle: "Thank you",
    closingSubtitle: "Questions? Let's talk.",
  };
  const orPh = (v: string | undefined | null, fallback: string) =>
    v && v.trim().length > 0 ? v : fallback;
  const orPhBullets = (arr: string[] | undefined, count = 4): string[] => {
    const list = (arr || []).filter((b) => b && b.trim().length > 0);
    if (list.length >= 1) return list;
    return ph.bullet.slice(0, count);
  };

  outline.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    const tplBg = bgFor(s.layout);
    paintTemplateBackground(slide, tplBg);
    if (s.notes) slide.addNotes(s.notes);
    const slideImg = slideImages[idx]; // user upload OR AI-generated feature image

    const slideTitle = orPh(s.title, ph.title);

    // Page number / footer (skip on title)
    if (idx > 0 && s.layout !== "title") {
      slide.addText(`${idx + 1} / ${outline.slides.length}`, {
        x: W - 1.2, y: H - 0.4, w: 0.8, h: 0.3,
        fontSize: 9, color: TEXT, fontFace: bodyFont, align: "right",
      });
      slide.addText(outline.title || "Presentation", {
        x: PAD, y: H - 0.4, w: W - 2, h: 0.3,
        fontSize: 9, color: TEXT, fontFace: bodyFont, transparency: 40,
      });
    }

    switch (s.layout) {
      case "title": {
        if (!tplBg) slide.background = { color: PRIMARY };
        // Accent bar
        slide.addShape("rect", { x: 0, y: H / 2 + 1.5, w: 1.5, h: 0.08, fill: { color: ACCENT } });
        slide.addText(slideTitle, {
          x: PAD, y: H / 2 - 1.5, w: W - PAD * 2, h: 2,
          fontSize: 60, bold: true, color: "FFFFFF", fontFace: headFont,
        });
        slide.addText(orPh(s.subtitle, ph.subtitle), {
          x: PAD, y: H / 2 + 0.8, w: W - PAD * 2, h: 0.7,
          fontSize: 22, color: "FFFFFF", fontFace: bodyFont, transparency: 20,
        });
        break;
      }

      case "section": {
        if (!tplBg) slide.background = { color: SECONDARY };
        slide.addText(`0${idx + 1}`.slice(-2), {
          x: PAD, y: PAD, w: 2, h: 1, fontSize: 56, bold: true, color: ACCENT, fontFace: headFont,
        });
        slide.addText(slideTitle, {
          x: PAD, y: H / 2 - 0.8, w: W - PAD * 2, h: 1.6,
          fontSize: 48, bold: true, color: TEXT, fontFace: headFont,
        });
        slide.addText(orPh(s.subtitle, ph.sectionLabel), {
          x: PAD, y: H / 2 + 0.9, w: W - PAD * 2, h: 0.6,
          fontSize: 18, color: TEXT, fontFace: bodyFont, transparency: 30,
        });
        break;
      }

      case "stat": {
        slide.addShape("rect", { x: 0, y: 0, w: 0.15, h: H, fill: { color: ACCENT } });
        slide.addText(slideTitle, {
          x: PAD, y: PAD, w: W - PAD * 2, h: 0.7,
          fontSize: 24, bold: true, color: TEXT, fontFace: headFont,
        });
        slide.addText(orPh(s.stat?.value, ph.statValue), {
          x: PAD, y: H / 2 - 1.5, w: W - PAD * 2, h: 2.5,
          fontSize: 130, bold: true, color: PRIMARY, fontFace: headFont, align: "center",
        });
        slide.addText(orPh(s.stat?.label, ph.statLabel), {
          x: PAD, y: H / 2 + 1.4, w: W - PAD * 2, h: 0.6,
          fontSize: 20, color: TEXT, fontFace: bodyFont, align: "center", transparency: 20,
        });
        break;
      }

      case "quote": {
        if (!tplBg) slide.background = { color: PRIMARY };
        slide.addText("\u201C", {
          x: PAD, y: PAD, w: 2, h: 2, fontSize: 180, color: ACCENT, fontFace: headFont, bold: true,
        });
        slide.addText(orPh(s.quote?.text, orPh(s.title, ph.quote)), {
          x: PAD + 1, y: H / 2 - 1.5, w: W - PAD * 2 - 1, h: 2.5,
          fontSize: 32, italic: true, color: "FFFFFF", fontFace: headFont,
        });
        slide.addText(`— ${orPh(s.quote?.attribution, ph.quoteAttribution)}`, {
          x: PAD + 1, y: H / 2 + 1.5, w: W - PAD * 2 - 1, h: 0.5,
          fontSize: 16, color: ACCENT, fontFace: bodyFont,
        });
        break;
      }

      case "two_column": {
        slide.addText(slideTitle, {
          x: PAD, y: PAD, w: W - PAD * 2, h: 0.8,
          fontSize: 32, bold: true, color: PRIMARY, fontFace: headFont,
        });
        const colW = (W - PAD * 3) / 2;
        const colY = PAD + 1.2;
        const colH = H - colY - PAD - 0.3;

        const renderCol = (x: number, heading: string, bullets: string[], headingColor: string) => {
          slide.addShape("rect", { x, y: colY, w: colW, h: 0.06, fill: { color: headingColor } });
          slide.addText(orPh(heading, ph.columnHeading), {
            x, y: colY + 0.15, w: colW, h: 0.5,
            fontSize: 18, bold: true, color: TEXT, fontFace: headFont,
          });
          slide.addText(
            orPhBullets(bullets, 3).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 6 } })),
            {
              x, y: colY + 0.8, w: colW, h: colH - 0.8,
              fontSize: 14, color: TEXT, fontFace: bodyFont, valign: "top",
            },
          );
        };

        renderCol(PAD, s.leftColumn?.heading || "", s.leftColumn?.bullets || [], PRIMARY);
        renderCol(PAD * 2 + colW, s.rightColumn?.heading || "", s.rightColumn?.bullets || [], ACCENT);
        break;
      }

      case "closing": {
        if (!tplBg) slide.background = { color: PRIMARY };
        slide.addText(orPh(s.title, ph.closingTitle), {
          x: PAD, y: H / 2 - 1, w: W - PAD * 2, h: 1.5,
          fontSize: 56, bold: true, color: "FFFFFF", fontFace: headFont, align: "center",
        });
        slide.addText(orPh(s.subtitle, ph.closingSubtitle), {
          x: PAD, y: H / 2 + 0.7, w: W - PAD * 2, h: 0.6,
          fontSize: 20, color: "FFFFFF", fontFace: bodyFont, align: "center", transparency: 20,
        });
        slide.addShape("rect", { x: W / 2 - 0.75, y: H / 2 + 1.5, w: 1.5, h: 0.08, fill: { color: ACCENT } });
        break;
      }

      case "bullets":
      default: {
        // Feature image: prefer per-slide image (user upload or AI), else template fallback
        const tplFeature = templateImages.card || templateImages.heroSquare;
        const featureImg = slideImg || (idx > 0 && idx % 3 === 0 ? tplFeature : undefined);
        const hasFeature = !!featureImg;
        const contentW = hasFeature ? W - PAD * 3 - 4.5 : W - PAD * 2;

        slide.addShape("rect", { x: PAD, y: PAD + 0.95, w: 0.6, h: 0.06, fill: { color: ACCENT } });
        slide.addText(slideTitle, {
          x: PAD, y: PAD, w: contentW, h: 0.9,
          fontSize: 32, bold: true, color: PRIMARY, fontFace: headFont,
        });
        slide.addText(
          orPhBullets(s.bullets, 4).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 10 } })),
          {
            x: PAD, y: PAD + 1.4, w: contentW, h: H - PAD * 2 - 1.4 - 0.4,
            fontSize: 18, color: TEXT, fontFace: bodyFont, valign: "top",
          },
        );
        if (hasFeature && featureImg) {
          slide.addImage({
            data: featureImg,
            x: W - PAD - 4.5, y: PAD + 1.4, w: 4.5, h: H - PAD * 2 - 1.8,
            sizing: { type: "cover", w: 4.5, h: H - PAD * 2 - 1.8 },
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
    const slideCount = Math.max(3, Math.min(30, Number(body.slideCount) || 10));

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SERVICE_ROLE) {
      throw new Error("Missing server configuration");
    }

    // 1) Plan outline via AI (or use prebuilt one for re-renders after editing)
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

    // 2) If planOnly, return outline now — client will edit then re-call with prebuiltOutline
    if (body.planOnly) {
      return new Response(JSON.stringify({
        success: true,
        planOnly: true,
        templateId: body.templateId,
        title: outline.title,
        subtitle: outline.subtitle,
        slideCount: outline.slides.length,
        palette: outline.palette,
        fonts: outline.fonts,
        slides: outline.slides.map((s) => ({ layout: s.layout, title: s.title })),
        outline,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // 3) Build .pptx
    const templateImages = await loadTemplateImages(body.templateId);
    const pptxBuffer = await buildPptx(outline, templateImages);

    // 4) Upload to storage
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
      title: outline.title,
      subtitle: outline.subtitle,
      slideCount: outline.slides.length,
      palette: outline.palette,
      fonts: outline.fonts,
      slides: outline.slides.map((s) => ({ layout: s.layout, title: s.title })),
      outline,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-deck error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
