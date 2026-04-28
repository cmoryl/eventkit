// PowerPoint Deck Generator - AI plans outline, pptxgenjs builds .pptx
import PptxGenJS from "https://esm.sh/pptxgenjs@3.12.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

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
}

interface DeckRequest {
  topic: string;
  audience?: string;
  slideCount: number;
  tone?: string;
  brand?: BrandStyle;
  themeOverride?: string; // free-form override "use a dark navy and gold theme"
  source?: ExtractedSource; // PDF-derived material
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
  const userPrompt = `Create a ${req.slideCount}-slide deck.

Topic: ${req.topic}
${req.audience ? `Audience: ${req.audience}` : ""}
${req.tone ? `Tone: ${req.tone}` : ""}
${req.themeOverride ? `Theme override: ${req.themeOverride}` : ""}
${req.brand ? `Brand colors available: primary ${req.brand.primary}, secondary ${req.brand.secondary}, accent ${req.brand.accent}. Brand fonts: ${req.brand.headingFont || "default"} / ${req.brand.bodyFont || "default"}.` : ""}

Pick a palette that fits the topic. If brand colors were provided and no theme override, use them. Use HEX colors WITHOUT the # prefix.`;

  const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      messages: [
        { role: "system", content: SYSTEM },
        { role: "user", content: userPrompt },
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

function buildPptx(outline: DeckOutline): Promise<ArrayBuffer> {
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

  outline.slides.forEach((s, idx) => {
    const slide = pptx.addSlide();
    slide.background = { color: BG };
    if (s.notes) slide.addNotes(s.notes);

    // Page number / footer (skip on title)
    if (idx > 0 && s.layout !== "title") {
      slide.addText(`${idx + 1} / ${outline.slides.length}`, {
        x: W - 1.2, y: H - 0.4, w: 0.8, h: 0.3,
        fontSize: 9, color: TEXT, fontFace: bodyFont, align: "right",
      });
      slide.addText(outline.title, {
        x: PAD, y: H - 0.4, w: W - 2, h: 0.3,
        fontSize: 9, color: TEXT, fontFace: bodyFont, transparency: 40,
      });
    }

    switch (s.layout) {
      case "title": {
        slide.background = { color: PRIMARY };
        // Accent bar
        slide.addShape("rect", { x: 0, y: H / 2 + 1.5, w: 1.5, h: 0.08, fill: { color: ACCENT } });
        slide.addText(s.title, {
          x: PAD, y: H / 2 - 1.5, w: W - PAD * 2, h: 2,
          fontSize: 60, bold: true, color: "FFFFFF", fontFace: headFont,
        });
        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: PAD, y: H / 2 + 0.8, w: W - PAD * 2, h: 0.7,
            fontSize: 22, color: "FFFFFF", fontFace: bodyFont, transparency: 20,
          });
        }
        break;
      }

      case "section": {
        slide.background = { color: SECONDARY };
        slide.addText(`0${idx + 1}`.slice(-2), {
          x: PAD, y: PAD, w: 2, h: 1, fontSize: 56, bold: true, color: ACCENT, fontFace: headFont,
        });
        slide.addText(s.title, {
          x: PAD, y: H / 2 - 0.8, w: W - PAD * 2, h: 1.6,
          fontSize: 48, bold: true, color: TEXT, fontFace: headFont,
        });
        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: PAD, y: H / 2 + 0.9, w: W - PAD * 2, h: 0.6,
            fontSize: 18, color: TEXT, fontFace: bodyFont, transparency: 30,
          });
        }
        break;
      }

      case "stat": {
        slide.addShape("rect", { x: 0, y: 0, w: 0.15, h: H, fill: { color: ACCENT } });
        slide.addText(s.title, {
          x: PAD, y: PAD, w: W - PAD * 2, h: 0.7,
          fontSize: 24, bold: true, color: TEXT, fontFace: headFont,
        });
        slide.addText(s.stat?.value || "—", {
          x: PAD, y: H / 2 - 1.5, w: W - PAD * 2, h: 2.5,
          fontSize: 130, bold: true, color: PRIMARY, fontFace: headFont, align: "center",
        });
        slide.addText(s.stat?.label || "", {
          x: PAD, y: H / 2 + 1.4, w: W - PAD * 2, h: 0.6,
          fontSize: 20, color: TEXT, fontFace: bodyFont, align: "center", transparency: 20,
        });
        break;
      }

      case "quote": {
        slide.background = { color: PRIMARY };
        slide.addText("\u201C", {
          x: PAD, y: PAD, w: 2, h: 2, fontSize: 180, color: ACCENT, fontFace: headFont, bold: true,
        });
        slide.addText(s.quote?.text || s.title, {
          x: PAD + 1, y: H / 2 - 1.5, w: W - PAD * 2 - 1, h: 2.5,
          fontSize: 32, italic: true, color: "FFFFFF", fontFace: headFont,
        });
        if (s.quote?.attribution) {
          slide.addText(`— ${s.quote.attribution}`, {
            x: PAD + 1, y: H / 2 + 1.5, w: W - PAD * 2 - 1, h: 0.5,
            fontSize: 16, color: ACCENT, fontFace: bodyFont,
          });
        }
        break;
      }

      case "two_column": {
        slide.addText(s.title, {
          x: PAD, y: PAD, w: W - PAD * 2, h: 0.8,
          fontSize: 32, bold: true, color: PRIMARY, fontFace: headFont,
        });
        const colW = (W - PAD * 3) / 2;
        const colY = PAD + 1.2;
        const colH = H - colY - PAD - 0.3;

        const renderCol = (x: number, heading: string, bullets: string[], headingColor: string) => {
          slide.addShape("rect", { x, y: colY, w: colW, h: 0.06, fill: { color: headingColor } });
          slide.addText(heading, {
            x, y: colY + 0.15, w: colW, h: 0.5,
            fontSize: 18, bold: true, color: TEXT, fontFace: headFont,
          });
          slide.addText(
            bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 6 } })),
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
        slide.background = { color: PRIMARY };
        slide.addText(s.title, {
          x: PAD, y: H / 2 - 1, w: W - PAD * 2, h: 1.5,
          fontSize: 56, bold: true, color: "FFFFFF", fontFace: headFont, align: "center",
        });
        if (s.subtitle) {
          slide.addText(s.subtitle, {
            x: PAD, y: H / 2 + 0.7, w: W - PAD * 2, h: 0.6,
            fontSize: 20, color: "FFFFFF", fontFace: bodyFont, align: "center", transparency: 20,
          });
        }
        slide.addShape("rect", { x: W / 2 - 0.75, y: H / 2 + 1.5, w: 1.5, h: 0.08, fill: { color: ACCENT } });
        break;
      }

      case "bullets":
      default: {
        slide.addShape("rect", { x: PAD, y: PAD + 0.95, w: 0.6, h: 0.06, fill: { color: ACCENT } });
        slide.addText(s.title, {
          x: PAD, y: PAD, w: W - PAD * 2, h: 0.9,
          fontSize: 32, bold: true, color: PRIMARY, fontFace: headFont,
        });
        const bullets = s.bullets || [];
        slide.addText(
          bullets.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 10 } })),
          {
            x: PAD, y: PAD + 1.4, w: W - PAD * 2, h: H - PAD * 2 - 1.4 - 0.4,
            fontSize: 18, color: TEXT, fontFace: bodyFont, valign: "top",
          },
        );
        break;
      }
    }
  });

  return pptx.write({ outputType: "arraybuffer" }) as Promise<ArrayBuffer>;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

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

    // 1) Plan outline via AI
    let outline: DeckOutline;
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

    // 2) Build .pptx
    const pptxBuffer = await buildPptx(outline);

    // 3) Upload to storage
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
      title: outline.title,
      subtitle: outline.subtitle,
      slideCount: outline.slides.length,
      palette: outline.palette,
      slides: outline.slides.map((s) => ({ layout: s.layout, title: s.title })),
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
